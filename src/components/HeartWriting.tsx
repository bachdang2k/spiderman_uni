import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { composeScript, CAP_HEIGHT, type Script } from '../assets/lettering/lines'
import { createLetterPoint, galaxyStageHeight, LETTER_HEIGHT } from '../lib/galaxyLetter'
import { random } from '../lib/noise'
import { heartPoint, HEART_EXTENT } from '../lib/heart/geometry'
import { HANDOVER_SKY, inkColor, rampColor, rampEmission, TOKEN } from '../lib/heart/palette'
import { sampleScript } from '../lib/heart/script'
import { reducedMotion } from '../lib/motion'
import {
  FADE_FRAGMENT_SHADER,
  FADE_VERTEX_SHADER,
  HEART_FRAGMENT_SHADER,
  HEART_VERTEX_SHADER,
} from '../lib/heart/shaders'

type Props = {
  /** The name, already broken into lines. */
  nameLines: string[]
  /** Candidate breaks for the question, widest first. The first one that fits is used. */
  questionSplits: string[][]
  /** The sequence waits for the scene to be on screen before it starts. */
  active: boolean
  /** Runs once the whole sequence has landed on its final held frame. */
  onSettled?: () => void
}

/** Field of view, in degrees. Narrow, so the cloud keeps its depth without fisheye. */
const FOV = 35

/** The heart reads better a little wider than tall, the way the reference frames it. */
const HEART_SQUASH = 0.78

/** Share of the cloud that becomes the name, then the question; the rest never joins a line. */
const NAME_SHARE = 0.55
const RESERVE_SHARE = 0.35

const PHASE = {
  preroll: 1.2,
  condense: 2.2,
  hold: 5.4,
  dissolve: 4.4,
  current: 1.5,
  writeName: 6.5,
  nameHolds: 2.0,
  writeQuestion: 8.6,
}

type Layout = {
  width: number
  height: number
  visibleWidth: number
  visibleHeight: number
  distance: number
  heartScale: number
  heartCenterY: number
  inheritScale: number
  name: { script: Script; scale: number; centerY: number }
  question: { script: Script; scale: number; centerY: number }
  bandY: number
  /** Pixels the composition puts on one world unit — the ink's exposure is derived from it. */
  pixelsPerUnit: number
  currentTo: { x: number; y: number }
  mobile: boolean
}

function measureViewport(width: number, height: number) {
  const aspect = Math.max(0.2, width / Math.max(1, height))
  const visibleHeight = aspect >= 1 ? 10 : 10 / aspect
  return {
    aspect,
    visibleHeight,
    visibleWidth: visibleHeight * aspect,
    distance: visibleHeight / (2 * Math.tan(((FOV / 2) * Math.PI) / 180)),
  }
}

function buildLayout(props: Props, width: number, height: number): Layout {
  const { aspect, visibleWidth, visibleHeight, distance } = measureViewport(width, height)
  const mobile = aspect < 1
  const safeWidth = visibleWidth * 0.9

  const nameScript = composeScript(props.nameLines, 'deferred')
  const nameWidth = mobile ? visibleWidth * 0.86 : safeWidth * 0.66
  const nameScale = nameWidth / nameScript.bounds.width

  // The question is quieter than the name by a fixed ratio; the line break is whichever
  // natural split still fits at that size.
  const questionScale = nameScale * 0.6
  const questionLimit = mobile ? visibleWidth * 0.92 : visibleWidth * 0.82
  const candidates = props.questionSplits.map((lines) => composeScript(lines, 'inline'))
  const questionScript =
    candidates.find((script) => script.bounds.width * questionScale <= questionLimit) ??
    candidates[candidates.length - 1]
  const questionFit = Math.min(questionScale, questionLimit / questionScript.bounds.width)

  // The two lines are composed as one block and centred a little above the middle. Pinning the
  // name and letting the question hang below it pushes the question off a 16:9 frame.
  const nameHalf = (nameScript.bounds.height * nameScale) / 2
  const gap = CAP_HEIGHT * nameScale * 1.05
  const questionHalf = (questionScript.bounds.height * questionFit) / 2
  const blockHalf = nameHalf + gap / 2 + questionHalf
  // Lifted off the lower edge: sitting lower, the question's last line read as hanging off the
  // frame rather than resting in it. A portrait frame is more than twice as tall in world units
  // as a landscape one, so the same fraction would throw the two compositions apart.
  const blockCenterY = visibleHeight * (mobile ? 0.015 : 0.02)
  const nameCenterY = blockCenterY + blockHalf - nameHalf
  const questionCenterY = blockCenterY - blockHalf + questionHalf

  // Scene 3 draws its L inside a fixed stage; matching its on-screen size here is what makes
  // the handover read as the same cloud rather than a cut. 5.98 is the world height Scene 3's
  // camera sees, so this is the L arriving at exactly the size the galaxy left it.
  const inheritPixels = (LETTER_HEIGHT / 5.98) * galaxyStageHeight(height)
  const inheritScale = ((inheritPixels / height) * visibleHeight) / LETTER_HEIGHT

  const heartWidth = mobile ? visibleWidth * 0.75 : safeWidth * 0.56
  return {
    width,
    height,
    visibleWidth,
    visibleHeight,
    distance,
    heartScale: heartWidth / (HEART_EXTENT.x * 2),
    heartCenterY: visibleHeight * 0.05,
    inheritScale,
    name: { script: nameScript, scale: nameScale, centerY: nameCenterY },
    question: { script: questionScript, scale: questionFit, centerY: questionCenterY },
    bandY: questionCenterY,
    pixelsPerUnit: height / visibleHeight,
    currentTo: { x: -nameScript.bounds.width * nameScale * 0.42, y: nameCenterY },
    mobile,
  }
}

