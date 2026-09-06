// The heart is a 3D body, not a silhouette. Points are sampled off the implicit surface
//
//   (x² + 9/4·y² + z² − 1)³ − x²z³ − 9/80·y²z³ = 0
//
// which is squeezed in depth (the 9/4 on y) exactly the way a real heart is. Reading it as a
// shell is what produces the bright rim: near the silhouette the eye ray crosses far more
// particles than it does through the middle. Seeding an outline would fake that and look it.

import { gaussian, random } from '../noise'

export type HeartLayer = 'shell' | 'interior' | 'diffuse'

export type HeartPoint = {
  x: number
  y: number
  z: number
  layer: HeartLayer
  /** 0 at the core, 1 at the silhouette — drives brightness and the dissolve's release order. */
  rim: number
}

/** Implicit surface value in heart space, where +z is up toward the lobes and y is depth. */
function surface(x: number, y: number, z: number) {
  const base = x * x + 2.25 * y * y + z * z - 1
  return base * base * base - x * x * z * z * z - 0.1125 * y * y * z * z * z
}

/** Largest radius along a ray from the origin that is still inside the body. */
function radiusAlong(dx: number, dy: number, dz: number) {
  let low = 0
  let high = 1.6
  for (let i = 0; i < 26; i += 1) {
    const mid = (low + high) / 2
    if (surface(dx * mid, dy * mid, dz * mid) < 0) low = mid
    else high = mid
  }
  return low
}

/**
 * @param index  Particle index; the sampling is seeded, so the same index always lands in the
 *               same place and the whole sequence is reproducible frame for frame.
 */
export function heartPoint(index: number): HeartPoint {
  const seed = index * 3.11 + 7.3

  // Direction, area-weighted so the thin cusp does not end up denser than the lobes.
  let dx = 0
  let dy = 0
  let dz = 0
  let radius = 0
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const s = seed + attempt * 131.7
    const cosine = random(s * 1.7) * 2 - 1
    const angle = random(s * 2.3) * Math.PI * 2
    const sine = Math.sqrt(Math.max(0, 1 - cosine * cosine))
    dx = sine * Math.cos(angle)
    dy = sine * Math.sin(angle) * 0.62
    dz = cosine
    const length = Math.hypot(dx, dy, dz)
    dx /= length
    dy /= length
    dz /= length
    radius = radiusAlong(dx, dy, dz)
    if (random(s * 3.9) < (radius / 1.25) ** 2) break
  }

  const roll = random(seed * 5.1)
  let scale: number
  let layer: HeartLayer
  if (roll < 0.4) {
    layer = 'shell'
    scale = 1 + gaussian(seed * 7.7) * 0.013
  } else if (roll < 0.85) {
    layer = 'interior'
    // Falls off toward the centre, and never reaches it: points converging on the origin
    // would pile into a bright core and close off the black the direction asks to see through.
    scale = 0.26 + 0.71 * (1 - random(seed * 9.3) ** 2.1)
  } else {
    layer = 'diffuse'
    scale = 1 + -Math.log(Math.max(1e-4, random(seed * 11.9))) * 0.11
  }

  const r = radius * scale
  const rim = layer === 'shell' ? 1 : layer === 'interior' ? Math.min(1, scale ** 2.4) : 0.22

  // Heart space is z-up; the scene is y-up and looks along -z.
  return { x: dx * r, y: dz * r, z: dy * r, layer, rim }
}

/** Half-extents of the sampled body, so the composition can size it against the viewport. */
export const HEART_EXTENT = { x: 1.17, y: 1.2, z: 0.67 }
