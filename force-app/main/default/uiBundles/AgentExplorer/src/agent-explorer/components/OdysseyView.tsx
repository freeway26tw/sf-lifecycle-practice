import { useState } from 'react';
import type { AgentDoc } from '../types';
import { buildVoyageConcepts, type VoyagePart } from '../lib/odysseyConcepts';
import { VoyageMap } from './VoyageMap';
import { TokenizedText } from './InstructionList';

export function OdysseyView({ doc }: { doc: AgentDoc }) {
  const concepts = buildVoyageConcepts(doc);
  const [activePart, setActivePart] = useState<VoyagePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<VoyagePart | null>(null);

  const displayedPart = hoveredPart ?? activePart;
  const colorForPart = (part: VoyagePart) => concepts.find((c) => c.part === part)?.colorVar ?? '--text-secondary';

  return (
    <div className="flex h-full">
      <div className="relative flex min-w-0 flex-1 items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <VoyageMap
            activePart={displayedPart}
            colorForPart={colorForPart}
            onPartClick={(part) => setActivePart((cur) => (cur === part ? null : part))}
            onPartHover={setHoveredPart}
            unitLabel={doc.config.developer_name ?? doc.config.agent_label}
            className="w-full"
          />
        </div>
        {!displayedPart && (
          <p className="absolute bottom-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            伊薩卡島(Ithaca)位在航程的中心。點選任一航點,看看它對應到 Agent Script 的哪個概念。
          </p>
        )}
      </div>

      <aside
        className="w-[380px] shrink-0 overflow-y-auto border-l p-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
      >
        <h2 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {doc.config.agent_label ?? 'the agent'} 的奧德賽之旅
        </h2>
        <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          航程中的每一段旅程,都對應一項真正的 Agent Script 概念——由上而下閱讀,或直接點選航海圖上的航點。
        </p>
        <div className="space-y-2">
          {concepts.map((c) => {
            const active = displayedPart === c.part;
            return (
              <button
                key={c.part}
                onClick={() => setActivePart((cur) => (cur === c.part ? null : c.part))}
                onMouseEnter={() => setHoveredPart(c.part)}
                onMouseLeave={() => setHoveredPart(null)}
                className="block w-full rounded-lg border p-3 text-left transition-colors"
                style={{
                  borderColor: active ? `var(${c.colorVar})` : 'var(--border)',
                  background: active ? `color-mix(in srgb, var(${c.colorVar}) 8%, var(--surface-2))` : 'var(--surface-2)'
                }}
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold" style={{ color: `var(${c.colorVar})` }}>
                    {c.mythLabel}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    → {c.conceptLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {c.summary}
                </p>
                {active && (
                  <div className="mt-2 space-y-1 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                    {c.directive && (
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <code
                          className="rounded px-1 py-0.5"
                          style={{ background: 'var(--gridline)', color: 'var(--text-secondary)' }}
                        >
                          {c.directive}
                        </code>
                      </p>
                    )}
                    {c.detail.length > 0 && (
                      <ul className="ml-4 list-disc space-y-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {c.detail.map((d) => (
                          <li key={d}>
                            <TokenizedText text={d} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
