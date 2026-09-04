export function FlowerBloom({ open = false, small = false }: { open?: boolean; small?: boolean }) {
  return (
    <svg
      className={`flower ${open ? 'flower--open' : ''} ${small ? 'flower--small' : ''}`}
      viewBox="0 0 240 300"
      role="img"
      aria-label="A flower drawn in ink"
    >
      <defs>
        <linearGradient id="petal" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f1aaa9" />
          <stop offset="1" stopColor="#a83248" />
        </linearGradient>
      </defs>
      <path className="stem" d="M120 285 C108 222 140 171 120 125" />
      <path className="leaf" d="M116 226 C76 192 52 221 110 240" />
      <path className="leaf" d="M127 196 C167 163 183 198 130 214" />
      <g className="petals" transform="translate(120 116)">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            className="petal"
            rx="25"
            ry="60"
            transform={`rotate(${i * 45}) translate(0 -34)`}
          />
        ))}
      </g>
      <circle className="flower-core" cx="120" cy="116" r="20" />
    </svg>
  )
}
