export function WonderHeroine({ awakened = false }: { awakened?: boolean }) {
  return (
    <svg
      className={`wonder-heroine ${awakened ? 'is-awake' : ''}`}
      viewBox="0 0 360 460"
      role="img"
      aria-label="An original heroine silhouette inside a comic panel"
    >
      <path
        className="heroine-cape"
        d="M177 126C94 146 48 249 34 414c68-28 113-28 148 2 37-30 80-30 144-2-15-168-66-266-149-288Z"
      />
      <circle className="heroine-head" cx="179" cy="103" r="48" />
      <path
        className="heroine-hair"
        d="M131 103c2-67 99-73 101 3 3 65-17 91-32 101l-21-40-22 40c-18-15-31-49-26-104Z"
      />
      <path className="heroine-tiara" d="m142 83 36 12 38-12-15 26h-46Z" />
      <path className="heroine-body" d="M127 163c28-25 76-25 104 0l23 153-75 73-74-73Z" />
      <path className="heroine-line" d="m132 176 47 35 48-35M179 211v154M118 277h123" />
      <g className="heroine-emblem">
        <circle cx="179" cy="250" r="42" />
        <path d="m153 240 26 25 28-35M151 256l28 28 31-39" />
      </g>
      <path className="heroine-arm" d="M126 190 75 278M231 190l54 88" />
      <path className="heroine-bracelet" d="m69 264 22 13M269 278l23-14" />
    </svg>
  )
}
