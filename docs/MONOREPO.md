This is a significant maturity milestone for the project. Moving to a monorepo structure allows you to manage the Core (View) and Actions (Network) as distinct, versioned products under one roof.

Here is the migration plan to transform your current repo into the `frontjs` stack.

### 1\. The New Architecture

We will use **NPM Workspaces**. It is built into Node.js, requires zero extra tools (no Lerna/Nx/Turbo required yet), and fits your "Zero Magic" philosophy.

### 2\. Migration Script

Run these commands in your terminal to restructure the folders. This moves your current work into `packages/core` and sets up the new `packages/actions`.

```bash
# 1. Create the packages directory
mkdir packages

# 2. Create the core package folder
mkdir -p packages/core

# 3. Move existing framework files into core
# (We exclude git, node_modules, and the new packages folder)
mv src tests dist build.config.js .npmignore packages/core/
mv package.json packages/core/

# Note: You might want to keep README.md and LICENSE in root 
# and copy them to core, but moving is safer for now to preserve history.
cp README.md packages/core/
cp LICENSE packages/core/ 2>/dev/null || :

# 4. Create the actions package folder
mkdir -p packages/actions/src
```

### 3\. Configuration Updates

Now we need to wire up the workspaces.

#### A. The Root `package.json`

Create a new `package.json` in the root folder. This controls the monorepo.

```json
{
  "name": "frontjs-workspace",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "test": "npm test --workspaces",
    "build": "npm run build --workspaces",
    "format": "prettier --write \"packages/**/*.{js,md}\""
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.50.0"
  }
}
```

#### B. Update `@frontjs/core`

Open `packages/core/package.json`. You need to rename it and ensure file paths are correct relative to its new home.

```json
{
  "name": "@frontjs/core", 
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/front.esm.js",
  "exports": {
    ".": {
      "import": "./dist/front.esm.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "node build.config.js",
    "test": "vitest"
  },
  "peerDependencies": {
    "uhtml": "^4.5.11"
  }
  // ... keep your other existing dependencies
}
```

#### C. Create `@frontjs/actions`

Create `packages/actions/package.json`.

```json
{
  "name": "@frontjs/actions",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./client": "./src/client.js",
    "./server": "./src/server.js"
  },
  "scripts": {
    "test": "vitest"
  },
  "peerDependencies": {
    "valibot": "^0.30.0" 
  }
}
```

*(Note: I added `valibot` as a peer dependency since `actions` relies on a Standard Schema validator).*

### 4\. Implement `actions` Package

Since we split the code in the previous step, let's place the implementation files into `packages/actions/src/`.

**`packages/actions/src/index.js`**

```javascript
// Shared utilities or exports
export const VERSION = '0.0.1';
```

**`packages/actions/src/server.js`**

```javascript
export const createRouter = (schemaMap, handlers) => ({
  async handle(request, context = {}) {
    const body = typeof request.json === 'function' ? await request.json() : request;
    const { action, payload } = body;

    if (!handlers[action]) {
      throw new Error(`[frontjs-actions] Unknown action: ${action}`);
    }

    const validator = schemaMap[action];
    if (validator && validator['~standard']) {
      const result = validator['~standard'].validate(payload);
      const { value, issues } = result instanceof Promise ? await result : result;
      
      if (issues) {
        throw new Error(`[frontjs-actions] Validation failed: ${JSON.stringify(issues)}`);
      }
      return handlers[action](value, context);
    }

    return handlers[action](payload, context);
  }
});
```

**`packages/actions/src/client.js`**

```javascript
export const createClient = (endpoint) => ({
  send: async (action, payload) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    
    if (!res.ok) throw new Error(`[frontjs-actions] Server Error: ${res.statusText}`);
    return res.json();
  }
});
```

### 5\. Verify the Stack

Run this from the root to install dependencies for all packages and run tests:

```bash
npm install
npm test
```

You now have a scalable architecture.

  * **`@frontjs/core`**: The view layer (1.34KB).
  * **`@frontjs/actions`**: The command layer (Type-safe RPC).


# Monorepo

the **"Split Repo"** or **"Read-Only Mirror"** pattern. Major frameworks like Symfony and Laravel use variations of this.

It allows you to work in a unified, private environment (the Monorepo) while automatically pushing code to public repositories (`frontjs/core`, `frontjs/docs`) for the community to consume and star.

Here is the plan to restructure your repo to support this **Private Workspace / Public Packages** model.

### 1\. The New Directory Structure

