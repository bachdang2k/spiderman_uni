// The letter L the galaxy condenses into at the end of Scene 3. Scene 4 starts from these same
// points so the cloud carries through instead of one scene fading out and another fading in.

import { gaussian, random } from './noise'

/**
 * Height of Scene 3's galaxy stage, in CSS pixels. Scene 4 reads the same number so its
 * inherited L arrives at the size the galaxy left it — the seam only disappears if both
 * scenes agree, so this lives in one place.
 */
export const galaxyStageHeight = (viewportHeight: number) => Math.min(620, viewportHeight * 0.6)

/** Vertical extent of the L in the galaxy's world units, used to match that size across scenes. */
export const LETTER_HEIGHT = 4.05

export function createLetterPoint(index: number, count: number) {
  const seed = index + 313
  // Golden-ratio stepping rather than index order. Downstream the particle index also decides
  // whether a particle becomes the name, the question or ambient drift; walking the letter in
  // index order stripes it by role and piles the dim ones at the end of the foot.
  const place = ((index * 0.6180339887) % 1) * count
  const onStem = place / count < 0.68
  const along = onStem ? place / (count * 0.68) : (place - count * 0.68) / (count * 0.32)
  const stream = Math.floor(random(seed * 4.1) * 9) - 4
  const streamOffset = stream * 0.027
  const dust = gaussian(seed * 9.8) * 0.052

  if (onStem) {
    return {
      x: -1.15 + streamOffset + dust,
      y: 2.05 - along * 4.05 + Math.sin(along * 41 + stream) * 0.025,
      z: gaussian(seed * 11.7) * 0.2,
    }
  }

  return {
    x: -1.15 + along * 2.45 + Math.sin(along * 37 + stream) * 0.025,
    y: -2 + streamOffset + dust,
    z: gaussian(seed * 11.7) * 0.2,
  }
}
