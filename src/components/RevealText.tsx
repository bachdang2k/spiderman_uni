export function RevealText({
  lines,
  className = '',
}: {
  lines: readonly string[]
  className?: string
}) {
  return (
    <div className={`reveal-text ${className}`}>
      {lines.map((line, i) => (
        <div key={i} className="line-mask">
          <p data-reveal>{line}</p>
        </div>
      ))}
    </div>
  )
}
