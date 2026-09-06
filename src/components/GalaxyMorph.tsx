import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { reducedMotion } from '../lib/motion'
import { gaussian, random } from '../lib/noise'
import { createLetterPoint } from '../lib/galaxyLetter'

/** The six is slow on purpose: it is the last thing the viewer touches before the ending runs. */
export const MORPH_SECONDS = 6.4
/** The letter leaves before the ending picks it up, so the two L's are not one continuous object. */
export const DEPART_SECONDS = 0.8
/** How long the sky is held empty. The ending's L then arrives as a cut, not as a continuation. */
export const GAP_SECONDS = 0.7
import galaxyReferenceUrl from '../assets/references/galaxy-six-mask.png'

type GalaxyPoint = {
  x: number
  y: number
  z: number
  t: number
}

type ReferenceStar = GalaxyPoint & {
  red: number
  green: number
  blue: number
}

const VERTEX_SHADER = `
  attribute vec3 aTarget;
  attribute float aSize;
  attribute float aPhase;
  attribute float aOrder;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uMorph;
  uniform float uTime;
  uniform float uPixelRatio;

  void main() {
    float localMorph = clamp((uMorph - aOrder * 0.16) / 0.84, 0.0, 1.0);
    float eased = localMorph * localMorph * (3.0 - 2.0 * localMorph);
    float flight = sin(eased * 3.14159265);
    vec3 delta = aTarget - position;
    vec3 side = normalize(vec3(-delta.y, delta.x, 0.001));
    float grain = 0.5 + 0.5 * sin(aPhase * 1.73);
    vec3 transformed = mix(position, aTarget, eased);
    transformed += side * flight * (0.1 + grain * 0.24);
    transformed.y += flight * (0.08 + aOrder * 0.18);
    transformed.z += flight * sin(aPhase + uTime * 0.22) * 0.34;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    float pulse = 0.78 + 0.22 * sin(uTime * (0.72 + mod(aPhase, 1.7)) + aPhase);
    vColor = color;
    vTwinkle = pulse;
    float morphEnergy = mix(1.0, 1.13, uMorph);
    gl_PointSize = max(0.65, aSize * pulse * morphEnergy * uPixelRatio * (7.2 / -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uDepart;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float core = 1.0 - smoothstep(0.03, 0.19, distanceToCenter);
    float halo = 1.0 - smoothstep(0.09, 0.5, distanceToCenter);
    float alpha = (core + halo * 0.52) * (0.76 + vTwinkle * 0.24) * (1.0 - uDepart);
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(vColor * (1.0 + vTwinkle * 0.34), alpha);
  }
`

const STAR_COLORS = ['#f7f1e3', '#dcecff', '#b9d9ff', '#ffffff', '#f2c889']
const FLARE_STOPS = [0.25, 0.48, 0.68, 0.86, 0.97]

function spiralPoint(t: number, lane: number, seed: number): GalaxyPoint {
  const laneOffset = (lane - 2) * (0.055 + t * 0.038)
  const angle = 1.2 - t * Math.PI * 4.18 - laneOffset * 3.4
  const radius = 0.08 + Math.pow(t, 0.91) * 2.62
  const breathing = Math.sin(t * 37 + lane * 2.4) * 0.035 + Math.sin(t * 83) * 0.014
  const thickness = 0.018 + t * 0.055
  const radialNoise = gaussian(seed * 1.71) * thickness
  const tangentialNoise = gaussian(seed * 2.37) * thickness * 0.52
  const r = radius + laneOffset + breathing + radialNoise

  return {
    x: Math.cos(angle) * r * 0.93 - Math.sin(angle) * tangentialNoise,
    y: Math.sin(angle) * r * 1.06 + Math.cos(angle) * tangentialNoise - 0.4,
    z: gaussian(seed * 3.19) * (0.08 + t * 0.22),
    t,
  }
}

function createGalaxyPoint(index: number): GalaxyPoint {
  const seed = index + 17
  const category = random(seed * 4.7)

  if (category < 0.145) {
    const radius = Math.pow(random(seed * 2.1), 1.85) * 0.34
    const angle = random(seed * 5.4) * Math.PI * 2
    return {
      x: Math.cos(angle) * radius * 0.92,
      y: Math.sin(angle) * radius - 0.4,
      z: gaussian(seed * 7.3) * 0.16,
      t: 0,
    }
  }

  if (category > 0.984) {
    return {
      x: (random(seed * 8.2) - 0.5) * 6.9,
      y: (random(seed * 9.1) - 0.5) * 6.4 - 0.1,
      z: (random(seed * 11.8) - 0.5) * 2.2,
      t: 1,
    }
  }

  const lane = Math.floor(random(seed * 13.1) * 5)
  const segmentCount = 22
  const segment = Math.floor(random(seed * 17.9) * segmentCount)
  const withinSegment = Math.pow(random(seed * 19.7), 1.25) * 0.72
  const t = (segment + withinSegment + (lane % 3) * 0.11) / segmentCount
  return spiralPoint(t, lane, seed)
}

