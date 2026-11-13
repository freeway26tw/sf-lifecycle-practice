import type { VoyageConcept } from '../lib/odysseyConcepts';
import { OdysseyScene } from './OdysseyScenes';

interface Props {
  concepts: VoyageConcept[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}

export function StoryMode({ concepts, index, onPrev, onNext, onJump }: Props) {
  const c = concepts[index];

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <div data-testid="scene-stage" className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8">
          <img key={c.image} src={c.image} alt={c.artwork} className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(165deg, rgba(9,8,6,0.72) 0%, rgba(9,8,6,0.66) 45%, rgba(9,8,6,0.82) 100%)' }}
          />
          <div key={c.part} className="relative flex w-full flex-col items-center gap-4">
            <OdysseyScene concept={c} />
          </div>
          <p className="relative mt-3 max-w-xl text-center text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <em>{c.artwork}</em> — {c.credit}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t px-6 py-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="rounded-md border px-4 py-2.5 text-base font-medium disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          ← 上一章
        </button>
        <div className="relative flex flex-1 items-center">
          <div
            className="pointer-events-none absolute right-0 left-0 h-px"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, var(--gridline) 0 4px, transparent 4px 9px)'
            }}
          />
          <div className="flex w-full items-center justify-between">
            {concepts.map((s, i) => (
              <button
                key={s.part}
                onClick={() => onJump(i)}
                aria-label={`跳至「${s.mythLabel}」`}
                aria-current={i === index}
                className="rounded-full transition-all"
                style={{
                  width: i === index ? 14 : 8,
                  height: i === index ? 14 : 8,
                  background: i === index ? `var(${s.colorVar})` : i < index ? 'var(--text-muted)' : 'var(--gridline)',
                  boxShadow: i === index ? `0 0 6px color-mix(in srgb, var(${s.colorVar}) 70%, transparent)` : undefined
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={onNext}
          disabled={index === concepts.length - 1}
          className="rounded-md border px-4 py-2.5 text-base font-medium disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          下一章 →
        </button>
      </div>
    </div>
  );
}
