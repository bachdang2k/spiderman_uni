// ONE HAND — the monoline cursive script both closing lines are written in.
//
// Authored for this project. No third-party lettering asset is traced, extracted or
// approximated here: every glyph below is a hand-placed pen path in a shared metric box,
// so the name and the question share one slant, one stroke weight, one set of joins and
// one family of terminals.
//
// Coordinate system (SVG convention, y grows downward):
//
//   ASCENDER  -17.2  ── loops of h, l, d
//   CAP       -16.4  ── D, L, W
//   X_TOP      -9.4  ── top of n, o, e …
//   JOIN        0.0  ── where one letter hands over to the next
//   BASELINE    2.4  ── bottom of the x-height letters
//   DESCENDER   9.4  ── tail of y
//
// A glyph's `main` polyline starts at its local origin `(0, JOIN)` and is appended straight
// onto the word's running polyline, so a word is one uninterrupted pen path. Letters that
// join from the top (o, w) simply end high and let the spline draw the descending ligature
// into the next letter. A `lead` stroke is drawn before `main` and does not connect — only
// the capital D needs one, which §7.4 of the direction explicitly allows.

export type Point = [number, number]

export type Mark = {
  /** Short stroke: a tittle, a circumflex, a dot below, a crossbar. */
  points: Point[]
}

export type Glyph = {
  advance: number
  /** Strokes drawn before `main`, not connected to the word's running path. */
  lead?: Point[][]
  /** The connected body of the letter, appended to the word's running path. */
  main: Point[]
  /** Indices into `main` that must stay sharp instead of being rounded by the spline. */
  corners?: number[]
  /** Marks the pen has to come back for. Deferred in the name, in-sequence in the question. */
  marks?: Mark[]
}

export const METRICS = {
  ascender: -17.2,
  cap: -16.4,
  xTop: -9.4,
  join: 0,
  baseline: 2.4,
  descender: 9.4,
  /** Rightward lean applied to every glyph at compose time, so the two lines cannot drift apart. */
  slant: 0.1,
  /** Pen travel between two words. */
  wordGap: 7.4,
}

const tittle = (x: number): Mark => ({
  points: [
    [x - 0.7, -13.25],
    [x + 0.7, -13.75],
  ],
})

const circumflex = (x: number): Mark => ({
  points: [
    [x - 1.8, -12.4],
    [x, -14.9],
    [x + 1.8, -12.6],
  ],
})

const dotBelow = (x: number): Mark => ({
  points: [
    [x - 0.7, 5.35],
    [x + 0.7, 5.85],
  ],
})

const crossbar = (x: number): Mark => ({
  points: [
    [x - 2.2, -10.9],
    [x + 0.3, -11.5],
    [x + 2.8, -12.0],
  ],
})

