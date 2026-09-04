import { MousePointer2 } from 'lucide-react'

export function InteractiveHint({
  children,
  hidden = false,
}: {
  children: React.ReactNode
  hidden?: boolean
}) {
  return (
    <div className={`hint ${hidden ? 'hint--hidden' : ''}`}>
      <MousePointer2 size={14} strokeWidth={1.5} />
      <span>{children}</span>
    </div>
  )
}
