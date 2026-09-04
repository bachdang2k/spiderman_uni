export function Constellation({
  selected = -1,
  onSelect,
}: {
  selected?: number
  onSelect?: (i: number) => void
}) {
  const pts = [
    [16, 62],
    [34, 29],
    [52, 53],
    [70, 21],
    [85, 57],
  ]
  return (
    <svg
      className={`constellation ${selected >= 0 ? 'is-drawn' : ''}`}
      viewBox="0 0 100 80"
      aria-label="Choose a star"
    >
      <polyline points={pts.map((p) => p.join(',')).join(' ')} />
      {pts.map((p, i) => (
        <g
          key={i}
          className={selected === i ? 'selected' : ''}
          onClick={() => onSelect?.(i)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect?.(i)
            }
          }}
          role={onSelect ? 'button' : undefined}
          aria-label={onSelect ? `Choose star ${i + 1}` : undefined}
          tabIndex={onSelect ? 0 : undefined}
        >
          <circle cx={p[0]} cy={p[1]} r="8" className="star-hit" />
          <circle cx={p[0]} cy={p[1]} r={i === selected ? 2.3 : 1.2} className="star-dot" />
        </g>
      ))}
    </svg>
  )
}
