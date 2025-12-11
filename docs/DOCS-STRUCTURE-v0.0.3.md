# Docs Structure (v0.0.3 Cycle)

This file explains **where** to put context for this release.

## 1. Release-Level Context

- `RELEASE-v0.0.3.md`  
  - High-level goals, themes, migration notes, checklists.

- `docs/design/RELEASE-PLAN-v0.0.3-Foundation.md`  
  - Design narrative for v0.0.3 ("Foundations & Extensions").

- `.agents/v0.0.3-research-notes.md`  
  - Raw research + notes, not canonical, may drift over time.

## 2. Per-Area Context

For each major area, use this pattern:

- **Naming & Namespace Cleanup**
  - *What:* `docs/architecture/NAMESPACE-v0.0.3.md`
  - *Why:* Describe decisions about `@front.js/*` → `@frontjs/*`
  - *User-Facing:* Migration notes in `RELEASE-v0.0.3.md`

- **Core Enhancements (onCleanup, dev warnings)**
  - *What:* `docs/architecture/CORE-v0.0.3-Enhancements.md`
  - *Why:* Motivations, constraints, non-goals
  - *User-Facing:* Guides + API docs under `website/docs/`

- **Actions Docs Expansion**
  - *What:* `docs/design/ACTIONS-v0.0.3-Docs-Plan.md`
  - *User-Facing:* `website/docs/guides/actions.md`

- **Labs / Experimental Utilities**
  - *What:* `docs/design/LABS-v0.0.3-Plan.md`
  - *User-Facing:* `website/docs/guides/labs.md`

## 3. Golden Rule

- **Everything for *contributors* → `docs/**`**
- **Everything for *users* → `website/docs/**`**
- **Scratch / conversations → `.agents/**` (gitignored)**
