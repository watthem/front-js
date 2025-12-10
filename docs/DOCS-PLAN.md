# Plan: Formalize Documentation Structure & Generate API Docs from JSDoc

## Problem Statement

Documentation is currently scattered across multiple locations (docs/, wiki/, website/, KB/, community/) with no clear hierarchy. Package-level docs mix user-facing content with maintainer content. API documentation in wiki/API.md is manually maintained despite comprehensive JSDoc existing in source files.

**Goals:**

1. Clean separation: packages = maintainer docs only, frontjs/docs = user docs
2. Generate API documentation automatically from JSDoc
3. Migrate user-facing docs to KB/website
4. Set up automated TypeScript definitions generation

---

## Current Documentation Audit

### Root Level Directories:

- `/docs/` - 16 files (strategic/conceptual, maintainer-focused)
- `/wiki/` - 7 files (standards, guides, **manually maintained API.md**)
- `/website/` - Public site, KB, examples
- `/KB/` - Knowledge base (duplicate of /website/KB?)
- `/community/` - Feedback, summaries
- `/packages/core/` - No docs/ directory (clean ✅)
- `/packages/actions/` - No docs/ directory (clean ✅)

### JSDoc Coverage:

✅ **@frontjs/core** - Fully documented:

- `packages/core/src/index.js` - @fileoverview
- `packages/core/src/core/reactivity.js` - val(), run(), calc()
- `packages/core/src/core/component.js` - defineComponent()
- `packages/core/src/core/client.js` - register(), hydrate(), validators
- `packages/core/src/core/renderer.js` - html(), render() (with new warnings)

✅ **@frontjs/actions** - Fully documented:

- `packages/actions/src/client.js` - createClient()
- `packages/actions/src/server.js` - createRouter()

---

## Proposed Documentation Structure

### Package-Level (Maintainer Docs Only)

