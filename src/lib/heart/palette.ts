// The heart, the name and the question are all built out of Scene 3's cosmic vocabulary, so
// the two scenes read as the same universe. Every value below is a design-system token or a
// mix of two of them, which `DESIGN-SYSTEM.md §2` explicitly permits. There is no cyan here.

/** sRGB components, 0..1. */
export type Rgb = [number, number, number]

const hex = (value: string): Rgb => [
  parseInt(value.slice(1, 3), 16) / 255,
  parseInt(value.slice(3, 5), 16) / 255,
  parseInt(value.slice(5, 7), 16) / 255,
]

export const TOKEN = {
  night: hex('#080A12'),
  deepBlue: hex('#172554'),
  cream: hex('#F7F1E3'),
  gold: hex('#D4A84F'),
}

/**
 * Two of the galaxy's own star colours, carried over so the ending reads as the same sky the
 * six was made of. Without them the ramp ran straight from a desaturated blue-grey to cream and
 * the whole sequence read black-and-white beside the scene it grows out of.
 */
export const GALAXY_STAR = {
  blue: hex('#B9D9FF'),
  pale: hex('#DCECFF'),
  warm: hex('#F2C889'),
}

/**
 * Colour for one particle of ink. Every stroke used to be flat cream, which the bloom clipped
 * to white and left the writing reading black-and-white beside the galaxy it grows out of.
 * Drawing per particle from the galaxy's own star colours gives the lines the same blue-white
 * body with the occasional warm spark, and keeps the hottest cores clipping to cream.
 */
export function inkColor(temperature: number): Rgb {
  if (temperature < 0.08) return GALAXY_STAR.warm
  if (temperature < 0.38) return TOKEN.cream
  if (temperature < 0.72) return GALAXY_STAR.pale
  return GALAXY_STAR.blue
}

/**
 * The galaxy's own background where the letter sat: its dark gradient with the nebula glow on
 * top. The ending opens on this and settles to `night`, so the cut between the two scenes has
 * no step in the background.
 */
export const HANDOVER_SKY: Rgb = [8 / 255, 17 / 255, 32 / 255]

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

/**
 * The bulk of the cloud. Not a new token — `deep blue` blended 45% toward `cream`, which is
 * exactly the `#7C8194` the direction names as a derived starting point.
 */
const BODY = mix(TOKEN.deepBlue, TOKEN.cream, 0.45)

const RAMP: { at: number; color: Rgb }[] = [
  { at: 0.0, color: TOKEN.deepBlue },
  { at: 0.45, color: BODY },
  { at: 0.8, color: GALAXY_STAR.blue },
  { at: 0.94, color: GALAXY_STAR.pale },
  // Only the hottest cores still clip to white, the way the galaxy's brightest stars do.
  { at: 1.0, color: TOKEN.cream },
]

/** Continuous colour for a particle's fixed brightness. */
export function rampColor(brightness: number): Rgb {
  const b = Math.min(1, Math.max(0, brightness))
  for (let i = 1; i < RAMP.length; i += 1) {
    if (b <= RAMP[i].at) {
      const span = RAMP[i].at - RAMP[i - 1].at
      return mix(RAMP[i - 1].color, RAMP[i].color, span > 0 ? (b - RAMP[i - 1].at) / span : 0)
    }
  }
  return TOKEN.cream
}

/**
 * How far past 1.0 a particle's emission is pushed. Above the bloom threshold the core clips
 * to white and grows a halo; that clipping is the difference between burning points and
 * coloured dots, so the brightest particles have to leave the 0..1 range.
 */
export function rampEmission(brightness: number) {
  if (brightness <= 0.8) return 0.05 + brightness * 0.42
  // Only the top of the ramp crosses 1.0 and reaches the bloom. If most of the cloud clips,
  // the bloom stops being a halo on the brightest cores and becomes a fog over the frame.
  return 0.39 + ((brightness - 0.8) / 0.2) ** 2.2 * 1.5
}
