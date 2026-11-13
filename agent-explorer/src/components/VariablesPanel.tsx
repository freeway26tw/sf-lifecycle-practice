import type { Variable } from '../types';
import { TokenizedText } from './InstructionList';

function VariableTable({ title, blurb, variables }: { title: string; blurb: string; variables: Variable[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({variables.length})</span>
      </h3>
      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        {blurb}
      </p>
      <div className="mt-2 overflow-x-auto rounded border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-1)' }}>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Visibility / source</th>
              <th className="px-3 py-2 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {variables.map((v) => (
              <tr key={v.name} className="border-t align-top" style={{ borderColor: 'var(--border)' }}>
                <td className="px-3 py-2 font-mono whitespace-nowrap">{v.name}</td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {v.type}
                  {v.default && <span style={{ color: 'var(--text-muted)' }}> = {v.default}</span>}
                </td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {v.source ? <TokenizedText text={v.source} /> : v.visibility}
                </td>
                <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                  {v.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VariablesPanel({ variables }: { variables: Variable[] }) {
  const linked = variables.filter((v) => v.kind === 'linked');
  const mutable = variables.filter((v) => v.kind === 'mutable');

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Variables
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>Linked</strong> variables are read-only bindings to Salesforce session/user data.{' '}
          <strong>Mutable</strong> variables are state the agent reads and writes itself as the
          conversation progresses — <code>Internal</code> ones never leave the agent,{' '}
          <code>External</code> ones are exposed to the rest of Salesforce (e.g. a Flow).
        </p>
      </div>
      <VariableTable
        title="Linked"
        blurb="Bound automatically from the messaging session — the agent cannot change these."
        variables={linked}
      />
      <VariableTable
        title="Mutable"
        blurb="Set by actions during the conversation (e.g. after verifying a customer)."
        variables={mutable}
      />
    </div>
  );
}
