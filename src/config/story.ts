export const STORY_CONFIG = {
  girlName: 'Linh Chu',
  /** The name the last scene writes, in her own language, with her own marks. */
  signatureName: 'Diệu Linh',
  senderName: '',
  title: 'THE WEB THAT FOUND LINH CHU',
  scenes: {
    web: ['Some stories begin with a coincidence.', 'Some begin with a web.'],
    sense: {
      title: 'SPIDER SENSE',
      subtitle: "Let's see if yours works.",
      wrong: ['Nope.', 'Spider Sense temporarily unavailable.'],
      right: ['Okay…', 'That was suspiciously good.'],
    },
    wonder: ['A different signal just appeared.', 'Not every superhero needs a cape.'],
    cosmos: ['A number lost in the galaxy.', 'Touch it and see what letter it is hiding.'],
  },
  quotes: {
    stars: 'The stars are beautiful, because of a flower that cannot be seen.',
    universe: 'When you want something, all the universe conspires in helping you to achieve it.',
  },
  final: {
    invitation: 'Would you watch the sunset with me?',
  },
  audio: { enabledByDefault: false, volume: 0.22 },
  assets: { leopardTexture: '', flowerTexture: '', ambientTrack: '' },
} as const

export type SceneId = 'web' | 'sense' | 'wonder' | 'cosmos' | 'heart'

export const SCENE_ORDER: SceneId[] = ['web', 'sense', 'wonder', 'cosmos', 'heart']
