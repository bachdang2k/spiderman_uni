import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { STORY_CONFIG } from '../config/story'
import { reducedMotion } from '../lib/motion'

type Props = {
  active: boolean
  departing: boolean
  onSettled: () => void
}

type ParticleKind = 'name' | 'butterfly' | 'ambient'

type Particle = {
  kind: ParticleKind
  seed: number
  delay: number
  startX: number
  startY: number
  startZ: number
  targetX: number
  targetY: number
  targetZ: number
  butterfly: number
  wingSide: number
  wingX: number
  wingY: number
  scale: number
  rotation: number
  rotationSpeed: number
}

const PALETTE = ['#f7d7d8', '#f3b8bf', '#d96c75', '#f7f1e3', '#c95567']
const BUTTERFLY_COUNT_DESKTOP = 4
const BUTTERFLY_COUNT_MOBILE = 3

function random(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function easeInOutCubic(value: number) {
  if (value < 0.5) return 4 * value * value * value
  return 1 - Math.pow(-2 * value + 2, 3) / 2
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function createPetalTexture(THREE: typeof import('three')) {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)

  const gradient = context.createLinearGradient(16, 112, 76, 12)
  gradient.addColorStop(0, 'rgba(197, 75, 94, .96)')
  gradient.addColorStop(0.54, 'rgba(255, 230, 231, .98)')
  gradient.addColorStop(1, 'rgba(255, 250, 243, .9)')
  context.fillStyle = gradient
  context.beginPath()
  context.moveTo(48, 116)
  context.bezierCurveTo(24, 98, 8, 62, 18, 32)
  context.bezierCurveTo(24, 14, 42, 9, 56, 17)
  context.bezierCurveTo(75, 28, 88, 44, 81, 64)
  context.bezierCurveTo(73, 88, 59, 105, 48, 116)
  context.fill()

  const fold = context.createLinearGradient(42, 40, 58, 92)
  fold.addColorStop(0, 'rgba(255,255,255,.72)')
  fold.addColorStop(1, 'rgba(131,38,60,.18)')
  context.strokeStyle = fold
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(48, 108)
  context.quadraticCurveTo(54, 72, 49, 30)
  context.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function sampleNameTargets(count: number, targetWidth: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = 360
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return Array.from({ length: count }, () => ({ x: 0, y: 0 }))

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '500 238px "Cormorant Garamond", Georgia, serif'
  context.fillText(STORY_CONFIG.girlName.toUpperCase(), canvas.width / 2, canvas.height / 2 + 8)

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const candidates: Array<{ x: number; y: number }> = []
  const step = targetWidth < 4 ? 5 : 4
  for (let y = 10; y < canvas.height - 10; y += step) {
    for (let x = 10; x < canvas.width - 10; x += step) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 100) candidates.push({ x, y })
    }
  }

  const targetHeight = targetWidth * (canvas.height / canvas.width)
  return Array.from({ length: count }, (_, index) => {
    const candidate = candidates[Math.floor((index / count) * candidates.length)] ?? {
      x: canvas.width / 2,
      y: canvas.height / 2,
    }
    const jitterX = (random(index + 181) - 0.5) * 0.025
    const jitterY = (random(index + 283) - 0.5) * 0.025
    return {
      x: (candidate.x / canvas.width - 0.5) * targetWidth + jitterX,
      y: (0.5 - candidate.y / canvas.height) * targetHeight + jitterY,
    }
  })
}

