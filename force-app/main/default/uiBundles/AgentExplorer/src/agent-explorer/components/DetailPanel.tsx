import type { ActionField, ActionInvocation, SubAgent } from '../types';
import { categoryOf } from '../types';
import { CATEGORY_META } from '../lib/palette';
import { InstructionList, TokenizedText } from './InstructionList';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-semibold tracking-wide uppercase"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </h3>
  );
}

function Pill({
  children,
  color
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: color ? `color-mix(in srgb, ${color} 16%, transparent)` : 'var(--gridline)',
        color: color ?? 'var(--text-secondary)'
      }}
    >
      {children}
    </span>
  );
}

function FieldTable({ title, fields }: { title: string; fields: ActionField[] }) {
  if (fields.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      <div className="mt-1 overflow-x-auto rounded border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--surface-1)' }}>
              <th className="px-2 py-1 text-left font-medium">Field</th>
              <th className="px-2 py-1 text-left font-medium">Type</th>
              <th className="px-2 py-1 text-left font-medium">Source</th>
              <th className="px-2 py-1 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.name} className="border-t align-top" style={{ borderColor: 'var(--border)' }}>
                <td className="px-2 py-1 font-mono whitespace-nowrap">
                  {f.name}
                  {f.isRequired ? (
                    <span style={{ color: 'var(--cat-verification)' }}> *</span>
                  ) : null}
                </td>
                <td className="px-2 py-1 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {f.type}
                </td>
                <td className="px-2 py-1 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {f.isUserInput ? 'customer' : 'system'}
                </td>
                <td className="px-2 py-1" style={{ color: 'var(--text-secondary)' }}>
                  {f.description}
                  {f.defaultValue && (
                    <>
                      {' '}
                      <TokenizedText text={`(default ${f.defaultValue})`} />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionCard({ invocation, subagent }: { invocation: ActionInvocation; subagent: SubAgent }) {
  const schema = invocation.targetActionRef ? subagent.toolActions[invocation.targetActionRef] : undefined;

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
      <div className="flex flex-wrap items-center gap-1.5">
        <code className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {invocation.name}
        </code>
        {invocation.kind === 'transition' && <Pill color="var(--cat-router)">transitions to {invocation.targetSubagent}</Pill>}
        {invocation.kind === 'escalate' && <Pill color="var(--cat-human)">hands off to human</Pill>}
        {invocation.kind === 'tool' && <Pill>tool call</Pill>}
        {schema?.requireUserConfirmation && <Pill color="var(--cat-knowledge)">needs confirmation</Pill>}
        {invocation.condition && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            available when <TokenizedText text={invocation.condition} />
          </span>
        )}
      </div>

      {invocation.description && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {invocation.description}
        </p>
      )}
      {schema?.description && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {schema.description}
        </p>
      )}

      {invocation.paramBindings.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {invocation.paramBindings.map((p) => (
            <code
              key={p.name}
              className="rounded px-1.5 py-0.5 text-[11px]"
              style={{ background: 'var(--gridline)', color: 'var(--text-secondary)' }}
            >
              {p.name} = {p.value}
            </code>
          ))}
        </div>
      )}

      {invocation.stateUpdates.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {invocation.stateUpdates.map((s) => (
            <code
              key={s.variable}
              className="rounded px-1.5 py-0.5 text-[11px]"
              style={{ background: 'var(--gridline)', color: 'var(--text-secondary)' }}
            >
              set @variables.{s.variable} = {s.value}
            </code>
          ))}
        </div>
      )}

      {invocation.conditionalTransition && (
        <p className="mt-2 text-xs" style={{ color: 'var(--cat-verification)' }}>
          then transitions to {invocation.conditionalTransition.to} if{' '}
          <TokenizedText text={invocation.conditionalTransition.condition} />
        </p>
      )}

      {schema && (
        <>
          <FieldTable title="Inputs" fields={schema.inputs} />
          <FieldTable title="Outputs" fields={schema.outputs} />
        </>
      )}
    </div>
  );
}

export function DetailPanel({ subagent }: { subagent: SubAgent }) {
  const category = categoryOf(subagent);
  const meta = CATEGORY_META[category];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(${meta.colorVar})` }} />
          <span className="text-xs font-medium tracking-wide" style={{ color: `var(${meta.colorVar})` }}>
            {meta.label}
          </span>
        </div>
        <h2 className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {subagent.label}
        </h2>
        <code className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {subagent.id}
        </code>
        {subagent.description && (
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {subagent.description}
          </p>
        )}
        {subagent.model && (
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            model: <code>{subagent.model}</code>
          </p>
        )}
      </div>

      <div>
        <SectionTitle>Instructions</SectionTitle>
        <div className="mt-2">
          <InstructionList blocks={subagent.instructions} />
        </div>
      </div>

      <div>
        <SectionTitle>Actions &amp; transitions ({subagent.actionInvocations.length})</SectionTitle>
        <div className="mt-2 space-y-2">
          {subagent.actionInvocations.length === 0 && (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
              This subagent invokes no actions and offers no transitions.
            </p>
          )}
          {subagent.actionInvocations.map((inv) => (
            <ActionCard key={inv.name} invocation={inv} subagent={subagent} />
          ))}
        </div>
      </div>
    </div>
  );
}
