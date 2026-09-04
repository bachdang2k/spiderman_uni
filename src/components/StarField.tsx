import { ParticleBackground } from './ParticleBackground'
export function StarField({ dense = false }: { dense?: boolean }) {
  return (
    <div className="star-field">
      <ParticleBackground count={dense ? 90 : 55} color="#f3d48d" speed={0.07} connect={dense} />
      <div className="nebula" />
    </div>
  )
}
