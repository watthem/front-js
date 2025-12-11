# Contributing Notes – v0.0.3

For this release:

## Context Docs

- **High-level:** `RELEASE-v0.0.3.md`
- **Design details:** `docs/design/RELEASE-PLAN-v0.0.3-Foundation.md`
- **Per-area:** See `docs/DOCS-STRUCTURE-v0.0.3.md`

## User Docs

- New guides go under `website/docs/guides/`.
- API docs remain auto-generated under `website/docs/api/`.

## Experimental Work

- Lives in `@frontjs/labs`.
- Mark everything exported as `unstable/*` in docs and code comments.
- Add warnings in code and documentation.

## File Organization

Please do **not** add new longform docs outside the documented locations;
if in doubt, update `docs/DOCS-STRUCTURE-v0.0.3.md` first.

## Development Workflow

1. **Before starting work:** Review the relevant architecture/design docs
2. **During implementation:** Update docs if you learn something new or approach changes
3. **After completion:** Update success criteria in relevant docs

## Key Documents Reference

### Package Naming
- Design: `docs/architecture/NAMESPACE-v0.0.3.md`
- Tasks: See RELEASE-v0.0.3.md § "Naming + Namespace Cleanup"

### Core Enhancements
- Design: `docs/architecture/CORE-v0.0.3-Enhancements.md`
- User Guide: TBD (will be in best-practices.md)

### Actions Documentation
- Plan: `docs/design/ACTIONS-v0.0.3-Docs-Plan.md`
- User Guide: `website/docs/guides/actions.md` (stub created)

### Labs Package
- Plan: `docs/design/LABS-v0.0.3-Plan.md`
- User Guide: `website/docs/guides/labs.md` (stub created)
- Package: `packages/labs/` (scaffolded)

## Testing Guidelines

- Core changes require tests in `tests/`
- Actions changes require tests in `packages/actions/src/*.test.js`
- Labs changes only require smoke tests initially

## Documentation Guidelines

- Maintainer docs: Markdown in `docs/`
- User-facing docs: Markdown in `website/docs/`
- Code comments: JSDoc for API documentation generation
- Examples: Runnable code in `examples/` with README

## Branch and Commit Strategy

- Branch: `watthem/v0.0.3`
- Commit messages should reference relevant design docs when appropriate
- For package rename: Use clear commit message explaining breaking change

## Questions?

If anything is unclear or you need to deviate from the structure:
1. Document why in `.agents/` folder
2. Update the relevant design doc
3. Discuss in PR or issue
