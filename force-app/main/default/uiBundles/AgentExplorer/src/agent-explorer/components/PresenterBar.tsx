import type { PresenterStep } from '../lib/presenter';
import { CATEGORY_META } from '../lib/palette';

interface Props {
  steps: PresenterStep[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  onJump: (index: number) => void;
}

export function PresenterBar({ steps, index, onPrev, onNext, onExit, onJump }: Props) {
  const step = steps[index];
  const meta = CATEGORY_META[step.category];

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 border-t px-5 pt-3 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="shrink-0 rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          ← Prev
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase" style={{ color: `var(${meta.colorVar})` }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(${meta.colorVar})` }} />
            Step {index + 1} / {steps.length} · {meta.label}
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {step.title}
          </p>
          <p className="mt-0.5 text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {step.caption}
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={index === steps.length - 1}
          className="shrink-0 rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Next →
        </button>
        <button
          onClick={onExit}
          className="shrink-0 rounded-md px-2 py-2 text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          Exit ⎋
        </button>
      </div>

      <div className="mx-auto mt-3 flex max-w-4xl gap-1">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onJump(i)}
            aria-label={`Jump to ${s.title}`}
            aria-current={i === index}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              background:
                i === index
                  ? `var(${CATEGORY_META[s.category].colorVar})`
                  : i < index
                    ? 'var(--text-muted)'
                    : 'var(--gridline)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
