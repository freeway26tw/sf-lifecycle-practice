import type { AgentDoc } from '../types';
import { InstructionList } from './InstructionList';
import { LegendItems } from './FlowLegend';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
      <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-right" style={{ color: 'var(--text-secondary)' }}>
        {value}
      </span>
    </div>
  );
}

const DIRECTIVES: { token: string; meaning: string }[] = [
  { token: '@utils.transition to @subagent.X', meaning: 'Hands the conversation to subagent X.' },
  { token: '@utils.escalate', meaning: 'Hands the conversation off to a live human agent.' },
  { token: '@subagent.X', meaning: 'A reference to another subagent, X.' },
  { token: '@actions.X', meaning: 'Invokes the tool/action named X (a Flow, Apex, or built-in action).' },
  {
    token: '@variables.X',
    meaning: 'Reads or writes the agent-managed variable X (see the Variables tab).'
  },
  { token: '@outputs.X', meaning: "Reads field X from the output of the action that was just called." },
  { token: '{!@actions.X}', meaning: 'Merge-field syntax: refers to action X by name inside prose instructions.' },
  { token: 'available when …', meaning: 'A guard condition — this transition only shows up when true.' }
];

export function OverviewPanel({ doc }: { doc: AgentDoc }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {doc.config.agent_label ?? 'Agent'} overview
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {doc.config.description}
        </p>
        <p
          className="mt-3 rounded-md border px-3 py-2 text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
        >
          Explaining this to a room? Click <strong>▶ Present</strong> in the header for a guided,
          step-by-step walkthrough of the router → verification → subagent architecture — arrow
          keys move between steps, <kbd>Esc</kbd> exits.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Config">
          <KVRow label="Developer name" value={doc.config.developer_name} />
          <KVRow label="Template" value={<code className="text-xs">{doc.config.agent_template}</code>} />
          <KVRow label="Default agent user" value={doc.config.default_agent_user} />
        </Card>
        <Card title="Language">
          <KVRow label="Default locale" value={String(doc.language.default_locale ?? '—')} />
          <KVRow label="Additional locales" value={String(doc.language.additional_locales ?? '—')} />
          <KVRow
            label="All additional locales"
            value={doc.language.all_additional_locales ? 'Yes' : 'No'}
          />
        </Card>
      </div>

      <Card title="System instructions">
        <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          Applies to the whole agent, underneath every subagent's own instructions.
        </p>
        <InstructionList blocks={doc.system.instructions} />
        {doc.system.welcomeMessage && (
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Welcome message:</strong> "{doc.system.welcomeMessage}"
          </p>
        )}
        {doc.system.errorMessage && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Error message:</strong> "{doc.system.errorMessage}"
          </p>
        )}
      </Card>

      <Card title="How to read the flow diagram">
        <LegendItems />
        <p className="mt-3 border-t pt-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          A <strong>dashed</strong> line is a gated route — it only appears when a condition like{' '}
          <code className="rounded px-1 py-0.5" style={{ background: 'var(--gridline)' }}>
            @variables.isVerified
          </code>{' '}
          is met. A <strong>solid</strong> line is always available. Click any node for its exact
          conditions.
        </p>
      </Card>

      <Card title="Agent script directives">
        <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          The agent is authored in a custom, indentation-based script (not standard YAML). These
          are the directives you'll see throughout the Actions &amp; transitions section of each
          subagent.
        </p>
        <div className="space-y-2">
          {DIRECTIVES.map((d) => (
            <div key={d.token} className="flex flex-wrap items-baseline gap-2 text-sm">
              <code
                className="rounded px-1.5 py-0.5 text-xs"
                style={{ background: 'var(--gridline)', color: 'var(--text-secondary)' }}
              >
                {d.token}
              </code>
              <span style={{ color: 'var(--text-secondary)' }}>{d.meaning}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