**packages/core/**

```
packages/core/
├── src/
│   └── (source files with JSDoc)
├── tests/
├── README.md              ← Quick start, link to main docs
├── CONTRIBUTING.md        ← How to contribute to core
└── CHANGELOG.md           ← Version history
```

**packages/actions/**

```
packages/actions/
├── src/
│   └── (source files with JSDoc)
├── tests/
├── README.md              ← Quick start, link to main docs
├── CONTRIBUTING.md        ← How to contribute to actions
└── CHANGELOG.md           ← Version history
```

**NO DOCS DIRECTORIES IN PACKAGES** - Keep them focused on code.

---

### Root Level (Maintainer/Contributor Docs)

**docs/** - Internal strategy, architecture, processes

```
docs/
├── architecture/
│   ├── BLUEPRINT.md       ← Core architecture
│   ├── ENGINE.md          ← Reactivity engine design
│   └── DESIGN.md          ← Design decisions
├── contributing/
│   ├── REQUIREMENTS.md    ← Requirements checklist
│   ├── MONOREPO.md        ← Monorepo workflow
│   └── PR_TEMPLATE.md     ← PR guidelines
├── strategy/
│   ├── MANIFESTO.md       ← Project philosophy
│   ├── VISION.md          ← Long-term vision
│   ├── ROADMAP.md         ← Development roadmap
│   └── WHEN-NOT-TO-USE-REACT.md
└── design/
    └── DESIGN_SYSTEM.md   ← UI/UX guidelines
```

**wiki/** - ❌ **DELETE or MERGE INTO DOCS**

- Most content should move to `/docs/` or `/website/docs/`
- wiki/API.md → Auto-generate and place in website/docs/api/

**community/** - Keep for feedback/discussions

```
community/
├── FEEDBACK.md
├── LIMITATIONS-SUMMARY.md
└── README.md
```

---

### Website/Public (User-Facing Docs)

**website/docs/** - User documentation (auto-generated + guides)

```
website/docs/
├── index.html                    ← Docs homepage
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── your-first-component.md
├── guides/
│   ├── reactivity.md             ← val/run/calc guide
│   ├── components.md             ← Component patterns
│   ├── hydration.md              ← Islands architecture
│   ├── template-tags-vs-strings.md  ← NEW (from our work)
│   ├── security.md               ← Security-Model.md (migrated)
│   └── htmx-integration.md
├── api/                          ← AUTO-GENERATED from JSDoc
│   ├── index.md                  ← API overview
│   ├── core/
│   │   ├── val.md                ← Generated from reactivity.js
│   │   ├── run.md
│   │   ├── calc.md
│   │   ├── html.md               ← Generated from renderer.js
│   │   ├── render.md
│   │   ├── register.md           ← Generated from client.js
│   │   └── hydrate.md
│   └── actions/
│       ├── createClient.md       ← Generated from client.js
│       └── createRouter.md       ← Generated from server.js
├── examples/
│   └── (existing examples)
└── reference/
    ├── limitations.md            ← LIMITATIONS.md (migrated)
    └── when-to-use.md            ← WHEN-TO-USE-FRONT.md (migrated)
```

**website/KB/** - ❌ **CONSOLIDATE INTO website/docs/**

- Appears to be duplicate of /KB/ at root
- Merge into unified website/docs/ structure

---

## Implementation Plan

### Phase 1: Set Up JSDoc Generation

**Goal:** Generate API documentation automatically from JSDoc strings

#### Task 1.1: Install JSDoc Tooling

**Install jsdoc-to-markdown** (converts JSDoc → Markdown for website):

```bash
npm install --save-dev jsdoc-to-markdown
```

**Why jsdoc-to-markdown:**

- Outputs Markdown (perfect for website/docs/api/)
- Lightweight
- Integrates with build scripts
- Can generate per-function Markdown files

**Alternative considered:** TypeDoc (TypeScript-focused, heavier)

#### Task 1.2: Create JSDoc Configuration

**File:** `.jsdoc.json` (root level)

```json
{
  "source": {
    "include": ["packages/core/src", "packages/actions/src"],
    "includePattern": ".+\\.js$",
    "excludePattern": "(node_modules|tests)"
  },
  "opts": {
    "destination": "./website/docs/api",
    "recurse": true,
    "readme": "./README.md"
  },
  "plugins": ["plugins/markdown"],
  "markdown": {
    "idInHeadings": true
  }
}
```

#### Task 1.3: Add Doc Generation Scripts

**File:** `package.json` (root)

```json
{
  "scripts": {
    "docs:generate": "npm run docs:core && npm run docs:actions",
    "docs:core": "jsdoc2md packages/core/src/**/*.js --files --heading-depth 2 --output website/docs/api/core.md",
    "docs:actions": "jsdoc2md packages/actions/src/**/*.js --files --heading-depth 2 --output website/docs/api/actions.md",
    "docs:watch": "nodemon --watch packages/core/src --watch packages/actions/src --exec npm run docs:generate",
    "docs:serve": "npx serve website/docs"
  }
}
```

**Per-function Markdown generation:**

```json
{
  "scripts": {
    "docs:api": "node scripts/generate-api-docs.js"
  }
}
```

#### Task 1.4: Create API Doc Generation Script

**File:** `scripts/generate-api-docs.js`

```javascript
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

const packages = [
  {
    name: 'core',
    path: 'packages/core/src',
    functions: [
      { name: 'val', file: 'core/reactivity.js' },
      { name: 'run', file: 'core/reactivity.js' },
      { name: 'calc', file: 'core/reactivity.js' },
      { name: 'html', file: 'core/renderer.js' },
      { name: 'render', file: 'core/renderer.js' },
      { name: 'register', file: 'core/client.js' },
      { name: 'hydrate', file: 'core/client.js' },
      { name: 'defineComponent', file: 'core/component.js' },
    ],
  },
  {
    name: 'actions',
    path: 'packages/actions/src',
    functions: [
      { name: 'createClient', file: 'client.js' },
      { name: 'createRouter', file: 'server.js' },
    ],
  },
];

