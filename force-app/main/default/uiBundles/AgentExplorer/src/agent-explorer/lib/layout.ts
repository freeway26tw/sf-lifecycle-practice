import type { AgentDoc, SubAgentCategory } from '../types';
import { categoryOf } from '../types';
import { HUMAN_NODE_ID } from './palette';

export const CATEGORY_ORDER: SubAgentCategory[] = ['verification', 'business', 'knowledge', 'fallback'];
const COL_WIDTH = 220;
const ROW_HEIGHT = 200;

export interface Point {
  x: number;
  y: number;
}

/**
 * Router on its own top row, centered over every other subagent grouped by
 * category on the row below, human hand-off on a row below that (under
 * whichever subagent has the escalate edge). Hand-computed rather than a
 * layout-engine dependency since the graph shape is small and fixed.
 */
export function computeLayout(doc: AgentDoc): Record<string, Point> {
  const router = doc.subagents.find((s) => s.isEntry);
  const rest = doc.subagents.filter((s) => !s.isEntry);

  const ordered = [...rest].sort(
    (a, b) => CATEGORY_ORDER.indexOf(categoryOf(a)) - CATEGORY_ORDER.indexOf(categoryOf(b))
  );

  const positions: Record<string, Point> = {};
  ordered.forEach((sa, i) => {
    positions[sa.id] = { x: i * COL_WIDTH, y: ROW_HEIGHT };
  });

  const width = Math.max(0, (ordered.length - 1) * COL_WIDTH);
  if (router) {
    positions[router.id] = { x: width / 2, y: 0 };
  }

  const escalateEdge = doc.edges.find((e) => e.kind === 'escalate');
  const anchorX =
    escalateEdge && positions[escalateEdge.from] ? positions[escalateEdge.from].x : width / 2;
  positions[HUMAN_NODE_ID] = { x: anchorX, y: ROW_HEIGHT * 2 };

  return positions;
}
