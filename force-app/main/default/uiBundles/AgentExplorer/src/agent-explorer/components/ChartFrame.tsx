function CornerTick({ style }: { style: React.CSSProperties }) {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <path d="M2 13 V2 H13" stroke="var(--gridline)" strokeWidth={2} fill="none" />
      <circle cx={2} cy={2} r={1.6} fill="var(--gridline)" />
    </svg>
  );
}

/**
 * Purely decorative "ship's chart" chrome around the flow canvas — the graph
 * inside is the untouched FlowDiagram, this just sells the idea that you're
 * reading the actual, plotted course rather than the myth.
 */
export function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-center gap-2 py-1.5 text-[10px] font-medium tracking-[0.15em] uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--cat-router)' }} />
        真實航海圖 · 每一段實際航行的路線
      </div>
      {children}
      <CornerTick style={{ top: 8, left: 8 }} />
      <CornerTick style={{ top: 8, right: 8, transform: 'scaleX(-1)' }} />
      <CornerTick style={{ bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
      <CornerTick style={{ bottom: 8, right: 8, transform: 'scale(-1, -1)' }} />
    </div>
  );
}