async function generateDocs() {
  for (const pkg of packages) {
    const outputDir = `website/docs/api/${pkg.name}`;
    fs.mkdirSync(outputDir, { recursive: true });

    for (const fn of pkg.functions) {
      const inputFile = path.join(pkg.path, fn.file);
      const output = await jsdoc2md.render({
        files: inputFile,
        'heading-depth': 2,
        'no-gfm': false,
      });

      const outputFile = path.join(outputDir, `${fn.name}.md`);
      fs.writeFileSync(outputFile, output);
      console.log(`✅ Generated ${outputFile}`);
    }

    // Generate index
    const indexContent = `# @frontjs/${pkg.name} API Reference

${pkg.functions.map((fn) => `- [${fn.name}](./${fn.name}.md)`).join('\n')}
`;
    fs.writeFileSync(path.join(outputDir, 'index.md'), indexContent);
  }

  console.log('✅ API documentation generated!');
}

generateDocs().catch(console.error);
```

---

### Phase 2: Reorganize Existing Documentation

**Goal:** Clean separation between maintainer docs and user docs

#### Task 2.1: Restructure /docs/

Move files into categorized subdirectories:

```bash
mkdir -p docs/{architecture,contributing,strategy,design}

# Architecture docs
mv docs/BLUEPRINT.md docs/architecture/
mv docs/ENGINE.md docs/architecture/
mv docs/DESIGN.md docs/architecture/

# Contributing docs
mv docs/REQUIREMENTS.md docs/contributing/
mv docs/MONOREPO.md docs/contributing/

# Strategy docs
mv docs/MANIFESTO.md docs/strategy/
mv docs/ROADMAP.md docs/strategy/
mv docs/WHEN-NOT-TO-USE-REACT.md docs/strategy/
mv docs/WHEN-TO-USE-FRONT.md docs/strategy/

# Design docs
mv docs/DESIGN_SYSTEM.md docs/design/

# Actions-specific
mv docs/ACTIONS-DESIGN.md docs/architecture/
```

#### Task 2.2: Migrate User Docs to Website

**Move to website/docs/:**

```bash
# Guides
cp docs/Security-Model.md website/docs/guides/security.md
cp docs/Template-Tags-vs-Strings.md website/docs/guides/template-tags-vs-strings.md
cp docs/LIMITATIONS.md website/docs/reference/limitations.md
cp docs/WHEN-TO-USE-FRONT.md website/docs/reference/when-to-use.md