/**
 * Core count is the only capability signal available before the buffers are allocated, and it
 * is the one that correlates with a weak integrated GPU. Without it the tier followed aspect
 * ratio alone, so a two-core laptop in landscape drew the same 110k as an M1.
 */
function modestDevice() {
  const cores = navigator.hardwareConcurrency
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return (cores !== undefined && cores <= 4) || (memory !== undefined && memory <= 4)
}

function particleBudget(mobile: boolean, reduce: boolean) {
  if (reduce) return 16_000
  if (mobile) return 38_000
  return modestDevice() ? 55_000 : 110_000
}

/** The composition the ink's exposure is calibrated against: desktop, 110k particles. */
const INK_REFERENCE = { area: (0.0944 * 80) ** 2, particles: 110_000 }

/**
 * A narrow viewport draws the same share of particles into a stroke that covers far fewer
 * pixels, which burns the writing out; a reduced-motion field has far fewer particles and goes
 * faint. Both are the same ratio, so the exposure is derived rather than tuned per breakpoint.
 */
function inkGain(layout: Layout, nameScale: number, count: number) {
  const area = (nameScale * layout.pixelsPerUnit) ** 2
  return Math.min(
    2.6,
    Math.max(0.3, (area / INK_REFERENCE.area) * (INK_REFERENCE.particles / count)),
  )
}

