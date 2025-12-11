# Namespace & Package Naming – v0.0.3

## Problem

- Actual package names: `@front.js/core`, `@front.js/actions`
- Docs & badges: `@frontjs/core`, `@frontjs/actions`
- Decision for v0.0.3: standardize on `@frontjs/*` (no dot)

## Goals

- Single, consistent npm namespace.
- Clear migration path from legacy `@front.js/*`.
- No behavioral changes beyond import rename.

## Plan

- [ ] Rename package.json names in packages/core and packages/actions.
- [ ] Update root package.json workspace script references.
- [ ] Update docs / badges across all README files.
- [ ] Update website documentation references.
- [ ] Add migration notes to `RELEASE-v0.0.3.md`.
- [ ] (Optional) Keep a short "legacy usage" section for @front.js/*.

## Migration Path

Users must update their imports:

**Before:**
```javascript
import { val } from '@front.js/core';
import { createClient } from '@front.js/actions/client';
```

**After:**
```javascript
import { val } from '@frontjs/core';
import { createClient } from '@frontjs/actions/client';
```

## NPM Publishing Strategy

- Publish v0.0.3 under new `@frontjs/*` namespace
- Old `@front.js/*` packages remain at v0.0.2
- Add deprecation notice to npm package metadata if possible
- Users will need to explicitly update their package.json

## Non-Goals

- No automatic redirects from old to new namespace
- No dual-publishing to both namespaces
- No breaking API changes beyond the import path