# Delete duplicates from root docs
rm docs/Security-Model.md docs/Template-Tags-vs-Strings.md
```

#### Task 2.3: Consolidate KB Directories

**Problem:** Both `/KB/` and `/website/KB/` exist

**Solution:** Merge into `/website/docs/`

```bash
# Review /KB/ content and merge unique files into website/docs/
# Delete /KB/ directory after migration
```

#### Task 2.4: Update /wiki/

**Options:**

1. **Option A (Recommended):** Delete /wiki/, migrate content
   - wiki/API.md → Auto-generated in website/docs/api/
   - wiki/INTEGRATIONS.md → website/docs/guides/integrations.md
   - wiki/FAQ.md → website/docs/faq.md
   - wiki/STANDARDS.md → docs/architecture/STANDARDS.md (maintainer doc)
   - wiki/PRD.md → docs/strategy/PRD.md (maintainer doc)

2. **Option B:** Keep /wiki/ for GitHub wiki sync
   - Some projects use /wiki/ as source for GitHub's wiki feature
   - Less recommended if not actively using GitHub wiki

**Recommendation:** Option A (delete and migrate)

---

### Phase 3: Generate TypeScript Definitions (Bonus)

**Goal:** Provide TypeScript definitions from JSDoc

#### Task 3.1: Generate .d.ts Files

**Add to package.json:**

```json
{
  "scripts": {
    "types:generate": "tsc --declaration --emitDeclarationOnly --allowJs --outDir types packages/core/src/index.js packages/actions/src/index.js",
    "types:core": "tsc --declaration --emitDeclarationOnly --allowJs --outDir packages/core/types packages/core/src/index.js",
    "types:actions": "tsc --declaration --emitDeclarationOnly --allowJs --outDir packages/actions/types packages/actions/src/index.js"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**Why:**

- JSDoc → TypeScript definitions automatically
- Better IDE autocomplete for users
- Type safety for TypeScript users
- No changes to source code needed

#### Task 3.2: Update Package Exports

**packages/core/package.json:**

```json
{
  "name": "@frontjs/core",
  "types": "./types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/front.esm.js",
      "types": "./types/index.d.ts"
    }
  }
}
```

---

### Phase 4: Automation & CI Integration

**Goal:** Keep docs in sync automatically

#### Task 4.1: Add Pre-Publish Hook

**packages/core/package.json:**

```json
{
  "scripts": {
    "prepublishOnly": "npm run types:generate && npm run docs:generate"
  }
}
```

#### Task 4.2: Add GitHub Actions Workflow

**File:** `.github/workflows/docs.yml`

```yaml
name: Generate Documentation

on:
  push:
    branches: [main, dev]
    paths:
      - 'packages/*/src/**/*.js'
      - '.github/workflows/docs.yml'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run docs:generate
      - run: npm run types:generate
      - name: Commit updated docs
        run: |
          git config user.name "frontjs-bot"
          git config user.email "bot@frontjs.dev"
          git add website/docs/api/ packages/*/types/
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "docs: auto-generate API docs from JSDoc"
          git push
```

---

## Files to Create

1. **`.jsdoc.json`** - JSDoc configuration
2. **`scripts/generate-api-docs.js`** - API doc generation script
3. **`website/docs/api/`** - Directory for generated API docs
4. **`docs/architecture/`**, **`docs/contributing/`**, **`docs/strategy/`**, **`docs/design/`** - Organized doc directories
5. **`.github/workflows/docs.yml`** - Automated doc generation
6. **`packages/core/types/`**, **`packages/actions/types/`** - TypeScript definitions

## Files to Modify

1. **`package.json`** (root) - Add doc generation scripts
2. **`packages/core/package.json`** - Add types field, prepublish hook
3. **`packages/actions/package.json`** - Add types field, prepublish hook
4. **Move/rename existing docs** per Phase 2

## Files to Delete

1. **`/wiki/`** directory (after migrating content)
2. **`/KB/`** directory (after consolidating into website/docs/)
3. **Duplicate docs** in /docs/ after migration to website/

---

## Success Criteria

- [ ] JSDoc generates Markdown API docs in website/docs/api/
- [ ] TypeScript definitions (.d.ts) generated from JSDoc
- [ ] Clear separation: packages = maintainer, website/docs = user
- [ ] /docs/ organized into architecture/contributing/strategy/design
- [ ] /wiki/ deleted or migrated
- [ ] CI automatically regenerates docs on source changes
- [ ] No user-facing docs in packages/
- [ ] All API docs auto-generated (no manual wiki/API.md)

---

## Migration Checklist

**Phase 1: Setup (30 min)**

- [ ] Install jsdoc-to-markdown
- [ ] Create .jsdoc.json
- [ ] Create scripts/generate-api-docs.js
- [ ] Add doc generation scripts to package.json
- [ ] Test: npm run docs:generate

**Phase 2: Reorganize (1 hour)**

- [ ] Create docs/ subdirectories
- [ ] Move maintainer docs into categories
- [ ] Migrate user docs to website/docs/
- [ ] Consolidate /KB/ into website/docs/
- [ ] Migrate/delete /wiki/
- [ ] Update internal links in docs

**Phase 3: TypeScript (15 min)**

- [ ] Install TypeScript as dev dependency
- [ ] Add types:generate scripts
- [ ] Update package.json exports with types field
- [ ] Test: npm run types:generate

**Phase 4: Automation (15 min)**

- [ ] Add prepublishOnly hooks
- [ ] Create .github/workflows/docs.yml
- [ ] Test CI workflow
- [ ] Verify auto-commit works

---

## Rationale

**Why this structure:**

1. **Packages stay clean** - Only code, tests, and minimal README
2. **Docs are discoverable** - /docs/ for contributors, website/docs/ for users
3. **Automation reduces maintenance** - JSDoc is source of truth
4. **TypeScript users benefit** - .d.ts files for autocomplete
5. **CI keeps docs fresh** - Auto-regenerate on every commit

**Benefits:**

- Reduces manual maintenance of API docs
- Improves developer experience (autocomplete, types)
- Clear hierarchy (maintainer vs user docs)
- Single source of truth (JSDoc in source files)
- Scalable as packages grow