We will clear out the root directory, moving almost everything into `packages/`.

  * **`packages/core`**: The runtime (formerly `@watthem/front-js`).
  * **`packages/actions`**: The new command library.
  * **`packages/docs`**: A new package containing the Website, KB, Wiki, and Community files. This becomes your public documentation repo.
  * **`docs/` (Root)**: Contains **only** internal maintenance guides (like `MONOREPO.md`).

<!-- end list -->

```text
frontjs-workspace/ (Private Repo)
├── package.json          # Workspaces config
├── .github/              # Actions to sync folders to public repos
├── docs/                 # INTERNAL ONLY (Maintenance guides)
│   └── MONOREPO.md
└── packages/
    ├── core/             # -> Syncs to public: frontjs/core
    ├── actions/          # -> Syncs to public: frontjs/actions
    └── docs/             # -> Syncs to public: frontjs/docs
        ├── website/      # The landing page source
        ├── wiki/         # API, Standards, PRD
        └── content/      # Case studies, manifesto
```

### 2\. Migration Commands

Run this to clean up your root and establish the new structure:

````bash
# 1. Create the docs package
mkdir -p packages/docs

# 2. Move the website and KB into the docs package
mv website packages/docs/
mv KB packages/docs/

# 3. Move the community and wiki folders
mv community packages/docs/
mv wiki packages/docs/

# 4. Move technical docs to packages/docs (public)
# We keep specific architectural docs with the code, or centralized in docs package
mv docs/DESIGN.md packages/docs/wiki/
mv docs/LIMITATIONS.md packages/docs/wiki/
mv docs/ROADMAP.md packages/docs/wiki/

# 5. Clean up the root docs folder
# (We will create MONOREPO.md here shortly)
rm -rf docs/* ```

### 3. The Guide: `docs/MONOREPO.md`

Here is the internal documentation for your contributors. It explains how to work in this private-to-public workflow.

**`docs/MONOREPO.md`**

```markdown
# FrontJS Monorepo Guide

**Warning: This repository is PRIVATE.**
Do not push directly to the public repositories (`frontjs/core`, `frontjs/docs`).
All development happens here. Changes are automatically synced to public mirrors.

## 1. Structure

This workspace manages multiple packages that are published individually.

| Directory | Public Repo | Description |
| :--- | :--- | :--- |
| `packages/core` | `github.com/frontjs/core` | The runtime library (1.34KB). |
| `packages/actions` | `github.com/frontjs/actions` | The type-safe command layer. |
| `packages/docs` | `github.com/frontjs/docs` | The website, wiki, and examples. |

## 2. Workflows

### Installation
Install dependencies for **all** packages at once:
```bash
npm install
````

### Testing

You can run tests globally or per-package.

```bash
# Run ALL tests
npm test

# Run tests for core only
npm test -w @frontjs/core

# Run tests for actions only
npm test -w @frontjs/actions
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build -w @frontjs/core
```

## 3\. The "Mirroring" Process

We use GitHub Actions to sync code. When you merge a PR into `main` in this private repo, the following happens:

1.  **Filter:** The action checks which `packages/*` folders changed.
2.  **Push:** It pushes the contents of `packages/core` to the `main` branch of `frontjs/core`.
3.  **Tags:** If you tag a release (e.g., `core-v1.0.0`), it pushes that tag to the public repo.

**Note:** Community Pull Requests on public repos must be manually merged back into this monorepo by a maintainer.

## 4\. Dependency Management

  * **Internal Dependencies:** If `actions` depends on `core`, refer to it by version in `package.json`.
  * **Dev Dependencies:** Shared tools (Prettier, ESLint, Vitest) are installed at the **Root** `package.json`.

## 5\. Adding a New Package

1.  Create folder: `mkdir packages/new-pkg`
2.  Initialize: `npm init -y` inside that folder.
3.  Name it: `@frontjs/new-pkg`.
4.  Add a test file.
5.  Run `npm install` at root to link it.

<!-- end list -->

````

### 4. How to Sync (The "Magic" Part)

You don't need to write this script yourself. You can use a GitHub Action like **`cp-to-git`** or **`git-subrepo`**.

Here is a conceptual `.github/workflows/sync-core.yml` you would add to the private repo:

```yaml
name: Sync Core to Public
on:
  push:
    branches: [main]
    paths: ['packages/core/**']

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: yesolutions/mirror-action@v1
        with:
          REMOTE: 'https://github.com/frontjs/core.git'
          GIT_USERNAME: 'frontjs-bot'
          GIT_PASSWORD: ${{ secrets.PAT_TOKEN }}
          SOURCE: 'packages/core'
          TARGET: 'main'
````
