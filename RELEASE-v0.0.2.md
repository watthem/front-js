# Release Notes: v0.0.2

**Release Date:** 2025-12-10  
**Branch:** `dev` → `main`  
**Type:** Major architectural update

## 🎯 Overview

Version 0.0.2 transforms front.js into a production-ready monorepo with comprehensive documentation infrastructure, automated tooling, and governance for both human and AI contributors.

## 🚀 Major Changes

### 1. Monorepo Architecture

**Commit:** `b2bf5be`

- Restructured project as npm workspace monorepo
- Split into two packages:
  - `@frontjs/core` - Core reactivity and hydration framework
  - `@frontjs/actions` - Type-safe RPC/command layer with Standard Schema validation
- Maintains <5KB bundle size constraint
- Each package independently publishable to npm

### 2. Documentation Infrastructure (Phases 1-4)

#### Phase 1: Automated API Documentation

**Commit:** `b1f148a`

- JSDoc → Markdown generation via `jsdoc-to-markdown`
- Auto-generates per-function API docs in `website/docs/api/`
- Scripts: `npm run docs:api`, `npm run docs:generate`
- 10 functions documented (8 core + 2 actions)

#### Phase 2: Documentation Reorganization

**Commits:** `7b84aa5`, `9b6e459`, `0c2e7a6`, `946a3b5`

**Maintainer docs** (`/docs/`):

- `docs/architecture/` - Technical architecture and design decisions
- `docs/contributing/` - Development workflow and contribution guidelines
- `docs/strategy/` - Vision, roadmap, and product requirements
- `docs/design/` - Design systems and guidelines

**User-facing docs** (`/website/docs/`):

- `website/docs/api/` - Auto-generated API reference
- `website/docs/guides/` - How-to guides and tutorials
- `website/docs/reference/` - Limitations, comparisons, when to use
- `website/docs/FAQ.md` - Frequently asked questions

**Removed:**

- `/wiki/` directory (migrated all content)

#### Phase 3: TypeScript Definitions

**Commit:** `f22b3da`

- JSDoc → TypeScript `.d.ts` generation
- Scripts: `npm run types:generate`, `npm run types:core`, `npm run types:actions`
- IDE autocomplete support for TypeScript and JavaScript users
- Type safety for TypeScript consumers
- Added `types` field to package exports

#### Phase 4: CI & Documentation Governance

**Commit:** `4a454ce`

**Git Hooks (Husky):**

- Pre-commit validation for markdown file placement
- Blocks misplaced documentation with helpful suggestions
- Script: `scripts/validate-docs-placement.js`
- Guide: `docs/DOCS-README.md`

**GitHub Actions:**

- Auto-generates API docs on push to `main`/`dev`
- Auto-generates TypeScript definitions
- Commits updated docs automatically
- Workflow: `.github/workflows/docs.yml`

**Publishing:**

- `prepublishOnly` hooks in both packages
- Ensures docs and types are current before npm publish

### 3. Developer Experience

**Commit:** `ef30df1`

- Added `notes/` to `.gitignore` for developer scratchpad
- Removed temporary notes from git tracking
- Clear separation: tracked docs vs. temporary notes

## 📦 Package Structure

```
front-js/
├── packages/
│   ├── core/                    # @frontjs/core
│   │   ├── src/
│   │   ├── types/               # Generated .d.ts files
│   │   └── package.json
│   └── actions/                 # @frontjs/actions
│       ├── src/
│       ├── types/               # Generated .d.ts files
│       └── package.json
├── docs/                        # Maintainer documentation
│   ├── architecture/
│   ├── contributing/
│   ├── strategy/
│   └── design/
├── website/docs/                # User-facing documentation
│   ├── api/                     # Auto-generated
│   ├── guides/
│   └── reference/
├── scripts/
│   ├── generate-api-docs.js     # API doc generation
│   └── validate-docs-placement.js # Git hook validation
└── .github/workflows/
    └── docs.yml                 # CI automation
```

## 🎁 Features Added

- ✅ Monorepo with npm workspaces
- ✅ Automated API documentation from JSDoc
- ✅ TypeScript definitions generation
- ✅ Organized documentation structure
- ✅ Git hooks for documentation governance
- ✅ CI automation for docs and types
- ✅ Pre-publish validation
- ✅ Comprehensive placement guide for LLMs

## 🔧 New Scripts

### Root Level

- `npm run docs:api` - Generate API docs from JSDoc
- `npm run docs:generate` - Generate all documentation
- `npm run types:generate` - Generate TypeScript definitions
- `npm run types:core` - Generate core package types
- `npm run types:actions` - Generate actions package types

### Package Level

- `npm run prepublishOnly` - Pre-publish validation (auto-runs)

## 📝 Documentation

- **For Contributors:** Read `docs/DOCS-README.md`
- **For Users:** Visit `website/docs/`
- **API Reference:** `website/docs/api/`
- **Architecture:** `docs/architecture/BLUEPRINT.md`

## 🤖 AI Agent Guidelines

The repository now enforces documentation placement via git hooks:

- **Conversation logs** → `/.agents/` (gitignored)
- **API docs** → Auto-generated (don't edit manually)
- **User guides** → `/website/docs/guides/`
- **Maintainer docs** → `/docs/architecture|contributing|strategy|design/`
- **Temporary notes** → `/notes/` (gitignored)

See `docs/DOCS-README.md` for complete guidelines.

## ⚠️ Breaking Changes

**None** - This is an architectural refactor. The core API remains unchanged.

Existing usage of front.js continues to work:

```javascript
import { html, val, run, calc, register, hydrate } from '@frontjs/core';
```

## 🔄 Migration from v0.0.1

No migration required. The monorepo split is transparent to users importing from npm.

**Before:**

```javascript
import { val, run } from 'front'; // Still works if using old package name
```

**After:**

```javascript
import { val, run } from '@frontjs/core'; // Recommended
```

## 📊 Stats

- **Commits in dev branch:** 11 new commits since last release
- **Files changed:** 100+
- **Documentation files:** 30+ markdown files organized
- **API docs generated:** 10 functions
- **TypeScript definitions:** Complete coverage
- **Bundle size:** Still <5KB (core package)

## 🙏 Credits

- Documentation infrastructure inspired by best practices from TypeScript, Vite, and TC39 proposals
- Git hooks implementation uses Husky
- API docs generated with jsdoc-to-markdown

## 🔜 Next Steps (Post-Merge)

1. Tag release: `git tag v0.0.2`
2. Push to GitHub: `git push origin main --tags`
3. Publish packages: `npm publish -w @frontjs/core` and `npm publish -w @frontjs/actions`
4. Update website deployment
5. Announce release

## 📋 Commit Summary

```
* ef30df1 chore: gitignore notes/ directory
* 4a454ce feat: add CI automation and git hooks for documentation governance
* f22b3da feat: add TypeScript definitions generation from JSDoc
* 946a3b5 chore: format docs after reorganization
* 0c2e7a6 docs: migrate wiki/ content and remove wiki directory
* 9b6e459 docs: migrate user-facing docs to website/docs/
* 7b84aa5 docs: reorganize maintainer docs into categorized subdirectories
* 73b5b7a chore: prettier formatting and add documentation files
* b1f148a docs: implement automated API documentation generation from JSDoc
* 96fe522 docs: update REQUIREMENTS.md status audit
* b2bf5be refactor: Convert to monorepo with @frontjs/core and @frontjs/actions
```

---

**Ready to merge:** ✅  
**Tests passing:** ✅  
**Documentation complete:** ✅  
**Branch clean:** ✅