export function SakuraNameReveal({ active, departing, onSettled }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  const timelineRef = useRef({ progress: 0, guide: 0, departure: 0 })
  const onSettledRef = useRef(onSettled)

  useEffect(() => {
    onSettledRef.current = onSettled
  }, [onSettled])

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    if (!active) return
    const reduce = reducedMotion()
    const reveal = gsap
      .timeline()
      .to(timelineRef.current, {
        progress: 1,
        duration: reduce ? 0.01 : 7.1,
        ease: 'none',
      })
      .to({}, { duration: reduce ? 0.01 : 2 })
      .to(timelineRef.current, {
        guide: 1,
        duration: reduce ? 0.01 : 0.9,
        ease: 'power2.inOut',
        onStart: () => onSettledRef.current(),
      })
    return () => {
      reveal.kill()
    }
  }, [active])

  useEffect(() => {
    const departure = gsap.to(timelineRef.current, {
      departure: departing ? 1 : 0,
      duration: reducedMotion() ? 0.01 : 1.15,
      ease: 'power3.inOut',
    })
    return () => {
      departure.kill()
    }
  }, [departing])

  useEffect(() => {
    let cancelled = false
    let teardown = () => {}

    void Promise.all([import('three'), document.fonts.ready])
      .then(([THREE]) => {
        if (cancelled || !mountRef.current) return
        const mount = mountRef.current
        let width = Math.max(1, mount.clientWidth)
        let height = Math.max(1, mount.clientHeight)
        const isMobile = width < 700
        const count = isMobile ? 620 : 1_180
        const butterflyCount = isMobile ? BUTTERFLY_COUNT_MOBILE : BUTTERFLY_COUNT_DESKTOP
        const butterflyParticles = Math.floor(count * 0.14)
        const ambientParticles = Math.floor(count * 0.05)
        const nameParticles = count - butterflyParticles - ambientParticles

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 30)
        camera.position.z = 8
        const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
        const visibleWidth = visibleHeight * camera.aspect
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 1.7))
        renderer.setSize(width, height)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        mount.appendChild(renderer.domElement)
        const onContextLost = (event: Event) => {
          event.preventDefault()
          mount.classList.add('is-fallback')
        }
        renderer.domElement.addEventListener('webglcontextlost', onContextLost)

        const texture = createPetalTexture(THREE)
        const geometry = new THREE.PlaneGeometry(0.19, 0.27)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.05,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
        const mesh = new THREE.InstancedMesh(geometry, material, count)
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        scene.add(mesh)

        const targets = sampleNameTargets(nameParticles, Math.min(8.25, visibleWidth * 0.9))
        const particlesPerButterfly = Math.max(1, Math.floor(butterflyParticles / butterflyCount))
        const particles: Particle[] = Array.from({ length: count }, (_, index) => {
          const seed = index + 1
          const angle = random(seed * 3.1) * Math.PI * 2
          const radius = 2.7 + random(seed * 5.3) * 4.8
          const kind: ParticleKind =
            index < nameParticles
              ? 'name'
              : index < nameParticles + butterflyParticles
                ? 'butterfly'
                : 'ambient'
          const butterflyIndex = Math.floor(
            ((index - nameParticles) / Math.max(1, butterflyParticles)) * butterflyCount,
          )
          const target = targets[index] ?? { x: 0, y: 0 }
          const butterflyParticle = Math.max(0, index - nameParticles)
          const butterflyLocalIndex = butterflyParticle % particlesPerButterfly
          const isButterflyBody = kind === 'butterfly' && butterflyLocalIndex % 9 === 0
          const wingSide = isButterflyBody ? 0 : butterflyLocalIndex % 2 === 0 ? 1 : -1
          const wingRadius = Math.sqrt(random(seed * 21.3))
          return {
            kind,
            seed,
            delay: random(seed * 8.7) * 0.19,
            startX: Math.cos(angle) * radius + (random(seed * 7.9) - 0.5) * 3.2,
            startY: Math.sin(angle) * radius + (random(seed * 9.2) - 0.5) * 4.8,
            startZ: (random(seed * 4.4) - 0.5) * 4.2,
            targetX: target.x,
            targetY: target.y,
            targetZ: (random(seed * 11.2) - 0.5) * 0.26,
            butterfly: Math.max(0, Math.min(butterflyCount - 1, butterflyIndex)),
            wingSide,
            wingX: wingSide * (0.075 + wingRadius * 0.3),
            wingY: isButterflyBody
              ? -0.15 + (butterflyLocalIndex / particlesPerButterfly) * 0.3
              : (random(seed * 17.1) - 0.43) * (0.28 + wingRadius * 0.28),
            scale: 0.58 + random(seed * 12.6) * 0.92,
            rotation: random(seed * 15.8) * Math.PI * 2,
            rotationSpeed: (random(seed * 18.4) - 0.5) * 2.2,
          }
        })

        const color = new THREE.Color()
        particles.forEach((particle, index) => {
          color.set(
            particle.kind === 'butterfly' && particle.wingSide === 0
              ? '#d4a84f'
              : PALETTE[Math.floor(random(particle.seed * 33.1) * PALETTE.length)],
          )
          mesh.setColorAt(index, color)
        })
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

        const dummy = new THREE.Object3D()
        const pointer = { x: 0, y: 0 }
        const move = (event: PointerEvent) => {
          pointer.x = (event.clientX / innerWidth - 0.5) * 0.14
          pointer.y = (event.clientY / innerHeight - 0.5) * 0.1
        }
        addEventListener('pointermove', move, { passive: true })

        const butterflyCenter = (butterfly: number, time: number) => {
          const phase = (butterfly / butterflyCount) * Math.PI * 2
          const orbitX = width < 700 ? 1.1 : 3.75
          const orbitY = width < 700 ? 1.32 : 1.68
          return {
            x: Math.cos(time * (0.22 + butterfly * 0.018) + phase) * orbitX,
            y:
              Math.sin(time * (0.31 + butterfly * 0.015) + phase) * orbitY +
              Math.sin(time * 0.7 + phase) * 0.18,
            z: Math.sin(time * 0.27 + phase) * 0.85,
          }
        }

        let frame = 0
        const start = performance.now()
        const draw = (now: number) => {
          if (!activeRef.current) {
            frame = requestAnimationFrame(draw)
            return
          }
          const time = (now - start) / 1000
          const progress = timelineRef.current.progress
          const driftPhase = clamp01(progress / 0.34)
          const windPhase = clamp01((progress - 0.27) / 0.32)
          const settlePhase = easeInOutCubic(clamp01((progress - 0.51) / 0.46))
          const guide = timelineRef.current.guide
          const departure = timelineRef.current.departure

          particles.forEach((particle, index) => {
            const seed = particle.seed
            const sway =
              Math.sin(time * (0.72 + random(seed) * 0.8) + seed) * (0.28 + particle.startZ * 0.03)
            const lift = Math.cos(time * 0.58 + seed * 0.77) * 0.22
            const driftX = particle.startX + sway + time * (random(seed * 2.2) - 0.48) * 0.16
            const driftY = particle.startY - time * (0.1 + random(seed * 6.2) * 0.13) + lift
            const driftZ = particle.startZ + Math.sin(time * 0.41 + seed) * 0.16

            const ribbon = (index % 6) - 2.5
            const curlAngle = time * (0.82 + ribbon * 0.025) + seed * 0.013
            const curlRadius = 1.45 + Math.abs(ribbon) * 0.46 + random(seed * 9.3) * 0.5
            const curlX = Math.cos(curlAngle) * curlRadius + ribbon * 0.18
            const curlY = Math.sin(curlAngle * 1.13) * (1.25 + Math.abs(ribbon) * 0.12)
            const curlZ = Math.sin(curlAngle * 0.73 + ribbon) * 1.05
            const wind = easeInOutCubic(windPhase)
            let x = driftX + (curlX - driftX) * wind
            let y = driftY + (curlY - driftY) * wind
            let z = driftZ + (curlZ - driftZ) * wind

            if (particle.kind === 'name') {
              const localSettle = easeInOutCubic(
                clamp01((settlePhase - particle.delay) / Math.max(0.01, 1 - particle.delay)),
              )
              const orbit = Math.sin(localSettle * Math.PI) * (0.3 + random(seed * 4.1) * 0.42)
              x += (particle.targetX - x) * localSettle + Math.cos(curlAngle * 1.4) * orbit
              y +=
                (particle.targetY - y) * localSettle +
                Math.sin(curlAngle * 1.4) * orbit * 0.55 +
                Math.sin(time * 0.9 + seed) * 0.006 * localSettle
              z += (particle.targetZ - z) * localSettle
            } else if (particle.kind === 'butterfly') {
              const center = butterflyCenter(particle.butterfly, time)
              if (particle.butterfly === 0) {
                center.x += (-0.62 - center.x) * guide
                center.y += (-2.24 - center.y) * guide
                center.z += (1.15 - center.z) * guide
              }
              const flap =
                0.18 + Math.abs(Math.sin(time * (4.8 + particle.butterfly * 0.37))) * 0.82
              const targetX = center.x + particle.wingX * flap
              const targetY = center.y + particle.wingY
              const targetZ = center.z + Math.abs(particle.wingX) * (1 - flap) * 0.6
              x += (targetX - x) * settlePhase
              y += (targetY - y) * settlePhase
              z += (targetZ - z) * settlePhase
            }

            if (particle.kind === 'ambient') {
              x += Math.sin(time * 0.36 + seed) * 0.7 * driftPhase
              y -= time * 0.12
            }

            if (departure > 0) {
              const direction =
                particle.kind === 'butterfly' && particle.butterfly === 0 ? 1 : -0.22
              x += departure * direction * 4.2
              y += departure * (particle.kind === 'butterfly' ? 1.2 : -1.8)
              z += departure * 1.4
            }

            const perspectiveScale = Math.max(0.48, 1 + z * 0.09)
            const kindScale =
              particle.kind === 'name'
                ? width < 700
                  ? 0.34
                  : 0.68
                : particle.kind === 'butterfly'
                  ? width < 700
                    ? 0.58
                    : 0.74
                  : width < 700
                    ? 0.65
                    : 1
            dummy.position.set(x, y, z)
            if (particle.kind === 'butterfly' && settlePhase > 0.7) {
              const flap = Math.sin(time * (4.8 + particle.butterfly * 0.37))
              dummy.rotation.set(
                particle.wingSide === 0 ? 0 : particle.wingSide * flap * 0.32,
                particle.wingSide * Math.abs(flap) * 0.72,
                particle.wingSide === 0 ? 0 : particle.wingSide * (0.58 + particle.wingY),
              )
            } else {
              dummy.rotation.set(
                particle.rotation + time * particle.rotationSpeed * 0.36,
                time * particle.rotationSpeed * 0.28 + Math.sin(seed + time) * 0.4,
                particle.rotation + time * particle.rotationSpeed,
              )
            }
            dummy.scale.setScalar(particle.scale * perspectiveScale * kindScale)
            dummy.updateMatrix()
            mesh.setMatrixAt(index, dummy.matrix)
          })

          mesh.instanceMatrix.needsUpdate = true
          camera.position.x += (pointer.x - camera.position.x) * 0.025
          camera.position.y += (-pointer.y - camera.position.y) * 0.025
          renderer.render(scene, camera)
          frame = requestAnimationFrame(draw)
        }
        frame = requestAnimationFrame(draw)

        const onResize = () => {
          width = Math.max(1, mount.clientWidth)
          height = Math.max(1, mount.clientHeight)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
          const nextVisibleWidth =
            2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect
          const nextTargets = sampleNameTargets(
            nameParticles,
            Math.min(8.25, nextVisibleWidth * 0.9),
          )
          for (let index = 0; index < nameParticles; index += 1) {
            particles[index].targetX = nextTargets[index].x
            particles[index].targetY = nextTargets[index].y
          }
        }
        addEventListener('resize', onResize)

        teardown = () => {
          cancelAnimationFrame(frame)
          removeEventListener('pointermove', move)
          removeEventListener('resize', onResize)
          geometry.dispose()
          material.dispose()
          texture.dispose()
          renderer.dispose()
          renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
          renderer.domElement.remove()
        }
      })
      .catch(() => mountRef.current?.classList.add('is-fallback'))

    return () => {
      cancelled = true
      teardown()
    }
  }, [])

  return (
    <div className="sakura-name-reveal" ref={mountRef} aria-hidden="true">
      <div className="sakura-name-fallback">
        <span>{STORY_CONFIG.girlName.toUpperCase()}</span>
        <i className="fallback-butterfly fallback-butterfly--one" />
        <i className="fallback-butterfly fallback-butterfly--two" />
      </div>
    </div>
  )
}
