import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CATEGORY_META } from '../lib/palette';
import type { SubAgentCategory } from '../types';

export interface SubAgentNodeData {
  label: string;
  description?: string;
  category: SubAgentCategory;
  isSelected: boolean;
  /** true when a different node is selected and this one isn't connected to it */
  dimmed: boolean;
  [key: string]: unknown;
}

const handleStyle: React.CSSProperties = { opacity: 0, width: 8, height: 8 };

function Handles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top-target" style={handleStyle} />
      <Handle type="source" position={Position.Top} id="top-source" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={handleStyle} />
    </>
  );
}

export function SubAgentNode({ data }: NodeProps) {
  const d = data as unknown as SubAgentNodeData;
  const meta = CATEGORY_META[d.category];
  return (
    <div
      className="w-[190px] cursor-pointer rounded-lg border px-3 py-2 shadow-sm transition-opacity duration-150"
      style={{
        background: 'var(--surface-2)',
        borderColor: d.isSelected ? `var(${meta.colorVar})` : 'var(--border)',
        borderWidth: d.isSelected ? 2 : 1,
        opacity: d.dimmed ? 0.3 : 1,
        boxShadow: d.isSelected
          ? `0 0 0 3px color-mix(in srgb, var(${meta.colorVar}) 25%, transparent)`
          : undefined
      }}
    >
      <Handles />
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: `var(${meta.colorVar})` }}
        />
        <span
          className="truncate text-[11px] font-medium tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          {meta.label}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {d.label}
      </p>
      {d.description && (
        <p
          className="mt-1 line-clamp-2 text-xs leading-snug"
          style={{ color: 'var(--text-secondary)' }}
        >
          {d.description}
        </p>
      )}
    </div>
  );
}

export function HumanNode({ data }: NodeProps) {
  const d = data as unknown as { isSelected: boolean; dimmed: boolean };
  const meta = CATEGORY_META.human;
  return (
    <div
      className="w-[150px] rounded-full border border-dashed px-3 py-2 text-center shadow-sm transition-opacity duration-150"
      style={{
        background: 'var(--surface-2)',
        borderColor: `var(${meta.colorVar})`,
        opacity: d.dimmed ? 0.3 : 1,
        boxShadow: d.isSelected
          ? `0 0 0 3px color-mix(in srgb, var(${meta.colorVar}) 25%, transparent)`
          : undefined
      }}
    >
      <Handles />
      <p className="text-sm font-semibold" style={{ color: `var(${meta.colorVar})` }}>
        Human agent
      </p>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        conversation exits the agent
      </p>
    </div>
  );
}