function loadReferenceStars() {
  return new Promise<ReferenceStar[]>((resolve) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        resolve([])
        return
      }
      context.drawImage(image, 0, 0)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      const candidates: ReferenceStar[] = []

      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const offset = (y * canvas.width + x) * 4
          const red = pixels[offset]
          const green = pixels[offset + 1]
          const blue = pixels[offset + 2]
          const brightness = Math.max(red, green, blue) / 255
          if (brightness < 0.2) continue
          const pixelSeed = y * canvas.width + x
          if (random(pixelSeed * 0.173) > Math.pow(brightness, 0.72) * 0.62) continue

          const worldX = (x / canvas.width - 0.5) * 4.85
          const worldY = (0.5 - y / canvas.height) * 5.18 - 0.06
          const distanceFromCore = Math.hypot(worldX + 0.12, worldY + 0.72)
          candidates.push({
            x: worldX,
            y: worldY,
            z: gaussian(pixelSeed * 0.037) * 0.18,
            t: Math.min(1, distanceFromCore / 2.85),
            red,
            green,
            blue,
          })
        }
      }
      resolve(candidates)
    }
    image.onerror = () => resolve([])
    image.src = galaxyReferenceUrl
  })
}

function createRadialTexture(THREE: typeof import('three'), cross = false) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)

  context.translate(64, 64)
  const glow = context.createRadialGradient(0, 0, 0, 0, 0, 54)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.08, 'rgba(235,245,255,.92)')
  glow.addColorStop(0.34, 'rgba(148,198,255,.22)')
  glow.addColorStop(1, 'rgba(70,120,210,0)')
  context.fillStyle = glow
  context.fillRect(-64, -64, 128, 128)

  if (cross) {
    const ray = context.createLinearGradient(-58, 0, 58, 0)
    ray.addColorStop(0, 'rgba(255,255,255,0)')
    ray.addColorStop(0.47, 'rgba(255,255,255,.16)')
    ray.addColorStop(0.5, 'rgba(255,255,255,.92)')
    ray.addColorStop(0.53, 'rgba(255,255,255,.16)')
    ray.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = ray
    context.fillRect(-58, -1, 116, 2)
    context.rotate(Math.PI / 2)
    context.fillRect(-58, -1, 116, 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function GalaxyMorph({ morphed }: { morphed: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef({ value: 0 })
  const departRef = useRef({ value: 0 })

  useEffect(() => {
    let cancelled = false
    let teardown = () => {}

    void Promise.all([import('three'), loadReferenceStars()])
      .then(([THREE, referenceStars]) => {
        if (cancelled || !mountRef.current) return
        const mount = mountRef.current
        let width = Math.max(1, mount.clientWidth)
        let height = Math.max(1, mount.clientHeight)
        const isMobile = width < 600
        const count = isMobile ? 5_800 : 11_500
        mount.dataset.renderer = 'webgl-game-stars'
        mount.dataset.starCount = String(count)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 30)
        camera.position.z = 7.4
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        const pixelRatio = Math.min(devicePixelRatio, isMobile ? 1.35 : 1.7)
        renderer.setPixelRatio(pixelRatio)
        renderer.setSize(width, height)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        mount.appendChild(renderer.domElement)

        const positions = new Float32Array(count * 3)
        const targets = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const phases = new Float32Array(count)
        const orders = new Float32Array(count)
        const color = new THREE.Color()

        for (let index = 0; index < count; index += 1) {
          const reference =
            referenceStars.length > 0
              ? referenceStars[(index * 7_919) % referenceStars.length]
              : null
          const point = reference ?? createGalaxyPoint(index)
          const target = createLetterPoint(index, count)
          const offset = index * 3
          positions.set([point.x, point.y, point.z], offset)
          targets.set([target.x, target.y, target.z], offset)

          if (reference) {
            color.setRGB(
              Math.min(1, 0.22 + (reference.red / 255) * 0.92),
              Math.min(1, 0.22 + (reference.green / 255) * 0.92),
              Math.min(1, 0.24 + (reference.blue / 255) * 0.96),
            )
          } else {
            const warm = random(index * 31.7) > 0.91
            const colorIndex = warm ? 4 : Math.floor(random(index * 37.9) * 4)
            color.set(STAR_COLORS[colorIndex])
          }
          colors.set([color.r, color.g, color.b], offset)
          const rareBright = random(index * 41.3) > 0.988
          sizes[index] = rareBright
            ? 2.1 + random(index * 43.7) * 1.15
            : point.t < 0.08
              ? 0.78 + random(index * 47.2) * 1.12
              : 0.62 + random(index * 47.2) * 0.86
          phases[index] = random(index * 53.8) * Math.PI * 2
          orders[index] = Math.min(1, (1 - point.t) * 0.72 + random(index * 59.1) * 0.28)
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
        geometry.setAttribute('aOrder', new THREE.BufferAttribute(orders, 1))

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uMorph: { value: progressRef.current.value },
            uTime: { value: 0 },
            uPixelRatio: { value: pixelRatio },
            uDepart: { value: departRef.current.value },
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true,
        })
        const stars = new THREE.Points(geometry, material)
        scene.add(stars)

        const glowTexture = createRadialTexture(THREE)
        const coreMaterial = new THREE.SpriteMaterial({
          map: glowTexture,
          color: '#a8d6ff',
          transparent: true,
          opacity: 0.26,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const core = new THREE.Sprite(coreMaterial)
        core.position.set(0, -0.4, -0.28)
        core.scale.set(1.15, 1.15, 1)
        scene.add(core)

        const flareTexture = createRadialTexture(THREE, true)
        const flares = FLARE_STOPS.slice(0, isMobile ? 4 : 5).map((t, index) => {
          const point = spiralPoint(t, index % 5, 900 + index)
          const flareMaterial = new THREE.SpriteMaterial({
            map: flareTexture,
            color: index === 2 ? '#f3c680' : '#e7f2ff',
            transparent: true,
            opacity: 0.58,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
          const flare = new THREE.Sprite(flareMaterial)
          flare.position.set(point.x, point.y, point.z + 0.12)
          const scale = index === 1 ? 0.44 : 0.25 + random(index * 67.4) * 0.15
          flare.scale.set(scale, scale, 1)
          scene.add(flare)
          return { flare, material: flareMaterial, point, phase: index * 1.71 }
        })

        const pointer = { x: 0, y: 0 }
        const move = (event: PointerEvent) => {
          pointer.x = (event.clientX / innerWidth - 0.5) * 0.12
          pointer.y = (event.clientY / innerHeight - 0.5) * 0.08
        }
        addEventListener('pointermove', move, { passive: true })

        let frame = 0
        const draw = (time: number) => {
          const seconds = time * 0.001
          const morph = progressRef.current.value
          const depart = departRef.current.value
          material.uniforms.uMorph.value = morph
          material.uniforms.uTime.value = seconds
          material.uniforms.uDepart.value = depart
          stars.rotation.z = Math.sin(seconds * 0.12) * 0.012 * (1 - morph)
          stars.rotation.y += (pointer.x - stars.rotation.y) * 0.025
          stars.rotation.x += (-pointer.y - stars.rotation.x) * 0.025
          core.material.opacity = 0.22 * (1 - morph) * (1 - depart)
          flares.forEach(({ flare, material: flareMaterial, point, phase }, index) => {
            const target = createLetterPoint(Math.floor((index / flares.length) * count), count)
            const eased = morph * morph * (3 - 2 * morph)
            flare.position.x = point.x + (target.x - point.x) * eased
            flare.position.y = point.y + (target.y - point.y) * eased
            flare.position.z = point.z + (target.z - point.z) * eased
            flareMaterial.opacity =
              (0.48 + Math.sin(seconds * 0.7 + phase) * 0.1) * (1 - morph * 0.28) * (1 - depart)
          })
          renderer.render(scene, camera)
          frame = requestAnimationFrame(draw)
        }
        frame = requestAnimationFrame(draw)

        const resize = () => {
          width = Math.max(1, mount.clientWidth)
          height = Math.max(1, mount.clientHeight)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }
        addEventListener('resize', resize)

        teardown = () => {
          cancelAnimationFrame(frame)
          removeEventListener('resize', resize)
          removeEventListener('pointermove', move)
          geometry.dispose()
          material.dispose()
          coreMaterial.dispose()
          glowTexture.dispose()
          flareTexture.dispose()
          flares.forEach(({ material: flareMaterial }) => flareMaterial.dispose())
          renderer.dispose()
          renderer.domElement.remove()
        }
      })
      .catch(() => mountRef.current?.classList.add('is-fallback'))

    return () => {
      cancelled = true
      teardown()
    }
  }, [])

  useEffect(() => {
    const reduce = reducedMotion()
    const morph = gsap.to(progressRef.current, {
      value: morphed ? 1 : 0,
      duration: reduce ? 0.01 : MORPH_SECONDS,
      ease: 'power2.inOut',
    })
    // Once the letter has settled it leaves the sky, so the ending's L arrives on an empty
    // frame instead of appearing to be the same object carried across the scene change.
    const depart = gsap.to(departRef.current, {
      value: morphed ? 1 : 0,
      duration: reduce ? 0.01 : DEPART_SECONDS,
      delay: morphed && !reduce ? MORPH_SECONDS : 0,
      ease: 'power2.in',
    })
    return () => {
      morph.kill()
      depart.kill()
    }
  }, [morphed])

  return <div className="galaxy-morph" ref={mountRef} aria-hidden="true" />
}
