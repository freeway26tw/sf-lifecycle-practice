import { useState } from 'react';
import { CATEGORY_META } from '../lib/palette';

export function LegendItems({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-1.5' : 'grid gap-2 sm:grid-cols-2'}>
      {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((key) => {
        const meta = CATEGORY_META[key];
        return (
          <div key={key} className="flex items-start gap-2">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: `var(${meta.colorVar})` }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {meta.label}
              </p>
              {!compact && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {meta.blurb}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Collapsible legend overlaid on the flow canvas, so presenting doesn't require tabbing to Overview. */
export function FlowLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="w-56 overflow-hidden rounded-lg border shadow-sm"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span>Legend</span>
        <span style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}>⌄</span>
      </button>
      {open && (
        <div className="border-t px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
          <LegendItems compact />
          <p className="mt-2.5 border-t pt-2 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <strong>Dashed</strong> line = gated route (a condition must hold). <strong>Solid</strong> = always
            available.
          </p>
        </div>
      )}
    </div>
  );
}
