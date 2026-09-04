export function SakuraRain({ awakened }: { awakened: boolean }) {
  const petals = Array.from({ length: 18 }, (_, index) => index)
  return (
    <svg
      className={`sakura-rain ${awakened ? 'is-awake' : ''}`}
      viewBox="0 0 640 560"
      role="img"
      aria-label="A raindrop touching a cherry blossom branch"
    >
      <defs>
        <linearGradient id="rainDrop" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f7f1e3" stopOpacity=".9" />
          <stop offset="1" stopColor="#6986c9" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <path className="rain-thread" d="M320 0v200" />
      <path
        className="rain-drop"
        d="M320 164c-24 34-30 47-30 63a30 30 0 0 0 60 0c0-16-6-29-30-63Z"
      />
      <path
        className="sakura-branch"
        d="M42 474c136-5 185-89 267-166 72-67 145-75 289-84M164 430c16-68 4-105-23-143M309 308c-2-58 19-100 58-139M430 260c54 4 89-15 118-59"
      />
      {petals.map((index) => {
        const x = 105 + ((index * 83) % 450)
        const y = 205 + ((index * 61) % 225)
        return (
          <g
            className="sakura-petal"
            key={index}
            style={{ '--i': index, '--x': `${(index % 5) * 18 - 36}px` } as React.CSSProperties}
            transform={`translate(${x} ${y}) rotate(${index * 37})`}
          >
            <ellipse cy="-10" rx="8" ry="15" />
            <ellipse cy="10" rx="8" ry="15" transform="rotate(72)" />
            <ellipse cy="-10" rx="8" ry="15" transform="rotate(144)" />
            <circle r="3" />
          </g>
        )
      })}
      {petals.map((index) => {
        const radius = 18 + index * 4.5
        const x = 320 + Math.sin(index * 0.82) * radius
        const y = 330 - index * 14
        return (
          <ellipse
            className="rain-flying-petal"
            key={`flying-${index}`}
            cx={x}
            cy={y}
            rx="7"
            ry="14"
            transform={`rotate(${index * 29} ${x} ${y})`}
            style={{ '--i': index } as React.CSSProperties}
          />
        )
      })}
      <circle className="rain-ripple" cx="320" cy="308" r="12" />
    </svg>
  )
}