export function HeartWriting(props: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const settledRef = useRef(props.onSettled)
  settledRef.current = props.onSettled
  const startRef = useRef<(() => void) | null>(null)
  const activeRef = useRef(props.active)
  activeRef.current = props.active

  useEffect(() => {
    let cancelled = false
    let teardown = () => {}

    void Promise.all([
      import('three'),
      import('three/examples/jsm/postprocessing/EffectComposer.js'),
      import('three/examples/jsm/postprocessing/TexturePass.js'),
      import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
      import('three/examples/jsm/postprocessing/OutputPass.js'),
    ])
      .then(([THREE, composerModule, textureModule, bloomModule, outputModule]) => {
        if (cancelled || !mountRef.current) return
        const mount = mountRef.current
        const reduce = reducedMotion()
        let width = Math.max(1, mount.clientWidth)
        let height = Math.max(1, mount.clientHeight)
        let layout = buildLayout(props, width, height)
        const count = particleBudget(layout.mobile, reduce)
        const nameCount = Math.round(count * NAME_SHARE)
        const reserveCount = Math.round(count * RESERVE_SHARE)

        const scene = new THREE.Scene()
        const cloud = new THREE.Group()
        scene.add(cloud)
        const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 120)
        camera.position.z = layout.distance

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })

        // The trail buffer and the bloom chain both render into half-float targets, which
        // WebGL2 only makes colour-renderable through one of these extensions. Without it every
        // pass writes into an incomplete framebuffer: no exception, no console error, just a
        // blank ending. Fail loudly here so the drawn fallback takes over instead.
        const gl = renderer.getContext()
        if (
          !gl.getExtension('EXT_color_buffer_half_float') &&
          !gl.getExtension('EXT_color_buffer_float')
        ) {
          renderer.dispose()
          throw new Error('heart-writing: half-float colour buffers are unavailable')
        }

        const pixelRatio = Math.min(devicePixelRatio, layout.mobile ? 1.5 : 1.75)
        renderer.setPixelRatio(pixelRatio)
        renderer.setSize(width, height)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.92
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(new THREE.Color(...HANDOVER_SKY).convertSRGBToLinear(), 1)
        renderer.autoClear = false
        mount.appendChild(renderer.domElement)

        // --- attributes -------------------------------------------------------------------
        const positions = new Float32Array(count * 3)
        const hearts = new Float32Array(count * 3)
        const targets = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const roles = new Float32Array(count)
        const writes = new Float32Array(count)
        const orders = new Float32Array(count)
        const releases = new Float32Array(count)
        const sizes = new Float32Array(count)
        const phases = new Float32Array(count)
        const seeds = new Float32Array(count)
        const emits = new Float32Array(count)
        const inks = new Float32Array(count)
        const inkColors = new Float32Array(count * 3)
        const color = new THREE.Color()

        const fillTargets = () => {
          const name = sampleScript(layout.name.script, {
            count: nameCount,
            seconds: PHASE.writeName,
            placement: { scale: layout.name.scale, centerX: 0, centerY: layout.name.centerY },
            scatter: 0.42,
            depth: 0.5,
            seed: 91,
          })
          const question = sampleScript(layout.question.script, {
            count: reserveCount,
            seconds: PHASE.writeQuestion,
            placement: {
              scale: layout.question.scale,
              centerX: 0,
              centerY: layout.question.centerY,
            },
            scatter: 0.42,
            depth: 0.5,
            seed: 613,
          })
          for (let index = 0; index < count; index += 1) {
            const offset = index * 3
            if (index < nameCount) {
              targets.set(name.positions.subarray(offset, offset + 3), offset)
              writes[index] = name.writes[index]
            } else if (index < nameCount + reserveCount) {
              const local = (index - nameCount) * 3
              targets.set(question.positions.subarray(local, local + 3), offset)
              writes[index] = question.writes[index - nameCount]
            } else {
              targets.set(hearts.subarray(offset, offset + 3), offset)
              writes[index] = 1
            }
          }
        }

        const topOfHeart = HEART_EXTENT.y * HEART_SQUASH * layout.heartScale
        for (let index = 0; index < count; index += 1) {
          const offset = index * 3
          const point = heartPoint(index)
          hearts[offset] = point.x * layout.heartScale
          hearts[offset + 1] = point.y * HEART_SQUASH * layout.heartScale + layout.heartCenterY
          hearts[offset + 2] = point.z * layout.heartScale

          const letter = createLetterPoint(index, count)
          positions[offset] = letter.x * layout.inheritScale
          positions[offset + 1] = letter.y * layout.inheritScale
          positions[offset + 2] = letter.z * layout.inheritScale

          roles[index] = index < nameCount ? 0 : index < nameCount + reserveCount ? 1 : 2
          const distance = Math.hypot(letter.x, letter.y) / 3.4
          orders[index] = Math.min(1, Math.max(0, 1 - distance) * 0.74 + random(index * 5.9) * 0.26)
          releases[index] = Math.min(
            1,
            Math.max(0, (hearts[offset + 1] - layout.heartCenterY) / Math.max(0.01, topOfHeart)),
          )
          phases[index] = random(index * 53.8) * Math.PI * 2
          seeds[index] = random(index * 17.3) * 97

          const layered =
            point.layer === 'shell'
              ? 0.7 + random(index * 21.1) * 0.3
              : point.layer === 'interior'
                ? 0.24 + point.rim * 0.44 + random(index * 23.7) * 0.14
                : 0.04 + random(index * 27.3) * 0.2
          const brightness = roles[index] > 1.5 ? Math.min(layered, 0.34) : layered
          const flare = random(index * 31.9) > 0.9955
          const rgb = flare ? TOKEN.gold : rampColor(brightness)
          color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace)
          colors.set([color.r, color.g, color.b], offset)
          emits[index] = rampEmission(brightness) * (flare ? 1.8 : 1)
          // Once a particle joins a line it stops being shell or interior and simply becomes
          // ink, so the heart keeps its layered depth while the writing reads evenly luminous.
          // The name is the payoff and the question is the coda, so the question is written in
          // the same hand at a lower emission as well as a smaller cap height.
          // Above the bloom threshold the tone map washes every hue to white, so only the
          // cream and warm particles are written hot enough to burn. The blue-bodied majority
          // is written cooler, which is what lets the finished lines read as coloured light
          // rather than as white on black.
          const temperature = random(index * 53.7)
          const inkHeat = temperature < 0.38 ? 1 : 0.5
          inks[index] =
            roles[index] < 0.5
              ? (1.3 + random(index * 37.1) * 0.85) * inkHeat
              : roles[index] < 1.5
                ? (0.92 + random(index * 41.3) * 0.55) * inkHeat
                : emits[index]
          const inkRgb = flare ? TOKEN.gold : inkColor(temperature)
          color.setRGB(inkRgb[0], inkRgb[1], inkRgb[2], THREE.SRGBColorSpace)
          inkColors.set([color.r, color.g, color.b], offset)
          sizes[index] =
            random(index * 43.7) > 0.992
              ? 2.0 + random(index * 47.2) * 1.2
              : 0.6 + brightness * 0.95 + random(index * 51.3) * 0.35
        }
        fillTargets()

        const geometry = new THREE.BufferGeometry()
        const attribute = (data: Float32Array, size: number) =>
          new THREE.BufferAttribute(data, size)
        geometry.setAttribute('position', attribute(positions, 3))
        geometry.setAttribute('aHeart', attribute(hearts, 3))
        geometry.setAttribute('aTarget', attribute(targets, 3))
        geometry.setAttribute('color', attribute(colors, 3))
        geometry.setAttribute('aRole', attribute(roles, 1))
        geometry.setAttribute('aWrite', attribute(writes, 1))
        geometry.setAttribute('aOrder', attribute(orders, 1))
        geometry.setAttribute('aRelease', attribute(releases, 1))
        geometry.setAttribute('aSize', attribute(sizes, 1))
        geometry.setAttribute('aPhase', attribute(phases, 1))
        geometry.setAttribute('aSeed', attribute(seeds, 1))
        geometry.setAttribute('aEmit', attribute(emits, 1))
        geometry.setAttribute('aInk', attribute(inks, 1))
        geometry.setAttribute('aInkColor', attribute(inkColors, 3))

        const uniforms = {
          uTime: { value: 0 },
          uPrevTime: { value: 0 },
          uPrevClocks: { value: new THREE.Vector4() },
          uCondense: { value: 0 },
          uRelease: { value: 0 },
          uCurl: { value: 0 },
          uSpread: { value: 0 },
          uCurrent: { value: 0 },
          uGather: { value: 0 },
          uNameWrite: { value: 0 },
          uQuestionWrite: { value: 0 },
          uWriteBand: { value: 0.075 },
          uHold: { value: 0 },
          uInkGain: { value: inkGain(layout, layout.name.scale, count) },
          uStreak: { value: 0 },
          uPixelRatio: { value: pixelRatio },
          uResolution: { value: new THREE.Vector2(width, height) },
          uBand: { value: new THREE.Vector3(0, layout.bandY, 0) },
          uCurrentTo: {
            value: new THREE.Vector3(layout.currentTo.x, layout.currentTo.y, 0),
          },
        }

        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: HEART_VERTEX_SHADER,
          fragmentShader: HEART_FRAGMENT_SHADER,
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthTest: true,
          depthWrite: false,
        })
        const points = new THREE.Points(geometry, material)
        points.frustumCulled = false
        cloud.add(points)

        // --- accumulation, bloom, tone mapping ---------------------------------------------
        const accumulation = new THREE.WebGLRenderTarget(
          Math.round(width * pixelRatio),
          Math.round(height * pixelRatio),
          { type: THREE.HalfFloatType, depthBuffer: true },
        )
        // The quad paints the galaxy's sky itself, in pixels, so it needs the frame size.
        const fadeUniforms = {
          uFade: { value: 1 },
          uResolution: { value: new THREE.Vector2(width, height) },
        }
        const fadeScene = new THREE.Scene()
        const fadeCamera = new THREE.Camera()
        const fadeMaterial = new THREE.ShaderMaterial({
          uniforms: fadeUniforms,
          vertexShader: FADE_VERTEX_SHADER,
          fragmentShader: FADE_FRAGMENT_SHADER,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        })
        const fadeGeometry = new THREE.PlaneGeometry(2, 2)
        fadeScene.add(new THREE.Mesh(fadeGeometry, fadeMaterial))

        const composer = new composerModule.EffectComposer(renderer)
        composer.setPixelRatio(pixelRatio)
        composer.setSize(width, height)
        const texturePass = new textureModule.TexturePass(accumulation.texture)
        composer.addPass(texturePass)
        const bloom = new bloomModule.UnrealBloomPass(
          new THREE.Vector2(width, height),
          reduce ? 0.45 : 0.78,
          layout.mobile ? 0.3 : 0.44,
          1.0,
        )
        composer.addPass(bloom)
        composer.addPass(new outputModule.OutputPass())

        renderer.setRenderTarget(accumulation)
        renderer.clear(true, true, false)
        renderer.setRenderTarget(null)

        // --- choreography ------------------------------------------------------------------
        const clocks = {
          condense: 0,
          release: 0,
          curl: 0,
          spread: 0,
          current: 0,
          gather: 0,
          nameWrite: 0,
          questionWrite: 0,
          hold: 0,
          streak: 0,
          fade: 1,
          yaw: 0,
        }
        const timeline = gsap.timeline({ paused: true })
        if (reduce) {
          // No dissolve loop, no camera drift, no blank frame: a small drifting field
          // crossfades straight into both lines, already written.
          uniforms.uWriteBand.value = 1
          timeline
            .to(clocks, { nameWrite: 1, duration: 1.4, ease: 'power1.inOut' }, 0.3)
            .to(clocks, { questionWrite: 1, duration: 1.4, ease: 'power1.inOut' }, 1.0)
            .to(clocks, { hold: 1, duration: 0.6 }, 2.0)
        } else {
          timeline
            .to(clocks, { yaw: 1, duration: 2.0, ease: 'sine.inOut' }, 0)
            .to(
              clocks,
              { condense: 1, duration: PHASE.condense, ease: 'power2.inOut' },
              PHASE.preroll,
            )
            .to(clocks, { fade: 0.62, duration: 0.6 }, PHASE.preroll)
            .to(clocks, { streak: 0.02, duration: 0.6 }, PHASE.preroll)
        }
        const dissolveAt = PHASE.preroll + PHASE.condense + PHASE.hold
        const currentAt = dissolveAt + PHASE.dissolve
        const nameAt = currentAt + PHASE.current
        // The reserve pools while the name is still being written, so the pause after it is a
        // held frame rather than a beat of visible converging. Nothing is readable in the band;
        // it only stops the question arriving from nowhere.
        const gatherAt = nameAt + PHASE.writeName * 0.3
        const gatherFor = PHASE.writeName * 0.6
        const questionAt = nameAt + PHASE.writeName + PHASE.nameHolds
        const endAt = questionAt + PHASE.writeQuestion

        if (!reduce) {
          timeline
            // The heart is pinned and still, then it lets go from the base upward.
            .to(clocks, { fade: 0.9, duration: 0.5 }, dissolveAt - 0.5)
            // Linear, so the release front climbs the heart at a readable rate: the base is
            // already a storm while the lobes are still holding their shape.
            .to(clocks, { release: 1, duration: PHASE.dissolve, ease: 'none' }, dissolveAt)
            .to(clocks, { curl: 2.8, duration: PHASE.dissolve, ease: 'power1.in' }, dissolveAt)
            .to(clocks, { spread: 0.9, duration: PHASE.dissolve, ease: 'power2.in' }, dissolveAt)
            .to(clocks, { streak: 0.42, duration: 1.4, ease: 'power2.in' }, dissolveAt + 0.6)
            // Long enough for the streaks to read as filaments, short enough that a cloud spread
            // across the whole frame does not accumulate into fog over pure black.
            .to(clocks, { fade: 0.34, duration: 1.6, ease: 'power2.out' }, dissolveAt + 0.5)
            // Long streaks belong to the break itself. Held all the way to the name they
            // stack into a navy wash across the whole frame, so the trail shortens again
            // as the cloud spreads and the background returns to black.
            .to(clocks, { fade: 0.52, duration: 2.2, ease: 'sine.inOut' }, dissolveAt + 2.1)
            // The chaos develops intent and sweeps toward where the writing begins.
            .to(clocks, { current: 0.42, duration: PHASE.current, ease: 'power2.inOut' }, currentAt)
            .to(clocks, { curl: 1.6, duration: PHASE.current, ease: 'sine.inOut' }, currentAt)
            // The drift exists to prove the heart is a body with depth. Once the writing starts
            // it has to stop, or the finished name would sway while it is meant to be holding.
            .to(clocks, { yaw: 0, duration: 3.2, ease: 'sine.inOut' }, currentAt)
            // The name.
            .to(clocks, { nameWrite: 1, duration: PHASE.writeName, ease: 'none' }, nameAt)
            .to(clocks, { fade: 0.8, duration: 1.2, ease: 'power1.out' }, nameAt)
            .to(clocks, { streak: 0.16, duration: 1.6, ease: 'power2.out' }, nameAt + 0.4)
            .to(clocks, { hold: 1, duration: 1.4 }, nameAt + PHASE.writeName * 0.8)
            .to(clocks, { fade: 0.92, duration: 1.2 }, nameAt + PHASE.writeName)
            // The reserve pools below, then writes the question in the same hand.
            .to(clocks, { gather: 1, duration: gatherFor, ease: 'power2.inOut' }, gatherAt)
            .to(clocks, { curl: 0.8, duration: gatherFor, ease: 'sine.out' }, gatherAt)
            .to(
              clocks,
              { questionWrite: 1, duration: PHASE.writeQuestion, ease: 'none' },
              questionAt,
            )
            .to(clocks, { streak: 0.06, duration: 1.2 }, questionAt)
            .to(clocks, { fade: 0.96, duration: 1.6 }, endAt - 1.6)
            .call(() => settledRef.current?.(), undefined, endAt)
        } else {
          timeline.call(() => settledRef.current?.(), undefined, 2.6)
        }

        const beatAt = (time: number) =>
          time < dissolveAt
            ? 'heart'
            : time < nameAt
              ? 'dissolve'
              : time < questionAt
                ? 'name'
                : 'question'

        let frame = 0
        let started = 0
        let driven = false
        const previous = new THREE.Vector4()
        const paint = (seconds: number) => {
          uniforms.uPrevTime.value = uniforms.uTime.value
          uniforms.uPrevClocks.value.copy(previous)
          uniforms.uTime.value = seconds
          uniforms.uCondense.value = clocks.condense
          uniforms.uRelease.value = clocks.release
          uniforms.uCurl.value = clocks.curl
          uniforms.uSpread.value = clocks.spread
          uniforms.uCurrent.value = clocks.current
          uniforms.uGather.value = clocks.gather
          uniforms.uNameWrite.value = clocks.nameWrite
          uniforms.uQuestionWrite.value = clocks.questionWrite
          uniforms.uHold.value = clocks.hold
          uniforms.uStreak.value = clocks.streak
          previous.set(clocks.release, clocks.gather, clocks.nameWrite, clocks.questionWrite)

          // Slow yaw only, never an orbit: enough to read the cloud as a body with depth.
          cloud.rotation.y =
            ((Math.sin((seconds * Math.PI * 2) / 20) * ((layout.mobile ? 5 : 8) * Math.PI)) / 180) *
            clocks.yaw

          fadeUniforms.uFade.value = clocks.fade
          renderer.setRenderTarget(accumulation)
          renderer.render(fadeScene, fadeCamera)
          renderer.clearDepth()
          renderer.render(scene, camera)
          renderer.setRenderTarget(null)
          composer.render()
          mount.dataset.beat = beatAt(seconds)
        }
        let running = false
        const loop = (now: number) => {
          if (running) {
            if (!started) started = now
            if (!driven) paint((now - started) * 0.001)
          } else {
            paint(0)
          }
          frame = requestAnimationFrame(loop)
        }
        const begin = () => {
          if (running) return
          running = true
          started = 0
          timeline.play(0)
        }
        startRef.current = begin
        if (activeRef.current) begin()
        frame = requestAnimationFrame(loop)

        // Deterministic driver for frame capture and for screenshotting an exact beat: the
        // wall clock drops and duplicates frames under load, an injected timestep does not.
        const capture = {
          duration: () => timeline.duration(),
          // The moments worth photographing, named rather than guessed. Tests and the evidence
          // script read these, so retiming a phase cannot leave them pointing at the wrong frame.
          beats: () => ({
            heart: dissolveAt - PHASE.hold * 0.5,
            dissolve: dissolveAt + PHASE.dissolve * 0.5,
            nameAlone: questionAt - 0.3,
            bothLines: endAt,
          }),
          seek: (seconds: number, step = 1 / 60) => {
            driven = true
            timeline.pause()
            // Trails are frame history; jumping in time has to drop what the old frames left.
            renderer.setRenderTarget(accumulation)
            renderer.clear(true, true, false)
            renderer.setRenderTarget(null)
            timeline.time(Math.max(0, seconds - step), false)
            paint(Math.max(0, seconds - step))
            timeline.time(seconds, false)
            paint(seconds)
          },
          resume: () => {
            driven = false
            started = 0
            timeline.play()
          },
        }
        // Stamped only once every GPU resource exists, so the attributes describe the frame
        // that is actually on screen: a failed context leaves the fallback's mark instead.
        mount.dataset.renderer = 'webgl-heart-writing'
        mount.dataset.particles = String(count)
        mount.dataset.beat = 'heart'

        window.heartSequence = capture

        let resizeTimer: ReturnType<typeof setTimeout> | null = null
        const resize = () => {
          width = Math.max(1, mount.clientWidth)
          height = Math.max(1, mount.clientHeight)
          const view = measureViewport(width, height)
          camera.aspect = width / height
          camera.position.z = view.distance
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
          composer.setSize(width, height)
          bloom.setSize(width, height)
          accumulation.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio))
          uniforms.uResolution.value.set(width, height)
          fadeUniforms.uResolution.value.set(width, height)
          if (resizeTimer) clearTimeout(resizeTimer)
          resizeTimer = setTimeout(() => {
            layout = buildLayout(props, width, height)
            for (let index = 0; index < count; index += 1) {
              const offset = index * 3
              const point = heartPoint(index)
              hearts[offset] = point.x * layout.heartScale
              hearts[offset + 1] = point.y * HEART_SQUASH * layout.heartScale + layout.heartCenterY
              hearts[offset + 2] = point.z * layout.heartScale
              const letter = createLetterPoint(index, count)
              positions[offset] = letter.x * layout.inheritScale
              positions[offset + 1] = letter.y * layout.inheritScale
              positions[offset + 2] = letter.z * layout.inheritScale
            }
            fillTargets()
            uniforms.uInkGain.value = inkGain(layout, layout.name.scale, count)
            uniforms.uBand.value.set(0, layout.bandY, 0)
            uniforms.uCurrentTo.value.set(layout.currentTo.x, layout.currentTo.y, 0)
            geometry.attributes.position.needsUpdate = true
            geometry.attributes.aHeart.needsUpdate = true
            geometry.attributes.aTarget.needsUpdate = true
            geometry.attributes.aWrite.needsUpdate = true
          }, 220)
        }
        addEventListener('resize', resize)

        teardown = () => {
          cancelAnimationFrame(frame)
          startRef.current = null
          delete window.heartSequence
          if (resizeTimer) clearTimeout(resizeTimer)
          removeEventListener('resize', resize)
          timeline.kill()
          geometry.dispose()
          material.dispose()
          fadeGeometry.dispose()
          fadeMaterial.dispose()
          accumulation.dispose()
          bloom.dispose()
          texturePass.dispose()
          composer.dispose()
          renderer.dispose()
          renderer.domElement.remove()
        }
      })
      .catch(() => {
        const mount = mountRef.current
        if (!mount) return
        mount.dataset.renderer = 'svg-fallback'
        mount.classList.add('is-fallback')
      })

    return () => {
      cancelled = true
      teardown()
    }
    // The sequence is built once from the copy it is handed; the copy never changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (props.active) startRef.current?.()
  }, [props.active])

  return <div className="heart-writing" ref={mountRef} aria-hidden="true" />
}
