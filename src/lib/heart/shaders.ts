// One vertex program carries the whole sequence: the galaxy's L condenses into the heart, the
// heart comes apart along a curl field, and the same points are swept into two lines of
// handwriting. Position is a pure function of the phase scalars and the particle's own fixed
// attributes — nothing is integrated frame to frame. That keeps it reproducible frame for
// frame (which is what makes it capturable), and it keeps this file the same shape as
// `GalaxyMorph.tsx` instead of introducing a second way of moving particles.

export const HEART_VERTEX_SHADER = `
  attribute vec3 aHeart;
  attribute vec3 aTarget;
  attribute float aRole;      // 0 name · 1 reserve · 2 ambient
  attribute float aWrite;     // when this particle lands, within its own writing phase
  attribute float aOrder;     // condense stagger
  attribute float aRelease;   // dissolve delay — 0 at the base of the heart, 1 at the lobes
  attribute float aSize;
  attribute float aPhase;
  attribute float aSeed;
  attribute float aEmit;
  attribute float aInk;        // emission once the particle has become ink
  attribute vec3 aInkColor;

  uniform float uTime;
  uniform float uCondense;
  uniform float uRelease;
  uniform float uCurl;
  uniform float uSpread;
  uniform float uCurrent;
  uniform float uGather;
  uniform float uNameWrite;
  uniform float uQuestionWrite;
  uniform float uWriteBand;
  uniform float uHold;
  uniform float uInkGain;
  uniform float uStreak;
  uniform float uPixelRatio;
  uniform vec2 uResolution;
  uniform vec3 uBand;         // centre of the band the question gathers into
  uniform vec3 uCurrentTo;    // where the broad currents are heading, before the writing starts
  uniform float uPrevTime;
  uniform vec4 uPrevClocks;   // release · gather · nameWrite · questionWrite

  varying vec3 vColor;
  varying float vEmit;
  varying float vStretch;
  varying vec2 vStreak;

  const float PI = 3.14159265;

  float hash(float n) {
    return fract(sin(n * 12.9898 + 78.233) * 43758.5453);
  }

  // Curl of a smooth analytic vector potential: divergence-free by construction, so the flow
  // swirls and loops instead of radiating. Two octaves — a coarse one for the large currents,
  // a fine one to break up the uniformity.
  vec3 curlField(vec3 p, float t) {
    vec3 v = vec3(0.0);
    float frequency = 1.15;
    float weight = 1.0;
    for (int octave = 0; octave < 2; octave += 1) {
      float cp = cos(frequency * (p.y * 1.31 + p.z * 0.79) + t * 0.21 + 1.7);
      float cq = cos(frequency * (p.z * 1.17 + p.x * 0.93) + t * 0.17 + 4.1);
      float cr = cos(frequency * (p.x * 1.07 + p.y * 1.23) + t * 0.13 + 2.6);
      v += weight * vec3(1.23 * cr - 1.17 * cq, 0.79 * cp - 1.07 * cr, 0.93 * cq - 1.31 * cp);
      frequency *= 3.4;
      weight *= 0.45;
    }
    // Normalised, so the march distance below is in world units and the choreography decides
    // how far the cloud spreads instead of the field's own magnitude deciding for it.
    return v * 0.46;
  }

  // Marches along the field so a particle traces a real streamline rather than wobbling in place.
  vec3 curlDrift(vec3 p, float t, float distance, float seed) {
    vec3 q = p;
    float step = distance * (0.72 + 0.56 * hash(seed * 3.7)) / 5.0;
    for (int i = 0; i < 5; i += 1) {
      q += curlField(q, t) * step;
    }
    return q;
  }

  // Critically damped with the smallest overshoot, not a bounce preset.
  float settle(float w) {
    float c = clamp(w, 0.0, 1.0);
    float decay = exp(-7.0 * c);
    return 1.0 - decay * (cos(4.2 * c) + (7.0 / 4.2) * sin(4.2 * c));
  }

  // Target attraction with a tangential component: the particle bows in and orbits its target
  // briefly before it settles. A straight interpolation reads as a vector morph.
  vec3 approach(vec3 from, vec3 to, float w, float seed) {
    float e = settle(w);
    vec3 delta = to - from;
    float reach = length(delta);
    if (reach < 0.0001) return to;
    vec3 side = cross(delta / reach, vec3(0.0, 0.0, 1.0)) + vec3(0.21, 0.17, 0.11) * (hash(seed) - 0.5);
    side = normalize(side + vec3(0.0001, 0.0, 0.0));
    vec3 lift = normalize(cross(side, delta / reach) + vec3(0.0, 0.0001, 0.0));
    float bow = sin(e * PI) * (0.16 + 0.42 * hash(seed + 3.1)) * min(1.4, reach * 0.34);
    float spin = (1.0 - e) * 5.4 + hash(seed + 7.7) * 6.2831;
    float orbit = (1.0 - e) * (1.0 - e) * (0.06 + 0.13 * hash(seed + 11.3));
    return mix(from, to, e) + side * bow + (side * cos(spin) + lift * sin(spin)) * orbit;
  }

  float depositing(float clock, float at) {
    return clamp((clock - at + uWriteBand * 0.65) / uWriteBand, 0.0, 1.0);
  }

  vec3 place(float t, float release, float gather, float nameWrite, float questionWrite) {
    // 1 — the letter L the galaxy left behind is drawn in onto the heart's surface.
    float condense = clamp((uCondense - aOrder * 0.3) / 0.7, 0.0, 1.0);
    condense = condense * condense * (3.0 - 2.0 * condense);
    vec3 p = mix(position, aHeart, condense);
    p += vec3(0.0, 0.0, 1.0) * sin(condense * PI) * (hash(aSeed) - 0.5) * 0.9;

    // 2 — the dissolve. The base of the heart is released first; the lobes hold their shape.
    float freed = clamp((release - aRelease * 0.3) / 0.7, 0.0, 1.0);
    if (freed > 0.0) {
      float travel = uCurl * freed * freed;
      vec3 flowed = curlDrift(p, t, travel, aSeed);
      flowed += normalize(p + vec3(0.0, 0.0001, 0.0)) * uSpread * freed;
      flowed.y -= 0.12 * freed * freed;
      // 3 — the chaos finds a direction: broad currents converge on where the writing begins.
      // Each particle heads for its own point near there; converging on one exact point pulls
      // the cloud into a bar, and a uniform push carries it out of frame.
      vec3 heading = uCurrentTo + vec3(
        (hash(aSeed + 2.3) - 0.5) * 5.4,
        (hash(aSeed + 4.7) - 0.5) * 3.6,
        (hash(aSeed + 6.1) - 0.5) * 1.6
      );
      flowed += (heading - flowed) * uCurrent * (0.4 + 0.7 * hash(aSeed + 1.9));
      p = mix(p, flowed, freed);
    }

    // 4 — the reserve pools into a loose band below the name before anything is readable.
    if (aRole > 0.5 && aRole < 1.5 && gather > 0.0) {
      // Loose on purpose: nothing is readable yet, this only stops the question arriving from
      // nowhere. A tight band would read as a drawn rule under the name.
      // Two hashes summed so the band's edges feather away instead of cutting a rule.
      float spreadX = hash(aSeed + 17.3) + hash(aSeed + 19.1) - 1.0;
      float spreadY = hash(aSeed + 23.1) + hash(aSeed + 27.5) - 1.0;
      vec3 band = uBand + vec3(
        aTarget.x * 0.7 + spreadX * 5.4,
        spreadY * 3.1,
        (hash(aSeed + 29.7) - 0.5) * 1.3
      );
      p = approach(p, band, gather * 0.45, aSeed + 5.0);
    }

    // 5 — the writing itself. Ambient particles never join a line.
    float clock = aRole < 0.5 ? nameWrite : questionWrite;
    if (aRole < 1.5) {
      float landed = depositing(clock, aWrite);
      p = approach(p, aTarget, landed, aSeed);
      p += curlField(p * 1.7, t * 0.22) * uHold * landed * 0.014;
    } else {
      p += curlField(p * 0.6, t * 0.12) * 0.16;
    }
    return p;
  }

  void main() {
    vec3 here = place(uTime, uRelease, uGather, uNameWrite, uQuestionWrite);
    vec3 before = place(uPrevTime, uPrevClocks.x, uPrevClocks.y, uPrevClocks.z, uPrevClocks.w);

    vec4 view = modelViewMatrix * vec4(here, 1.0);
    vec4 clip = projectionMatrix * view;
    vec4 clipBefore = projectionMatrix * modelViewMatrix * vec4(before, 1.0);
    vec2 travel = (clip.xy / clip.w - clipBefore.xy / clipBefore.w) * uResolution * 0.5;
    float speed = length(travel);
    vStretch = clamp(1.0 + speed * uStreak, 1.0, 9.0);
    vStreak = speed > 0.02 ? normalize(vec2(travel.x, -travel.y)) : vec2(1.0, 0.0);

    float twinkle = 0.76 + 0.24 * sin(uTime * (0.7 + mod(aPhase, 1.7)) + aPhase);
    // A particle stops being shell or interior the moment it joins a line: the heart keeps its
    // layered depth, and the writing reads evenly luminous without the heart turning pale.
    float ink = aRole < 1.5
      ? depositing(aRole < 0.5 ? uNameWrite : uQuestionWrite, aWrite)
      : 0.0;
    vColor = mix(color, aInkColor, ink);
    vEmit = mix(aEmit, aInk * uInkGain, ink) * twinkle;
    gl_PointSize = max(0.7, aSize * uPixelRatio * vStretch * (9.0 / -view.z));
    gl_Position = clip;
  }
`

export const HEART_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vEmit;
  varying float vStretch;
  varying vec2 vStreak;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    // The sprite grows with speed; squeezing across the direction of travel turns that growth
    // into a filament stretched along the velocity instead of a bigger blob.
    vec2 local = vec2(dot(uv, vStreak), dot(uv, vec2(-vStreak.y, vStreak.x)) * vStretch);
    float radius = length(local);
    float core = 1.0 - smoothstep(0.0, 0.11, radius);
    float halo = 1.0 - smoothstep(0.05, 0.5, radius);
    float profile = core * 1.6 + halo * 0.5;
    if (profile < 0.004) discard;
    gl_FragColor = vec4(vColor * vEmit * profile, 1.0);
  }
`

export const FADE_FRAGMENT_SHADER = `
  uniform float uFade;
  uniform vec3 uSky;
  void main() {
    // What an empty frame decays towards. It starts as the sky the galaxy handed over and
    // reaches true black by the time the heart is whole.
    gl_FragColor = vec4(uSky, uFade);
  }
`

export const FADE_VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`