const lower = {
  a: {
    advance: 11.83,
    main: [
      [0.0, 0.0],
      [2.44, -4.0],
      [5.1, -8.2],
      [6.73, -9.5],
      [4.41, -9.5],
      [1.97, -7.0],
      [1.86, -3.0],
      [3.25, 1.1],
      [5.8, 2.4],
      [7.89, 0.4],
      [8.47, -4.6],
      [8.35, -9.2],
      [8.82, -4.0],
      [9.05, 2.0],
      [10.32, 1.5],
    ],
    corners: [11],
  },
  c: {
    advance: 10.21,
    main: [
      [0.0, 0.0],
      [2.44, -4.0],
      [4.99, -8.2],
      [6.73, -9.5],
      [4.41, -9.5],
      [2.09, -7.0],
      [1.86, -3.2],
      [3.36, 1.2],
      [5.92, 2.4],
      [8.35, 1.4],
    ],
  },
  d: {
    advance: 12.76,
    main: [
      [0.0, 0.0],
      [2.44, -4.0],
      [5.1, -8.2],
      [6.73, -9.5],
      [4.41, -9.5],
      [1.97, -7.0],
      [1.86, -3.0],
      [3.25, 1.1],
      [5.8, 2.4],
      [7.89, 0.4],
      [8.58, -5.2],
      [9.05, -11.4],
      [9.28, -17.0],
      [9.86, -11.0],
      [9.98, -4.6],
      [10.09, 2.0],
      [11.37, 1.5],
    ],
  },
  e: {
    advance: 9.6,
    main: [
      [0.0, 0.0],
      [2.04, -2.8],
      [4.08, -6.4],
      [4.44, -9.0],
      [2.64, -9.6],
      [1.08, -7.6],
      [1.2, -3.6],
      [2.88, 0.2],
      [5.28, 2.4],
      [7.68, 1.4],
    ],
  },
  h: {
    advance: 13.5,
    main: [
      [0.0, 0.0],
      [0.9, -6.4],
      [1.9, -13.4],
      [2.8, -17.2],
      [4.0, -14.6],
      [3.9, -9.4],
      [3.7, -4.4],
      [3.5, -0.4],
      [3.4, 2.2],
      [4.1, 2.5],
      [4.9, 2.1],
      [5.6, 0.0],
      [6.2, -3.4],
      [6.9, -6.8],
      [7.8, -8.9],
      [8.9, -9.5],
      [10.0, -8.9],
      [10.7, -6.6],
      [11.2, -3.0],
      [11.5, 0.4],
      [11.8, 2.2],
      [12.9, 1.6],
    ],
  },
  i: {
    advance: 7.6,
    main: [
      [0.0, 0.0],
      [0.9, -3.6],
      [1.9, -6.9],
      [2.9, -8.9],
      [4.0, -9.5],
      [4.9, -6.6],
      [5.4, -3.0],
      [5.7, 0.4],
      [6.0, 2.2],
      [6.9, 1.6],
    ],
  },
  l: {
    advance: 7.56,
    main: [
      [0.0, 0.0],
      [1.08, -6.4],
      [2.27, -13.2],
      [3.13, -17.2],
      [4.43, -14.6],
      [4.32, -9.4],
      [4.1, -4.4],
      [4.0, -0.4],
      [4.1, 2.2],
      [4.97, 2.45],
      [6.05, 1.8],
    ],
  },
  m: {
    advance: 25.4,
    main: [
      [0.0, 0.0],
      [0.9, -3.6],
      [1.9, -6.9],
      [2.9, -8.9],
      [4.0, -9.5],
      [5.1, -8.9],
      [5.8, -6.6],
      [6.3, -3.0],
      [6.6, 0.4],
      [6.9, 2.2],
      [7.6, 2.5],
      [8.4, 2.1],
      [9.1, 0.0],
      [9.7, -3.4],
      [10.4, -6.8],
      [11.3, -8.9],
      [12.4, -9.5],
      [13.5, -8.9],
      [14.2, -6.6],
      [14.7, -3.0],
      [15.0, 0.4],
      [15.3, 2.2],
      [16.0, 2.5],
      [16.8, 2.1],
      [17.5, 0.0],
      [18.1, -3.4],
      [18.8, -6.8],
      [19.7, -8.9],
      [20.8, -9.5],
      [21.9, -8.9],
      [22.6, -6.6],
      [23.1, -3.0],
      [23.4, 0.4],
      [23.7, 2.2],
      [24.8, 1.6],
    ],
  },
  n: {
    advance: 17.0,
    main: [
      [0.0, 0.0],
      [0.9, -3.6],
      [1.9, -6.9],
      [2.9, -8.9],
      [4.0, -9.5],
      [5.1, -8.9],
      [5.8, -6.6],
      [6.3, -3.0],
      [6.6, 0.4],
      [6.9, 2.2],
      [7.6, 2.5],
      [8.4, 2.1],
      [9.1, 0.0],
      [9.7, -3.4],
      [10.4, -6.8],
      [11.3, -8.9],
      [12.4, -9.5],
      [13.5, -8.9],
      [14.2, -6.6],
      [14.7, -3.0],
      [15.0, 0.4],
      [15.3, 2.2],
      [16.4, 1.6],
    ],
  },
  o: {
    advance: 12.3,
    main: [
      [0.0, 0.0],
      [2.44, -4.0],
      [5.1, -8.2],
      [6.96, -9.5],
      [4.64, -9.5],
      [2.2, -7.0],
      [1.86, -3.0],
      [3.13, 1.0],
      [5.68, 2.4],
      [8.12, 0.6],
      [8.93, -3.6],
      [8.58, -7.4],
      [9.74, -8.6],
    ],
  },
  s: {
    advance: 9.28,
    main: [
      [0.0, 0.0],
      [2.2, -4.8],
      [4.29, -8.6],
      [5.45, -9.5],
      [3.94, -9.5],
      [2.44, -7.0],
      [2.9, -3.8],
      [4.52, -1.2],
      [5.34, 1.2],
      [4.41, 2.4],
      [3.36, 1.8],
      [4.64, 0.9],
      [7.19, 0.6],
    ],
  },
  t: {
    advance: 8.8,
    main: [
      [0.0, 0.0],
      [1.32, -4.4],
      [2.64, -9.2],
      [3.85, -14.8],
      [4.51, -9.8],
      [4.84, -5.0],
      [5.06, -0.8],
      [5.5, 2.1],
      [6.49, 2.4],
      [7.48, 1.8],
    ],
    corners: [3],
  },
  u: {
    advance: 12.4,
    main: [
      [0.0, 0.0],
      [0.9, -3.6],
      [1.9, -6.9],
      [2.9, -8.9],
      [4.0, -9.5],
      [4.6, -6.4],
      [4.9, -2.6],
      [5.2, 0.8],
      [5.8, 2.3],
      [6.7, 2.5],
      [7.6, 2.1],
      [8.1, -1.4],
      [8.5, -5.4],
      [8.9, -9.5],
      [9.6, -6.0],
      [9.9, -2.2],
      [10.2, 0.8],
      [10.7, 2.3],
      [11.7, 1.7],
    ],
  },
  w: {
    advance: 21.0,
    main: [
      [0.0, 0.0],
      [1.6, -4.7],
      [3.2, -9.3],
      [4.5, -5.4],
      [5.7, -1.5],
      [7.0, 2.3],
      [8.3, -1.6],
      [9.5, -5.5],
      [10.8, -9.3],
      [12.1, -5.5],
      [13.3, -1.6],
      [14.6, 2.3],
      [15.9, -1.5],
      [17.1, -5.4],
      [18.4, -9.3],
      [19.6, -7.6],
    ],
    corners: [2, 5, 8, 11, 14],
  },
  y: {
    advance: 12.8,
    main: [
      [0.0, 0.0],
      [0.9, -3.6],
      [1.9, -6.9],
      [2.9, -8.9],
      [4.0, -9.5],
      [4.6, -6.4],
      [4.9, -2.6],
      [5.2, 0.8],
      [5.8, 2.3],
      [6.7, 2.5],
      [7.6, 2.1],
      [8.1, -1.4],
      [8.5, -5.4],
      [8.9, -9.5],
      [9.6, -5.6],
      [9.9, -1.0],
      [10.0, 3.0],
      [9.6, 6.2],
      [8.4, 8.4],
      [6.8, 8.9],
      [5.8, 7.4],
      [7.0, 5.2],
      [9.7, 3.4],
    ],
  },
} satisfies Record<string, Omit<Glyph, 'marks'>>

