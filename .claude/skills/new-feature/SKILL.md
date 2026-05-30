---
name: new-feature
description: Full-pipeline feature development skill. Guides a feature from raw requirement through BA refinement, UX design, dev implementation, and E2E testing. Each stage pauses for user review and explicit approval before the next stage starts. Invoke with /new-feature.
args:
  - name: feature-name
    description: Short kebab-case identifier for the feature (e.g. "log-filter", "export-csv"). Used as the Git branch name and as a label throughout the pipeline.
    required: true
---

# New Feature Pipeline

This skill orchestrates the complete feature lifecycle in four sequential agent stages. The variable `{{feature-name}}` flows through every stage as the Git branch name and the story directory name.

All story artifacts are written to `.claude/stories/{{feature-name}}/` in the project root:
- `story.md` — user story and acceptance criteria (BA agent)
- `ux.md` — UX design outline (UX agent)
- `test-results.md` — E2E test results (test agent)
- `status.md` — current pipeline status (updated by each agent)

**IMPORTANT — Human-in-the-loop rule:** After each stage completes, you MUST stop and present a review summary to the user. Do NOT start the next stage until the user explicitly approves with a clear confirmation ("yes", "approved", "go ahead", "proceed", or equivalent). If the user requests changes, incorporate them before asking for approval again.

---

## Stage 1 — BA Agent: Requirements & Story Card

Invoke **ba-agent** to:

1. Greet the user and ask for a plain-language description of what they want built.
2. Probe for missing context: who benefits, what problem it solves, acceptance criteria, edge cases.
3. Rewrite the raw input into a structured Agile user story:
   - **Title:** `[{{feature-name}}] <short imperative title>`
   - **As a** … **I want** … **So that** …
   - **Acceptance Criteria** (numbered list)
   - **Out of scope** (one line)
4. Write the full story to `.claude/stories/{{feature-name}}/story.md`.
5. Write `TODO` to `.claude/stories/{{feature-name}}/status.md`.
6. Return the file path and full story text.
7. Do NOT create, update, or move any Trello cards.

### Stage 1 Review Gate

After ba-agent completes, present this summary to the user and WAIT for approval:

```
--- Stage 1 Complete: Story Card ---
Story file: .claude/stories/{{feature-name}}/story.md

<paste the full user story here>

---
Approve to continue to UX design, or tell me what to change.
```

Do NOT invoke ux-agent until the user explicitly approves.

---

## Stage 2 — UX Agent: Design Outline

Invoke **ux-agent** only after Stage 1 is approved:

1. Read `.claude/stories/{{feature-name}}/story.md`.
2. Produce a concise design outline covering:
   - **Screen / component breakdown** — which views are affected
   - **Interaction flow** — step-by-step user journey (numbered)
   - **Key UI states** — empty, loading, error, success
   - **Component inventory** — list of new or modified components with their props
   - **Layout sketch** — ASCII wireframe for the primary screen
3. Write the design outline to `.claude/stories/{{feature-name}}/ux.md` with a top-level heading `# UX Design Outline`.

### Stage 2 Review Gate

After ux-agent completes, present this summary to the user and WAIT for approval:

```
--- Stage 2 Complete: UX Design ---
Design file: .claude/stories/{{feature-name}}/ux.md

<paste the full design outline here>

---
Approve to start implementation, or tell me what to change.
```

Do NOT invoke dev-agent until the user explicitly approves.

---

## Stage 3 — Dev Agent: Implementation

Invoke **dev-agent** only after Stage 2 is approved:

1. Read `.claude/stories/{{feature-name}}/story.md` and `.claude/stories/{{feature-name}}/ux.md`.
2. Prepare the branch:
   ```
   git checkout main
   git pull --rebase
   git checkout -b feature/{{feature-name}}
   ```
3. Update `.claude/stories/{{feature-name}}/status.md` to `DOING`.
4. Implement the feature following the project's coding conventions (TypeScript strict, functional components, named exports, no `any`, no dead code).
5. Run the full quality suite and fix all failures before continuing:
   ```
   pnpm typecheck
   pnpm lint
   pnpm run test
   ```
6. Commit all changes to `feature/{{feature-name}}` with a clear commit message.
7. Report the branch name and a summary of what was built.

### Stage 3 Review Gate

After dev-agent completes, present this summary to the user and WAIT for approval:

```
--- Stage 3 Complete: Implementation ---
Branch: feature/{{feature-name}}

<paste the implementation summary here>

Quality checks: typecheck ✅  lint ✅  tests ✅

---
Approve to start E2E testing, or tell me what to change.
```

Do NOT invoke test-agent until the user explicitly approves.

---

## Stage 4 — Test Agent: E2E Verification & Story Update

Invoke **test-agent** only after Stage 3 is approved:

1. Read the acceptance criteria from `.claude/stories/{{feature-name}}/story.md`.
2. Write Playwright E2E tests that cover every acceptance criterion.
3. Run the E2E tests:
   ```
   pnpm exec playwright test
   ```
4. If any test fails:
   - Collect the full failure output (test name, error message, stack trace).
   - Present a failure report to the user and WAIT for approval before handing off to dev-agent:
     ```
     --- Stage 4 Failed: E2E Tests ---
     <list each failing test with its error message>

     ---
     Approve to send these failures to dev-agent for fixes, or tell me how to proceed.
     ```
   - Once approved, invoke **dev-agent** with the exact failure details as context so it can fix the root cause. dev-agent must run the full quality suite (typecheck, lint, test) before finishing.
   - After dev-agent completes its fix, present a Stage 3 Review Gate (same format as above) and WAIT for user approval before running test-agent again.
   - Repeat this loop (test-agent → failure report → user approval → dev-agent fix → user approval → test-agent) until all tests pass.
5. When all tests pass:
   - Write test results to `.claude/stories/{{feature-name}}/test-results.md` listing each test case and its ✅ status.
   - Update `.claude/stories/{{feature-name}}/status.md` to `TEST`.
6. Create a Pull Request from `feature/{{feature-name}}` → `main` with the story title as the PR title and the acceptance criteria as the PR body.
7. Report the PR URL to the user.

---

## Completion

When Stage 4 succeeds, output:

```
✅ Feature [{{feature-name}}] pipeline complete.
   Story: .claude/stories/{{feature-name}}/
   Pull Request: <PR URL>
   Branch: feature/{{feature-name}}
   All acceptance criteria verified by E2E tests. Awaiting your PR review.
```

Do NOT merge automatically. Wait for explicit user approval before merging.
