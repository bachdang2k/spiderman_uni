export function MysterySeed({ opened }: { opened: boolean }) {
  return (
    <div className={`mystery-seed ${opened ? 'is-open' : ''}`} aria-hidden="true">
      <i className="seed-core" />
      {Array.from({ length: 6 }, (_, index) => (
        <i className="seed-orbit" key={index} style={{ '--i': index } as React.CSSProperties} />
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <b className="seed-star" key={index} style={{ '--i': index } as React.CSSProperties} />
      ))}
    </div>
  )
}
