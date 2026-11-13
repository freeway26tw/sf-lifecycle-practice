import type { TextBlock } from '../types';

const TOKEN_RE = /(\{!@[\w.]+\}|@[A-Za-z][\w.]*)/g;

/** Renders DSL tokens like {!@actions.X}, @variables.X, @subagent.X as inline code chips. */
export function TokenizedText({ text }: { text: string }) {
  const parts = text.split(TOKEN_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        const isMergeField = part.startsWith('{!@') && part.endsWith('}');
        if (!isMergeField && !part.startsWith('@')) return <span key={i}>{part}</span>;
        const label = isMergeField ? part.slice(2, -1) : part;
        return (
          <code
            key={i}
            className="rounded px-1 py-0.5 text-[0.85em] whitespace-nowrap"
            style={{ background: 'var(--gridline)', color: 'var(--text-secondary)' }}
          >
            {label}
          </code>
        );
      })}
    </>
  );
}

/** Flattens continuation lines (wrapped sentences) into one string, in document order. */
function flattenContinuation(block: TextBlock): string {
  const parts = [block.text];
  const walk = (b: TextBlock) => {
    for (const c of b.children) {
      parts.push(c.text);
      walk(c);
    }
  };
  walk(block);
  return parts.join(' ');
}

function InstructionItem({ block }: { block: TextBlock }) {
  const isHeader = block.text.trim().endsWith(':') && block.children.length > 0;
  if (isHeader) {
    return (
      <li className="leading-relaxed">
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
          <TokenizedText text={block.text} />
        </p>
        <ul className="mt-1 ml-4 list-disc space-y-1">
          {block.children.map((child, i) => (
            <InstructionItem key={i} block={child} />
          ))}
        </ul>
      </li>
    );
  }
  return (
    <li className="leading-relaxed">
      <TokenizedText text={flattenContinuation(block)} />
    </li>
  );
}

export function InstructionList({ blocks }: { blocks: TextBlock[] }) {
  if (blocks.length === 0) {
    return (
      <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
        No instructions defined for this subagent.
      </p>
    );
  }
  return (
    <ul className="ml-4 list-disc space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
      {blocks.map((block, i) => (
        <InstructionItem key={i} block={block} />
      ))}
    </ul>
  );
}
