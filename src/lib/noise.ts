// Seeded, deterministic pseudo-randomness shared by every particle system in this
// project. Reproducible frame-for-frame so the beats stay art-directable and capturable.

export function random(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function gaussian(seed: number) {
  const a = Math.max(0.0001, random(seed))
  const b = random(seed + 91.7)
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(Math.PI * 2 * b)
}
