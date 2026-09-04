import { Volume2, VolumeX } from 'lucide-react'

export function SoundToggle({ enabled, toggle }: { enabled: boolean; toggle: () => void }) {
  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      aria-label={enabled ? 'Turn sound off' : 'Turn sound on'}
      data-cursor="action"
    >
      {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      <span>SOUND {enabled ? 'ON' : 'OFF'}</span>
    </button>
  )
}
