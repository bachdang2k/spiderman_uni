export function ComicHalftone({ opacity = 0.18 }: { opacity?: number }) {
  return <div className="halftone" style={{ opacity }} aria-hidden="true" />
}
