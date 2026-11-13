# Agent Explorer

A local, standalone React app that visualizes the Agentforce agent defined at
[`force-app/main/default/aiAuthoringBundles/Demo/Demo.agent`](../force-app/main/default/aiAuthoringBundles/Demo/Demo.agent)
— built to explain the agent's routing logic, subagent instructions,
actions, and variables to engineers and PMs.

**This is not Salesforce metadata.** It isn't deployed by
`sf project deploy`, doesn't ship to the org, and Salesforce has no native
React runtime (LWC is a different framework) — it's a presentation/demo tool
that lives alongside the SFDX project.

## Run it

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL. Three views:

- **Flow diagram** — the router and every subagent as a node graph. Click a
  node to see its full instructions, actions, transitions, and (for tool
  actions) input/output schemas.
- **Variables** — every linked and mutable variable the agent uses.
- **Overview** — agent-wide config, the system prompt/safety rules, and a
  legend explaining the agent script's directives (`@utils.transition`,
  `@subagent.X`, linked vs. mutable variables, etc.).

## How it stays in sync

`npm run dev` and `npm run build` both run `npm run generate-data` first
(see `predev`/`prebuild` in `package.json`), which runs
`scripts/parse-agent.mjs` — a small parser for the agent's custom,
indentation-based script format. It reads the real `Demo.agent` file and
regenerates `src/data/agent.generated.json` (git-ignored, derived data) every
time. The app never has a hand-maintained copy of the agent's content to go
stale — edit `Demo.agent`, restart the dev server, and the app reflects it.

To regenerate the JSON without starting the dev server:

```bash
npm run generate-data
```
