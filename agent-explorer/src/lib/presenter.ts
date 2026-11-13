import type { AgentDoc, SubAgentCategory } from '../types';
import { categoryOf } from '../types';
import { CATEGORY_ORDER } from './layout';
import { HUMAN_NODE_ID } from './palette';

export interface PresenterStep {
  id: string;
  category: SubAgentCategory;
  title: string;
  caption: string;
}

function labelOf(doc: AgentDoc, id: string): string {
  return doc.subagents.find((s) => s.id === id)?.label ?? id;
}

/** Describes which "route" edges lead into this subagent, and under what condition. */
function describeGate(doc: AgentDoc, subagentId: string): string {
  const incoming = doc.edges.filter((e) => e.to === subagentId && e.kind === 'route');
  if (incoming.length === 0) return '';
  const gated = incoming.filter((e) => e.condition);
  if (gated.length > 0) {
    const conditions = [...new Set(gated.map((e) => e.condition))];
    return `Reachable from the router only when ${conditions.join(' or ')}.`;
  }
  return 'Reachable directly from the router — no gating condition.';
}

/** Describes the router's own fan-out: how many destinations are gated vs. open. */
function describeFanOut(doc: AgentDoc, routerId: string): string {
  const out = doc.edges.filter((e) => e.from === routerId && e.kind === 'route');
  const gated = out.filter((e) => e.condition).length;
  const open = out.length - gated;
  return `It fans out to ${out.length} subagents: ${gated} require verification first, ${open} ${open === 1 ? 'is' : 'are'} open to anyone.`;
}

/** Describes a post-action transition (e.g. verification handing control back to the router). */
function describePostAction(doc: AgentDoc, subagentId: string): string | undefined {
  const edge = doc.edges.find((e) => e.from === subagentId && e.kind === 'post-action');
  if (!edge) return undefined;
  return `Once ${edge.actionName} succeeds, a post-action transition sends the conversation back to ${labelOf(doc, edge.to)} with ${edge.condition ?? 'state'} updated — that's what unlocks the gated subagents.`;
}

/** Describes an escalate edge (hand-off out of Agentforce entirely). */
function describeEscalate(doc: AgentDoc, subagentId: string): string | undefined {
  const edge = doc.edges.find((e) => e.from === subagentId && e.kind === 'escalate');
  if (!edge) return undefined;
  return `Calling ${edge.actionName} hands the conversation to a live human agent — it leaves Agentforce entirely.`;
}

/**
 * Builds an ordered, presenter-friendly walkthrough of the agent's architecture,
 * entirely from the parsed doc (descriptions + edge conditions) so it can't drift
 * from hand-written slide copy as Demo.agent changes.
 */
export function buildPresenterSteps(doc: AgentDoc): PresenterStep[] {
  const router = doc.subagents.find((s) => s.isEntry);
  const rest = doc.subagents.filter((s) => !s.isEntry);
  const ordered = [...rest].sort(
    (a, b) => CATEGORY_ORDER.indexOf(categoryOf(a)) - CATEGORY_ORDER.indexOf(categoryOf(b))
  );

  const steps: PresenterStep[] = [];

  if (router) {
    steps.push({
      id: router.id,
      category: 'router',
      title: router.label,
      caption: [router.description, describeFanOut(doc, router.id)].filter(Boolean).join(' ')
    });
  }

  for (const sa of ordered) {
    steps.push({
      id: sa.id,
      category: categoryOf(sa),
      title: sa.label,
      caption: [sa.description, describeGate(doc, sa.id), describePostAction(doc, sa.id), describeEscalate(doc, sa.id)]
        .filter(Boolean)
        .join(' ')
    });
  }

  if (doc.edges.some((e) => e.kind === 'escalate')) {
    steps.push({
      id: HUMAN_NODE_ID,
      category: 'human',
      title: 'Human agent',
      caption:
        "This isn't a subagent — it's where the conversation leaves Agentforce entirely and is handed to a live rep."
    });
  }

  return steps;
}