export const GLYPHS: Record<string, Glyph> = {
  ...lower,
  // The capital D breaks: the stem with its top flourish is one stroke, the bowl is another
  // and it is the bowl that carries on into the rest of the word.
  D: {
    advance: 15.12,
    lead: [
      [
        [4.32, -16.2],
        [1.94, -14.4],
        [1.84, -9.4],
        [2.59, -3.4],
        [3.35, 2.9],
      ],
    ],
    main: [
      [4.1, -16.0],
      [7.34, -16.4],
      [10.37, -14.2],
      [11.77, -10.0],
      [11.56, -5.2],
      [9.72, -1.2],
      [6.7, 2.0],
      [3.67, 3.0],
      [6.26, 3.4],
      [9.07, 2.6],
      [12.31, 1.0],
    ],
    corners: [7],
  },
  // No closed bowl anywhere in the L: a soft entry curl, one long stem and a baseline swash.
  // Every version with a loop read as a script E.
  L: {
    advance: 14.04,
    main: [
      [7.13, -16.8],
      [4.75, -16.4],
      [3.46, -13.6],
      [3.24, -9.0],
      [2.81, -4.0],
      [2.38, 0.4],
      [2.38, 3.0],
      [3.89, 3.6],
      [6.48, 2.6],
      [9.5, 1.2],
      [12.31, 0.4],
    ],
  },
  W: {
    advance: 24.86,
    main: [
      [0.66, -16.4],
      [3.19, -7.2],
      [5.83, 2.4],
      [8.36, -6.8],
      [11.0, -16.2],
      [13.42, -7.2],
      [16.06, 2.4],
      [18.26, -6.6],
      [20.24, -16.4],
      [21.45, -13.6],
      [22.88, -11.8],
    ],
    corners: [2, 4, 6, 8],
  },
  '?': {
    advance: 9.07,
    main: [
      [0.76, -12.6],
      [1.94, -16.0],
      [4.54, -16.8],
      [6.7, -15.0],
      [6.26, -11.8],
      [4.32, -9.8],
      [3.67, -6.2],
      [3.67, -2.8],
    ],
  },
}

// Letters that carry a mark. `i` and `t` are the same letterforms as above; only the
// pen's return trip is added.
GLYPHS.i = { ...lower.i, marks: [tittle(4.2)] }
GLYPHS.t = { ...lower.t, marks: [crossbar(4.3)] }
// ệ — e under a circumflex and over a dot. Vietnamese spelling, not decoration.
GLYPHS['ệ'] = { ...lower.e, marks: [circumflex(3.6), dotBelow(3.8)] }
