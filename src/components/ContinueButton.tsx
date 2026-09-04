import { ArrowDown } from 'lucide-react'

export function ContinueButton({
  onClick,
  label = 'Continue',
  disabled = false,
}: {
  onClick: () => void
  label?: string
  disabled?: boolean
}) {
  return (
    <button className="continue" onClick={onClick} disabled={disabled} data-cursor="action">
      <span>{label}</span>
      <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}
