import type { SubAgentCategory } from '../types';

export const CATEGORY_META: Record<
  SubAgentCategory,
  { label: string; colorVar: string; blurb: string }
> = {
  router: {
    label: 'Router',
    colorVar: '--cat-router',
    blurb: 'Entry point. Classifies the conversation and routes to a subagent.'
  },
  verification: {
    label: 'Verification',
    colorVar: '--cat-verification',
    blurb: 'Authenticates the customer before any sensitive data is touched.'
  },
  business: {
    label: 'Business subagent',
    colorVar: '--cat-business',
    blurb: 'Handles a specific task once the customer is verified.'
  },
  knowledge: {
    label: 'Knowledge / FAQ',
    colorVar: '--cat-knowledge',
    blurb: "Answers questions from the org's knowledge base. No verification required."
  },
  fallback: {
    label: 'System fallback',
    colorVar: '--cat-fallback',
    blurb: 'Guardrail subagent for escalation, off-topic, or ambiguous requests.'
  },
  human: {
    label: 'Human agent',
    colorVar: '--cat-human',
    blurb: 'Conversation leaves the agent entirely and is handed to a live rep.'
  }
};

export const HUMAN_NODE_ID = '__human__';
