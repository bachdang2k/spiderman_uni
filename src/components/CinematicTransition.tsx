export function CinematicTransition({ visible }: { visible: boolean }) {
  return (
    <div className={`transition-wipe ${visible ? 'is-visible' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  )
}
