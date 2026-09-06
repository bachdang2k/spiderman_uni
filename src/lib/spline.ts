// Smooth path through hand-placed points: the curve maths behind the handwritten lettering.
//
// Centripetal rather than uniform Catmull-Rom: hand-placed points are unevenly spaced, and
// uniform parameterisation overshoots those gaps into loops the shape never asked for.

export type Point = [number, number]

const round = (value: number) => Math.round(value * 1000) / 1000

const reflect = (a: Point, b: Point): Point => [2 * a[0] - b[0], 2 * a[1] - b[1]]

function smoothRun(points: Point[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) return ` L ${round(points[1][0])} ${round(points[1][1])}`

  const extended = [
    reflect(points[0], points[1]),
    ...points,
    reflect(points[points.length - 1], points[points.length - 2]),
  ]
  let data = ''
  for (let i = 1; i + 2 < extended.length; i += 1) {
    const [p0, p1, p2, p3] = [extended[i - 1], extended[i], extended[i + 1], extended[i + 2]]
    const d1 = Math.max(1e-4, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) ** 0.5)
    const d2 = Math.max(1e-4, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) ** 0.5)
    const d3 = Math.max(1e-4, Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) ** 0.5)
    const control = (axis: 0 | 1) => {
      const b1 =
        (d1 * d1 * p2[axis] -
          d2 * d2 * p0[axis] +
          (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[axis]) /
        (3 * d1 * (d1 + d2))
      const b2 =
        (d3 * d3 * p1[axis] -
          d2 * d2 * p3[axis] +
          (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[axis]) /
        (3 * d3 * (d3 + d2))
      return [b1, b2] as const
    }
    const [b1x, b2x] = control(0)
    const [b1y, b2y] = control(1)
    data += ` C ${round(b1x)} ${round(b1y)} ${round(b2x)} ${round(b2y)} ${round(p2[0])} ${round(p2[1])}`
  }
  return data
}

/** A polyline becomes one path; listed indices stay sharp instead of being rounded away. */
export function splinePath(points: Point[], corners: number[] = []): string {
  const cuts = [0, ...corners.filter((i) => i > 0 && i < points.length - 1), points.length - 1]
  let data = `M ${round(points[0][0])} ${round(points[0][1])}`
  for (let i = 0; i + 1 < cuts.length; i += 1) {
    data += smoothRun(points.slice(cuts[i], cuts[i + 1] + 1))
  }
  return data
}
