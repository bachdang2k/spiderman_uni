// Turns a composed line of handwriting into particle targets and, more importantly, into the
// moment each particle is allowed to land. The pen has to move the way a hand moves — quick
// through the long open strokes, slow through turns and joins — so the deposit order is
// derived from the path's own curvature rather than from a linear sweep.

import type { Script } from '../../assets/lettering/lines'
import { gaussian, random } from '../noise'

export type ScriptTargets = {
  count: number
  /** World-space targets, one vec3 per particle, interleaved. */
  positions: Float32Array
  /** When each particle lands, as a fraction of the writing phase. */
  writes: Float32Array
}

export type ScriptPlacement = {
  /** Em units to world units. */
  scale: number
  /** World position of the ink's centre. */
  centerX: number
  centerY: number
}

/** How much a tight turn slows the pen down. Zero would be a machine drawing a path. */
const TURN_DRAG = 2.6

/** Eases into the first letter and out of the last without touching the pauses. */
const EASE_DEPTH = 0.3

const easePenIn = (p: number) => p + (EASE_DEPTH * Math.sin(Math.PI * 2 * p)) / (Math.PI * 2)

/**
 * Particles start flying a little before the pen reaches their spot and settle a little after,
 * so the writing has a soft leading edge instead of a hard line. The phase reserves room at
 * both ends for that travel.
 */
const LEAD_IN = 0.055
const TAIL = 0.03

type MeasuredStroke = {
  length: number
  /** The stroke resampled at even arc length: xy pairs, plus the pen cost reached at each. */
  points: Float32Array
  cost: Float32Array
  step: number
  totalCost: number
  pauseBefore: number
}

function measure(script: Script) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden'
  document.body.appendChild(svg)

  const strokes: MeasuredStroke[] = script.strokes.map((stroke) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', stroke.d)
    svg.appendChild(path)
    const length = Math.max(0.001, path.getTotalLength())
    // Resampled once, then read by interpolation. Measuring the SVG per particle would mean
    // hundreds of thousands of layout calls on the main thread, which is enough to hang a tab.
    const samples = Math.min(900, Math.max(16, Math.round(length * 6)))
    const step = length / samples
    const points = new Float32Array((samples + 1) * 2)
    const cost = new Float32Array(samples + 1)

    let previousAngle: number | null = null
    let running = 0
    for (let i = 0; i <= samples; i += 1) {
      const point = path.getPointAtLength(i * step)
      points[i * 2] = point.x
      points[i * 2 + 1] = point.y
      if (i > 0) {
        const dx = points[i * 2] - points[i * 2 - 2]
        const dy = points[i * 2 + 1] - points[i * 2 - 1]
        const angle = Math.atan2(dy, dx)
        if (previousAngle !== null) {
          let turn = Math.abs(angle - previousAngle)
          if (turn > Math.PI) turn = Math.PI * 2 - turn
          running += step + TURN_DRAG * turn * 0.35
        } else {
          running += step
        }
        previousAngle = angle
      }
      cost[i] = running
    }
    return { length, points, cost, step, totalCost: running, pauseBefore: stroke.pauseBefore }
  })

  return { svg, strokes }
}

/**
 * @param seconds  Wall-clock length of the writing phase. Pauses inside the line are absolute,
 *                 so `§7.4`'s 250–400ms before the diacritics stays 250–400ms whatever else moves.
 */
export function sampleScript(
  script: Script,
  options: {
    count: number
    seconds: number
    placement: ScriptPlacement
    /** Perpendicular spread in em units, so the stroke has thickness instead of reading as wire. */
    scatter: number
    /** Depth spread in em units. */
    depth: number
    seed: number
  },
): ScriptTargets {
  const { svg, strokes } = measure(script)
  svg.remove()
  const positions = new Float32Array(options.count * 3)
  const writes = new Float32Array(options.count)

  const totalCost = strokes.reduce((sum, s) => sum + s.totalCost, 0)
  const totalPause = strokes.reduce((sum, s) => sum + s.pauseBefore, 0)
  // Strictly by length, so every stroke carries the same ink density. A floor for the short
  // strokes was worse than the problem it solved: it packed hundreds of particles into a
  // diacritic and burned it out next to the letters it belongs to.
  const weights = strokes.map((s) => s.length)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  const drawSeconds = Math.max(options.seconds * 0.35, options.seconds - totalPause)

  const { scale, centerX, centerY } = options.placement
  const midX = script.bounds.x + script.bounds.width / 2
  const midY = script.bounds.y + script.bounds.height / 2

  let written = 0
  let costBefore = 0
  let pauseBefore = 0
  strokes.forEach((stroke, index) => {
    pauseBefore += stroke.pauseBefore
    const share =
      index === strokes.length - 1
        ? options.count - written
        : Math.round((weights[index] / totalWeight) * options.count)

    const last = stroke.cost.length - 1
    for (let i = 0; i < share; i += 1) {
      const particle = written + i
      const seed = options.seed + particle * 1.37
      // Stratified along the stroke so the ink density stays even.
      const along = ((i + random(seed * 2.9)) / share) * stroke.length
      const exact = Math.min(last - 1e-4, along / stroke.step)
      const slot = Math.min(last - 1, Math.floor(exact))
      const blend = exact - slot
      const ax = stroke.points[slot * 2]
      const ay = stroke.points[slot * 2 + 1]
      const tx = stroke.points[slot * 2 + 2] - ax
      const ty = stroke.points[slot * 2 + 3] - ay
      const norm = Math.max(1e-4, Math.hypot(tx, ty))
      const spread = gaussian(seed * 5.3) * options.scatter

      const emX = ax + tx * blend + (-ty / norm) * spread
      const emY = ay + ty * blend + (tx / norm) * spread
      const offset = particle * 3
      positions[offset] = (emX - midX) * scale + centerX
      positions[offset + 1] = -(emY - midY) * scale + centerY
      positions[offset + 2] = gaussian(seed * 7.1) * options.depth * scale

      const progress = (costBefore + stroke.cost[slot]) / totalCost
      const at = pauseBefore + easePenIn(progress) * drawSeconds
      const fractionOfPhase = Math.min(1, Math.max(0, at / options.seconds))
      writes[particle] =
        LEAD_IN + (1 - LEAD_IN - TAIL) * fractionOfPhase + gaussian(seed * 9.7) * 0.004
    }

    written += share
    costBefore += stroke.totalCost
  })

  return { count: options.count, positions, writes }
}
