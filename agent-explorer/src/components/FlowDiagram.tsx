import { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { AgentDoc } from '../types';
import { categoryOf } from '../types';
import { computeLayout } from '../lib/layout';
import { HUMAN_NODE_ID } from '../lib/palette';
import { SubAgentNode, HumanNode, type SubAgentNodeData } from './FlowNodes';
import { FlowLegend } from './FlowLegend';

const nodeTypes = { subagent: SubAgentNode, human: HumanNode };

interface Props {
  doc: AgentDoc;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** when true, hides manual zoom controls and auto-fits the view to the selected node on each step */
  presenting?: boolean;
}

export function FlowDiagram({ doc, selectedId, onSelect, presenting = false }: Props) {
  const positions = useMemo(() => computeLayout(doc), [doc]);
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);

  // Everything directly connected to the selected node — used to spotlight a
  // route (e.g. "here's what unlocks once isVerified flips") and dim the rest.
  const connected = useMemo(() => {
    if (!selectedId) return null;
    const nodeIds = new Set<string>([selectedId]);
    const edgeIds = new Set<number>();
    doc.edges.forEach((e, i) => {
      if (e.from === selectedId || e.to === selectedId) {
        nodeIds.add(e.from);
        nodeIds.add(e.to);
        edgeIds.add(i);
      }
    });
    return { nodeIds, edgeIds };
  }, [doc, selectedId]);

  const nodes: Node[] = useMemo(() => {
    const subagentNodes: Node[] = doc.subagents.map((sa) => ({
      id: sa.id,
      type: 'subagent',
      position: positions[sa.id] ?? { x: 0, y: 0 },
      data: {
        label: sa.label,
        description: sa.description,
        category: categoryOf(sa),
        isSelected: sa.id === selectedId,
        dimmed: connected ? !connected.nodeIds.has(sa.id) : false
      } satisfies SubAgentNodeData
    }));
    const humanNode: Node = {
      id: HUMAN_NODE_ID,
      type: 'human',
      position: positions[HUMAN_NODE_ID] ?? { x: 0, y: 0 },
      data: {
        isSelected: selectedId === HUMAN_NODE_ID,
        dimmed: connected ? !connected.nodeIds.has(HUMAN_NODE_ID) : false
      }
    };
    return [...subagentNodes, humanNode];
  }, [doc, positions, selectedId, connected]);

  const edges: Edge[] = useMemo(
    () =>
      doc.edges.map((e, i) => {
        const downward = e.kind !== 'post-action';
        const isConnected = connected ? connected.edgeIds.has(i) : true;
        const stroke =
          e.kind === 'escalate'
            ? 'var(--cat-human)'
            : e.kind === 'post-action'
              ? 'var(--cat-verification)'
              : 'var(--text-muted)';
        // Ten "route" edges fan out of the router - a condition label on each
        // overlaps into unreadable clutter. Click the node instead; the
        // detail panel spells out every condition. The lone post-action and
        // escalate edges have room, so they keep their label.
        const showLabel = e.kind !== 'route';

        return {
          id: `edge-${i}`,
          source: e.from,
          target: e.to,
          sourceHandle: downward ? 'bottom-source' : 'top-source',
          targetHandle: downward ? 'top-target' : 'bottom-target',
          label: showLabel ? (e.condition ?? e.actionName) : undefined,
          labelStyle: { fill: 'var(--text-secondary)', fontSize: 10 },
          labelBgStyle: { fill: 'var(--surface-1)', fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: stroke },
          style: {
            stroke,
            strokeWidth: isConnected ? (e.kind === 'route' ? 2 : 2.5) : e.kind === 'route' ? 1.25 : 1.5,
            // gated ("requires isVerified == ...") vs. always-available routes
            strokeDasharray: e.condition ? '4 3' : undefined,
            opacity: connected ? (isConnected ? 1 : 0.15) : 1,
            transition: 'opacity 150ms, stroke-width 150ms'
          }
        };
      }),
    [doc, connected]
  );

  // Presenter mode drives the camera: fit the view to whichever node the
  // current step selected, instead of leaving the presenter to pan manually.
  useEffect(() => {
    if (!presenting || !rf || !selectedId) return;
    rf.fitView({ nodes: [{ id: selectedId }], padding: 0.35, duration: 450, maxZoom: 1.1 });
  }, [presenting, selectedId, rf]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onSelect(node.id)}
      onInit={setRf}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable
      nodesConnectable={false}
    >
      <Background color="var(--gridline)" gap={20} />
      {!presenting && <Controls showInteractive={false} />}
      <Panel position="top-left">
        <FlowLegend />
      </Panel>
    </ReactFlow>
  );
}
