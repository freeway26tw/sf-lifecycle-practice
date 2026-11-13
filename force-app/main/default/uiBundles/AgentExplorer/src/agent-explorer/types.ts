export interface TextBlock {
  text: string;
  children: TextBlock[];
}

export interface Variable {
  name: string;
  kind?: 'mutable' | 'linked';
  type: string;
  default?: string;
  label?: string;
  description?: string;
  visibility?: 'Internal' | 'External';
  /** e.g. "@MessagingSession.MessagingEndUserId" (linked variables only) */
  source?: string;
}

export interface ActionField {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  label?: string;
  isRequired?: boolean;
  isUserInput?: boolean;
  filterFromAgent?: boolean;
  isDisplayable?: boolean;
  complexDataType?: string;
}

export interface ToolAction {
  name: string;
  description?: string;
  label?: string;
  requireUserConfirmation?: boolean;
  includeInProgressIndicator?: boolean;
  progressIndicatorMessage?: string;
  source?: string;
  target?: string;
  inputs: ActionField[];
  outputs: ActionField[];
}

export interface ParamBinding {
  name: string;
  value: string;
}

export interface StateUpdate {
  variable: string;
  value: string;
}

export interface ConditionalTransition {
  condition: string;
  to: string;
}

export type ActionInvocationKind = 'tool' | 'transition' | 'escalate';

export interface ActionInvocation {
  name: string;
  kind: ActionInvocationKind;
  /** transition only */
  targetSubagent?: string;
  /** tool only: key into the subagent's toolActions map */
  targetActionRef?: string;
  /** from "available when ..." */
  condition?: string;
  /** escalate only */
  description?: string;
  paramBindings: ParamBinding[];
  stateUpdates: StateUpdate[];
  /** a tool action that also transitions as a side effect, e.g. VerifyCustomer -> agent_router */
  conditionalTransition?: ConditionalTransition;
}

export interface SubAgent {
  id: string;
  label: string;
  description?: string;
  isEntry: boolean;
  /** router only */
  model?: string;
  instructions: TextBlock[];
  actionInvocations: ActionInvocation[];
  toolActions: Record<string, ToolAction>;
}

export type RoutingEdgeKind = 'route' | 'post-action' | 'escalate';

export interface RoutingEdge {
  from: string;
  /** subagent id, or "__human__" for an escalate hand-off */
  to: string;
  actionName: string;
  condition?: string;
  kind: RoutingEdgeKind;
}

export interface AgentDoc {
  system: {
    instructions: TextBlock[];
    welcomeMessage?: string;
    errorMessage?: string;
  };
  config: Record<string, string>;
  language: Record<string, string | boolean>;
  knowledge: Record<string, string | boolean>;
  variables: Variable[];
  subagents: SubAgent[];
  edges: RoutingEdge[];
  generatedAt: string;
}

export type SubAgentCategory =
  | 'router'
  | 'verification'
  | 'business'
  | 'knowledge'
  | 'fallback'
  | 'human';

const FALLBACK_IDS = new Set(['escalation', 'off_topic', 'ambiguous_question']);

export function categoryOf(subagent: Pick<SubAgent, 'id' | 'isEntry'>): SubAgentCategory {
  if (subagent.isEntry) return 'router';
  if (FALLBACK_IDS.has(subagent.id)) return 'fallback';
  if (/verif/i.test(subagent.id)) return 'verification';
  if (/faq|knowledge/i.test(subagent.id)) return 'knowledge';
  return 'business';
}
