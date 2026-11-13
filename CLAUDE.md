# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Salesforce DX project containing a demo Salesforce Agent (AI conversational agent) built with Salesforce's Agentforce platform. The project uses API version 66.0 and follows Salesforce metadata format conventions.

## Commands

```bash
# Linting
npm run lint                  # Lint Aura and LWC JavaScript

# Testing
npm run test:unit             # Run LWC unit tests (Jest)
npm run test:unit:watch       # Watch mode
npm run test:unit:debug       # Debug mode
npm run test:unit:coverage    # With coverage report

# Formatting
npm run prettier              # Format all files (Apex, XML, HTML, CSS, YAML)
npm run prettier:verify       # Check formatting without writing

# Salesforce CLI
sf org login web                                    # Authorize an org
sf project deploy start --source-dir force-app      # Deploy all metadata
sf project retrieve start --source-dir force-app    # Pull org changes locally
sf apex run --file scripts/apex/hello.apex          # Run anonymous Apex

# Agent Script Recipes (vendored reference agents, see Architecture below)
sf project deploy start -d agent-script-recipes/force-app             # Deploy the 26+ recipe agents (Employee Agents)
npm run setup:service-agent                                           # Create agent user + deploy prep for the Service Agent recipe
sf project deploy start -d agent-script-recipes/force-app-service     # Deploy the CustomerServiceAgent recipe
```

Pre-commit hooks run automatically via Husky + lint-staged: Prettier formatting + ESLint + Jest on staged LWC files.

The default target org is `DemoOrg` (configured in `.sf/config.json`).

## Architecture

### Metadata Structure

All Salesforce metadata lives under `force-app/main/default/`. Files follow Salesforce conventions — each component has a `-meta.xml` descriptor alongside it. The project contains broad org metadata retrieved from the `DemoOrg` org: objects, flows, profiles, permission sets, layouts, reports, dashboards, and more. The `lwc/`, `aura/`, `classes/`, and `triggers/` directories are currently empty — all custom logic is in the AI Agent.

### AI Agent

The core of this project is the Salesforce Agent defined at:
`force-app/main/default/aiAuthoringBundles/Demo/Demo.agent`

The agent is a messaging/conversational agent with an entry router and ten subagents:
- **agent_router** — entry point; classifies intent and dispatches based on `@variables.isVerified`
- **ServiceCustomerVerification** — authenticates the customer before any sensitive data is touched
- **CaseManagement**, **AccountManagement**, **ReservationManagement**, **DeliveryIssues**, **OrderInquiries** — business subagents, reachable once verified
- **GeneralFAQ** — answers from the knowledge base, no verification required
- **escalation** — hands off to a live human agent (via `@utils.escalate`)
- **off_topic** — redirects out-of-scope requests
- **ambiguous_question** — asks clarifying questions

Agent flow uses special directives in the agent's custom, indentation-based script format (not standard YAML):
- `@utils.transition to @subagent.<name>` — transitions between subagents, optionally guarded by an `available when` condition
- `@utils.escalate` — hands the conversation to a human agent
- `@actions.<name>` — invokes a tool/action (a Flow, Apex, or built-in action)
- `@variables.<name>` / `@outputs.<name>` — reads/writes agent state, or reads a field from the action just called
- `@MessagingSession.` / `@MessagingEndUser.` / `@Contact.` — Salesforce linked variable bindings

Variables come in two kinds:
- **`linked`** — read-only bindings to Salesforce session/user data (e.g. `EndUserId`, `ContactId`)
- **`mutable`** — agent-managed state, either `Internal` (hidden from users) or `External` (e.g. `emailCaseId`)

The agent has built-in safety rules (blocks prompt injection, refuses to reveal system instructions) and supports localization (default: `en_US`, additional: `en_GB`).

### Agent Explorer (demo/visualization tool)

`agent-explorer/` is a standalone React + Vite app (own `package.json`, not part of any SFDX package directory, not deployed to the org) that visualizes the `Demo` agent above for explaining it to engineers and PMs: a flow diagram of the router/subagent/transition graph with a click-through detail panel, a variables table, and an overview with a legend for the script directives. `npm run dev`/`build` inside `agent-explorer/` first regenerate `src/data/agent.generated.json` by parsing the real `Demo.agent` file (`scripts/parse-agent.mjs`), so the app can't drift from the actual agent config. See `agent-explorer/README.md`.

### Agent Script Recipes (vendored reference agents)

`agent-script-recipes/` is a vendored copy of [trailheadapps/agent-script-recipes](https://github.com/trailheadapps/agent-script-recipes), added as two extra, non-default package directories in `sfdx-project.json`:
- `agent-script-recipes/force-app` — 26+ small standalone **Employee Agent** recipes, one Agent Script concept each, organized in four learning phases (`01_languageEssentials`, `02_actionConfiguration`, `03_reasoningMechanics`, `04_architecturalPatterns`), plus a `future_recipes/` folder of additional in-progress recipes. Each recipe is its own `aiAuthoringBundles/<Name>/<Name>.agent` bundle with a companion `README.md` explaining the concept.
- `agent-script-recipes/force-app-service` — one full **Service Agent** example (`CustomerServiceAgent`), structurally similar to this project's own `Demo` agent (it also needs a `default_agent_user`, provisioned via `npm run setup:service-agent`).

Supporting files were vendored alongside: `agent-script-recipes/data/` (sample records + `data-plan.json` for `sf data import tree`) and `agent-script-recipes/scripts/` (the service-agent user setup/cleanup scripts, wired into the root `package.json` as `setup:service-agent` / `clean:service-agent`). See `agent-script-recipes/README.md` for the full deployment walkthrough — no metadata name collisions with `force-app/` were found (checked classes, flows, permission sets, objects, and agent bundles), so both can be deployed into the same org. These recipes are reference/example material, not part of the `Demo` agent itself — don't wire them into `Demo.agent`'s subagent routing unless asked.

### Apex Authoring

`AdditionalRules/apex_rules.md` is the Apex authoring skill — load it (via `/generating-apex`) whenever creating or refactoring Apex classes, triggers, or invocable methods. It defines:
- Naming conventions, layering (Service / Selector / Domain), and class-type templates
- Hard-stop constraints (SOQL/DML outside loops, sharing keywords, no `@future`, bind variables)
- Required deliverables: `.cls`, `.cls-meta.xml`, and a test class (generated via `generating-apex-test`)
- A three-phase workflow: Author → Validate (code analyzer + tests) → Report

### Code Quality

ESLint uses modern flat config (`eslint.config.js`) with separate rules for Aura (with Locker Service restrictions) and LWC (recommended rules + wire adapter handling in tests). Prettier is configured with the `@prettier/plugin-xml`, `prettier-plugin-apex`, and LWC HTML parser overrides — no trailing commas (Salesforce style).

## Salesforce CLI Deployment

Deploy specific metadata types via the package manifest:
```bash
sf project deploy start --metadata-dir manifest/package.xml
```
