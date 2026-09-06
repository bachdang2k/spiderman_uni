// Composes the one hand in `hand.ts` into the two lines the story ends on.
//
// A word becomes a single pen path: glyph bodies are appended head-to-tail and the spline
// draws the ligature between them, so `iệu` really is one gesture and an `o` really does
// hand over from its top. The output is plain SVG path data plus the pen's pauses, which is
// all the particle layer needs — it samples the paths at runtime with `getPointAtLength`.

import { splinePath } from '../../lib/spline'
import { GLYPHS, METRICS, type Point } from './hand'

export type PenStroke = {
  /** SVG path data in em units, y-down, baseline at `METRICS.baseline`. */
  d: string
  /** Seconds the pen rests before starting this stroke. */
  pauseBefore: number
}

export type Script = {
  strokes: PenStroke[]
  /** Ink bounds in em units. */
  bounds: { x: number; y: number; width: number; height: number }
  /** Baseline-to-cap distance in em units — the measure both lines are sized against. */
  capHeight: number
}

/** How long the pen rests, in seconds, before each kind of stroke. */
const PAUSE = {
  withinWord: 0.06,
  betweenWords: 0.11,
  betweenLines: 0.2,
  /** §7.4 — long enough for the eye to read the base line as finished. */
  beforeDeferredMarks: 0.35,
  betweenDeferredMarks: 0.09,
  /** A mark taken in its stride, without the pen ever going back. */
  inlineMark: 0.05,
}

export const CAP_HEIGHT = METRICS.baseline - METRICS.cap

/**
 * A letter whose pen leaves it above this height hands over from the top — `o`, `w`, `W`.
 * The next letter then skips its entry upstroke and is joined across the top instead, because
 * dropping to the join line and climbing straight back up carves a valley the reader counts
 * as an extra stroke: it is what turns `Would` into `Mould`.
 */
const HIGH_HANDOVER = -5

/** Every glyph leans by the same amount, so the two lines cannot drift into two hands. */
const lean = ([x, y]: Point): Point => [x - y * METRICS.slant, y]

const shift = (points: Point[], dx: number, dy: number): Point[] =>
  points.map(([x, y]) => lean([x + dx, y + dy]))

type Pending = { points: Point[]; corners: number[] }

/**
 * @param lines  Text laid out on one or more lines, already broken at phrase boundaries.
 * @param marks  `deferred` sends every mark to the end behind a pause, the way a person
 *               finishes a word and then goes back for the diacritics. `inline` takes each
 *               mark in its stride so the pen never travels backwards.
 */
export function composeScript(lines: string[], marks: 'deferred' | 'inline'): Script {
  const strokes: PenStroke[] = []
  const deferred: PenStroke[] = []
  const all: Point[] = []
  const lineHeight = CAP_HEIGHT * 1.72
  let first = true

  const emit = (points: Point[], corners: number[], pauseBefore: number, hold: PenStroke[]) => {
    all.push(...points)
    hold.push({ d: splinePath(points, corners), pauseBefore: first ? 0 : pauseBefore })
    first = false
  }

  lines.forEach((line, lineIndex) => {
    const dy = lineIndex * lineHeight
    let pen = 0
    let wordStart = true

    for (const word of line.split(' ')) {
      const running: Pending = { points: [], corners: [] }
      const wordMarks: PenStroke[] = []
      let pausePending = wordStart ? PAUSE.betweenWords : PAUSE.betweenWords
      if (lineIndex > 0 && wordStart) pausePending = PAUSE.betweenLines

      const flush = (pause: number) => {
        if (running.points.length < 2) return
        emit(running.points, [...running.corners], pause, strokes)
        running.points = []
        running.corners = []
      }

      for (const character of word) {
        const glyph = GLYPHS[character]
        if (!glyph) throw new Error(`No glyph authored for "${character}"`)

        for (const lead of glyph.lead ?? []) {
          flush(pausePending)
          pausePending = PAUSE.withinWord
          emit(shift(lead, pen, dy), [], pausePending, strokes)
          pausePending = PAUSE.withinWord
        }

        const previous = running.points.at(-1)
        let trimmed = 0
        if (previous && previous[1] < HIGH_HANDOVER) {
          while (trimmed < glyph.main.length - 2 && glyph.main[trimmed][1] > HIGH_HANDOVER) {
            trimmed += 1
          }
        }
        const offset = running.points.length - trimmed
        for (const index of glyph.corners ?? []) {
          if (index >= trimmed) running.corners.push(offset + index)
        }
        running.points.push(...shift(glyph.main.slice(trimmed), pen, dy))

        for (const mark of glyph.marks ?? []) {
          const points = shift(mark.points, pen, dy)
          all.push(...points)
          wordMarks.push({ d: splinePath(points), pauseBefore: PAUSE.betweenDeferredMarks })
        }
        pen += glyph.advance
      }

      flush(pausePending)
      pen += METRICS.wordGap
      wordStart = false

      if (marks === 'inline') {
        wordMarks.forEach((mark) => strokes.push({ ...mark, pauseBefore: PAUSE.inlineMark }))
      } else {
        deferred.push(...wordMarks)
      }
    }
  })

  if (deferred.length > 0) {
    deferred[0] = { ...deferred[0], pauseBefore: PAUSE.beforeDeferredMarks }
    strokes.push(...deferred)
  }

  const xs = all.map(([x]) => x)
  const ys = all.map(([, y]) => y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  return {
    strokes,
    bounds: {
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    },
    capHeight: CAP_HEIGHT,
  }
}
