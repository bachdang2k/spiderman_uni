export const STORY_CONFIG = {
  girlName: 'Linh Chu',
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
    rain: ['Then the sky changed its mind.', 'One raindrop, in exactly the right place.'],
    butterfly: [],
    mystery: ['Wait.', 'Something fell behind.'],
  },
  quotes: {
    stars: 'The stars are beautiful, because of a flower that cannot be seen.',
    universe: 'When you want something, all the universe conspires in helping you to achieve it.',
  },
  final: {
    invitation: 'Would you watch the sunset with me?',
    invitationLines: ['Would you watch the sunset', 'with me?'],
    answer: 'I would',
    after: 'Spider Sense says that was a very good choice.',
  },
  audio: { enabledByDefault: false, volume: 0.22 },
  assets: { leopardTexture: '', flowerTexture: '', ambientTrack: '' },
} as const

export type SceneId =
  'web' | 'sense' | 'wonder' | 'cosmos' | 'rain' | 'butterfly' | 'mystery' | 'final'

export const SCENE_ORDER: SceneId[] = [
  'web',
  'sense',
  'wonder',
  'cosmos',
  'rain',
  'butterfly',
  'mystery',
  'final',
]
