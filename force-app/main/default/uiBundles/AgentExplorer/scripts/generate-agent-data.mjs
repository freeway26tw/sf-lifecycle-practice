#!/usr/bin/env node
// Converts the Agentforce agent DSL file (force-app/.../Demo.agent) into
// structured JSON that the app renders. Runs before every dev/build so the
// app always reflects the real agent config, never a stale copy.
//
// The DSL is a custom, indentation-based format (4 spaces per level, no
// tabs) - not standard YAML. Parsing happens in two stages:
//   1. Build a generic tree purely from indentation (agnostic to meaning).
//   2. Walk that tree and map known shapes (variables, subagents, actions,
//      instruction blocks, ...) onto our data model.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// This UI Bundle lives at force-app/main/default/uiBundles/AgentExplorer/scripts,
// three levels below force-app/main/default where Demo.agent's bundle lives.
const SOURCE = path.resolve(
  __dirname,
  '../../../aiAuthoringBundles/Demo/Demo.agent'
);
const OUT = path.resolve(__dirname, '../src/agent-explorer/data/agent.generated.json');

// ---------------------------------------------------------------------------
// Stage 1: generic indent tree
// ---------------------------------------------------------------------------

function buildTree(text) {
  const lines = text.split('\n');
  const root = { indent: -1, text: '', children: [], line: 0 };
  const stack = [root];
  lines.forEach((line, i) => {
    if (line.trim() === '') return;
    const indent = line.length - line.trimStart().length;
    const node = { indent, text: line.trim(), children: [], line: i + 1 };
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  return root;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Splits "key: value" on the first colon that isn't inside quotes. */
function splitKV(text) {
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ':' && !inQuotes) {
      return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
    }
  }
  return [text.trim(), undefined];
}

function unquote(v) {
  if (v == null) return v;
  const t = v.trim();
  if (t.startsWith('"') && t.endsWith('"') && t.length >= 2) return t.slice(1, -1);
  return t;
}

function toBool(v) {
  if (v === 'True') return true;
  if (v === 'False') return false;
  return undefined;
}

function childByKey(node, key) {
  return node.children.find((c) => splitKV(c.text)[0] === key);
}

function scalarOf(node) {
  return node ? unquote(splitKV(node.text)[1]) : undefined;
}

function rawScalarOf(node) {
  return node ? splitKV(node.text)[1] : undefined;
}

function stripLeadingPipe(text) {
  return text.startsWith('|') ? text.slice(1).trim() : text;
}

/** A line/instruction node -> {text, children}, recursively. */
function parseTextBlock(node) {
  return {
    text: stripLeadingPipe(node.text),
    children: node.children.map(parseTextBlock)
  };
}

function parseFlatMap(node) {
  const map = {};
  for (const child of node.children) {
    const [key, val] = splitKV(child.text);
    map[key] = val === 'True' || val === 'False' ? toBool(val) : unquote(val);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Stage 2: semantic mapping
// ---------------------------------------------------------------------------

function parseVariables(node) {
  return node.children.map((child) => {
    const [name, rest = ''] = splitKV(child.text);
    const m = rest.match(/^(mutable|linked)\s+(\S+?)(?:\s*=\s*(.+))?$/);
    return {
      name,
      kind: m ? m[1] : undefined,
      type: m ? m[2] : rest,
      default: m && m[3] ? m[3].trim() : undefined,
      label: scalarOf(childByKey(child, 'label')),
      description: scalarOf(childByKey(child, 'description')),
      visibility: scalarOf(childByKey(child, 'visibility')),
      source: rawScalarOf(childByKey(child, 'source'))
    };
  });
}

function parseActionField(node) {
  const [rawName, rest = ''] = splitKV(node.text);
  const eqIdx = rest.indexOf(' = ');
  const type = eqIdx >= 0 ? rest.slice(0, eqIdx).trim() : rest.trim();
  const defaultValue = eqIdx >= 0 ? rest.slice(eqIdx + 3).trim() : undefined;
  return {
    name: unquote(rawName),
    type,
    defaultValue,
    description: scalarOf(childByKey(node, 'description')),
    label: scalarOf(childByKey(node, 'label')),
    isRequired: toBool(rawScalarOf(childByKey(node, 'is_required'))),
    isUserInput: toBool(rawScalarOf(childByKey(node, 'is_user_input'))),
    filterFromAgent: toBool(rawScalarOf(childByKey(node, 'filter_from_agent'))),
    isDisplayable: toBool(rawScalarOf(childByKey(node, 'is_displayable'))),
    complexDataType: scalarOf(childByKey(node, 'complex_data_type_name'))
  };
}

function parseToolAction(node, name) {
  const inputsNode = childByKey(node, 'inputs');
  const outputsNode = childByKey(node, 'outputs');
  return {
    name,
    description: scalarOf(childByKey(node, 'description')),
    label: scalarOf(childByKey(node, 'label')),
    requireUserConfirmation: toBool(rawScalarOf(childByKey(node, 'require_user_confirmation'))),
    includeInProgressIndicator: toBool(
      rawScalarOf(childByKey(node, 'include_in_progress_indicator'))
    ),
    progressIndicatorMessage: scalarOf(childByKey(node, 'progress_indicator_message')),
    source: scalarOf(childByKey(node, 'source')),
    target: scalarOf(childByKey(node, 'target')),
    inputs: inputsNode ? inputsNode.children.map(parseActionField) : [],
    outputs: outputsNode ? outputsNode.children.map(parseActionField) : []
  };
}

const TRANSITION_PREFIX = '@utils.transition to @subagent.';
const ACTION_PREFIX = '@actions.';

function parseActionInvocation(node) {
  const [name, targetRaw] = splitKV(node.text);

  let kind = 'tool';
  let targetSubagent;
  let targetActionRef;
  if (targetRaw?.startsWith(TRANSITION_PREFIX)) {
    kind = 'transition';
    targetSubagent = targetRaw.slice(TRANSITION_PREFIX.length).trim();
  } else if (targetRaw === '@utils.escalate') {
    kind = 'escalate';
  } else if (targetRaw?.startsWith(ACTION_PREFIX)) {
    targetActionRef = targetRaw.slice(ACTION_PREFIX.length).trim();
  }

  const paramBindings = [];
  const stateUpdates = [];
  let condition;
  let description;
  let conditionalTransition;

  for (const child of node.children) {
    const t = child.text;
    if (t.startsWith('with ')) {
      const m = t.match(/^with\s+(\S+)\s*=\s*(.+)$/);
      if (m) paramBindings.push({ name: m[1], value: m[2].trim() });
    } else if (t.startsWith('set ')) {
      const m = t.match(/^set\s+@variables\.(\S+)\s*=\s*(.+)$/);
      if (m) stateUpdates.push({ variable: m[1], value: m[2].trim() });
    } else if (t.startsWith('available when ')) {
      condition = t.slice('available when '.length).trim();
    } else if (t.startsWith('if ') && t.endsWith(':')) {
      const cond = t.slice(3, -1).trim();
      const transitionChild = child.children.find((c) =>
        c.text.startsWith('transition to @subagent.')
      );
      if (transitionChild) {
        conditionalTransition = {
          condition: cond,
          to: transitionChild.text.slice('transition to @subagent.'.length).trim()
        };
      }
    } else if (t.startsWith('description:')) {
      description = scalarOf(child);
    }
  }

  return {
    name,
    kind,
    targetSubagent,
    targetActionRef,
    condition,
    description,
    paramBindings,
    stateUpdates,
    conditionalTransition
  };
}

function parseSubAgent(node, isEntry) {
  const id = node.text.split(/\s+/)[1].replace(/:$/, '');
  const reasoningNode = childByKey(node, 'reasoning');
  const actionsSchemaNode = childByKey(node, 'actions');
  const modelConfigNode = childByKey(node, 'model_config');

  const instructionsNode = reasoningNode ? childByKey(reasoningNode, 'instructions') : undefined;
  const reasoningActionsNode = reasoningNode ? childByKey(reasoningNode, 'actions') : undefined;

  const toolActions = {};
  if (actionsSchemaNode) {
    for (const actionNode of actionsSchemaNode.children) {
      const name = splitKV(actionNode.text)[0];
      toolActions[name] = parseToolAction(actionNode, name);
    }
  }

  return {
    id,
    label: scalarOf(childByKey(node, 'label')) ?? id,
    description: scalarOf(childByKey(node, 'description')),
    isEntry,
    model: modelConfigNode ? scalarOf(childByKey(modelConfigNode, 'model')) : undefined,
    instructions: instructionsNode ? instructionsNode.children.map(parseTextBlock) : [],
    actionInvocations: reasoningActionsNode
      ? reasoningActionsNode.children.map(parseActionInvocation)
      : [],
    toolActions
  };
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

function parseAgentDoc(raw) {
  const tree = buildTree(raw);
  const doc = {
    system: {},
    config: {},
    language: {},
    knowledge: {},
    variables: [],
    subagents: [],
    edges: []
  };

  for (const node of tree.children) {
    const firstWord = node.text.split(/\s+/)[0].replace(/:$/, '');
    if (firstWord === 'system') {
      const instrNode = childByKey(node, 'instructions');
      doc.system.instructions = instrNode ? instrNode.children.map(parseTextBlock) : [];
      const messagesNode = childByKey(node, 'messages');
      if (messagesNode) {
        const welcomeNode = childByKey(messagesNode, 'welcome');
        doc.system.welcomeMessage = welcomeNode
          ? welcomeNode.children.map((c) => c.text).join(' ')
          : undefined;
        doc.system.errorMessage = scalarOf(childByKey(messagesNode, 'error'));
      }
    } else if (firstWord === 'config') {
      doc.config = parseFlatMap(node);
    } else if (firstWord === 'variables') {
      doc.variables = parseVariables(node);
    } else if (firstWord === 'language') {
      doc.language = parseFlatMap(node);
    } else if (firstWord === 'knowledge') {
      doc.knowledge = parseFlatMap(node);
    } else if (firstWord === 'start_agent') {
      doc.subagents.push(parseSubAgent(node, true));
    } else if (firstWord === 'subagent') {
      doc.subagents.push(parseSubAgent(node, false));
    }
  }

  for (const sa of doc.subagents) {
    for (const inv of sa.actionInvocations) {
      if (inv.kind === 'transition') {
        doc.edges.push({
          from: sa.id,
          to: inv.targetSubagent,
          actionName: inv.name,
          condition: inv.condition,
          kind: 'route'
        });
      } else if (inv.kind === 'escalate') {
        doc.edges.push({
          from: sa.id,
          to: '__human__',
          actionName: inv.name,
          condition: inv.condition,
          kind: 'escalate'
        });
      } else if (inv.kind === 'tool' && inv.conditionalTransition) {
        doc.edges.push({
          from: sa.id,
          to: inv.conditionalTransition.to,
          actionName: inv.name,
          condition: inv.conditionalTransition.condition,
          kind: 'post-action'
        });
      }
    }
  }

  doc.generatedAt = new Date().toISOString();
  return doc;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const raw = fs.readFileSync(SOURCE, 'utf8');
const doc = parseAgentDoc(raw);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2));

console.log(
  `Parsed ${doc.subagents.length} subagents, ${doc.variables.length} variables, ${doc.edges.length} edges -> ${path.relative(process.cwd(), OUT)}`
);
