export function SceneProgress({ index, total }: { index: number; total: number }) {
  const pct = ((index + 1) / total) * 100
  return (
    <div className="progress" aria-label={`Scene ${index + 1} of ${total}`}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <i>
        <b style={{ width: `${pct}%` }} />
      </i>
      <span>{String(total).padStart(2, '0')}</span>
    </div>
  )
}
