# Release Notes: v0.0.3

> **Implementation Owner:** @watthem (matthew.scott.hendricks@gmail.com)  
> **Branch:** `watthem/v0.0.3`  
> **Design Details:** See `docs/design/RELEASE-PLAN-v0.0.3-Foundation.md`  
> **Research Notes:** See `.agents/v0.0.3-research-notes.md`

**Status:** Planned
**Milestone:** Pre-RC Cleanup & Ecosystem Cohesion
**Target Release Window:** 2025-Q1

---

## 🎯 Goal of v0.0.3

Version **0.0.3** is a polish & alignment release.
Its purpose is to:

* Correct inconsistencies introduced during the v0.0.2 monorepo migration
* Expand the documentation to cover missing areas (notably actions)
* Formalize package naming and ecosystem structure
* Establish the final architecture shape before **v0.1.0 RC**
* Introduce optional experimental modules (shader utilities, visual helpers)

This release does **not** introduce breaking changes.
Instead, it sharpens identity and prepares Front.js for its first public announcement at v0.1.0.

---

## 🚀 Major Themes

### 1. **Naming + Namespace Cleanup**

There is currently a mismatch between:

* repo uses → `@front.js/core`, `@front.js/actions`
* docs & badges → `@frontjs/core`, `@frontjs/actions`

**Decision:** Standardize on:

```
@frontjs/core
@frontjs/actions
```

(without the dot)

**Tasks:**

* [ ] Update both package.json files
* [ ] Update monorepo workspace definitions
* [ ] Update docs and README badges
* [ ] Add redirects/deprecation notes for users referencing `@front.js/*`
* [ ] Ensure npm namespace “frontjs” is fully configured and owned

---

### 2. **Documentation Expansion (Phase 5)**

v0.0.2 delivered a huge docs overhaul — but **Actions** are currently under-documented.

This release adds:

#### **A. New “Actions Guide” section at frontjs.dev/docs**

* What is `@frontjs/actions`
* When to use it
* Security model (Zero-Trust extension)
* Action schemas (Valibot/Zod/ArkType)
* Example server router
* Example client usage
* Example integrating Actions with Front.js islands

#### **B. “Best Practices” chapter**

* Hydration boundaries
* State ownership rules
* Event isolation
* Memory cleanup and lifecycle hooks
* What NOT to do (server closures, serialized functions)

#### **C. “Integration Cookbook”**

Expanding existing HTMX / Turbo / Unpoly integration notes with code examples:

* Progressive enhancement pattern
* Cleaning up reactive effects during partial swaps
* Data-island lifecycle best practices

---

### 3. **Ecosystem “Shape” Finalization**

Establishing the long-term package layout for the Front.js ecosystem:

```
frontjs/
├─ @frontjs/core          (Islands framework)
├─ @frontjs/actions       (RPC / Command layer)
└─ @frontjs/labs          (Experimental utilities: shaders, visual helpers, etc.)
```

### 4. **New Optional Package: `@frontjs/labs` (Experimental)**

This is a **single umbrella package** for experimental modules.
These are *not* part of the stable API but are useful helpers for island components.

#### **Initial modules included:**

##### **A. Shader Helper**

A small helper inspired by “Making Software – Shaders”:

* Utility for writing inline GLSL fragments
* Compile-safe wrapper around WebGL shader programs
* `createShaderIsland()` helper for embedding shader canvases inside islands
* Zero-build GLSL workflow (string-literal shaders)

##### **B. Animation Frame Loop**

A 1 KB micro-module for reactive animation loops:

* `onFrame(fn)` — fires every animation frame
* Automatically tied to island cleanup
* Perfect for canvas, shader, or DOM micro-animations

##### **C. Pixel/Canvas Primitives**

If time permits:

* `Canvas2DIsland`
* Reactive draw loop with `val()` signals

All Labs modules are:

* Marked `unstable/*` imports
* Excluded from “tiny runtime” guarantee
* Versioned but do not block v0.1.0

---

### 5. **Core Enhancements (Small, Safe, Useful)**

#### **A. New API: `onCleanup()`**

Hook for running teardown logic manually inside a component:

```js
register('Counter', () => {
  const x = val(0);

  onCleanup(() => {
    console.log('Island removed');
  });

  return () => html`<span>${x()}</span>`;
});
```

Ties into existing `_front_dispose` but gives developers explicit access.

#### **B. Dev-Mode Warnings**

* Warn if a `val()` is defined outside a component (accidental global state)
* Warn if hydration receives non-JSON-serializable props
* Warn on missing `data-island` attributes in dev mode

#### **C. Size Budget Checker (CI Upgrade)**

Enhance the existing `--check-size` script to print:

* gzipped size
* brotli size
* % delta from previous release

Goal: enforce <5KB guarantee until v1.0.

---

### 6. **Website Updates**

#### **A. Documentation navigation improvements**

* Add “Actions” and “Labs” to the sidebar
* Add visual examples to Quick Start
* Improve syntax highlighting for HTML/JS mixed docs

#### **B. Examples Gallery**

Add a few new examples:

* Todo list with `@frontjs/actions`
* Shader island demo (when Labs is enabled)
* HTMX integration example with page swapping

---

## 🔧 Engineering Tasks

### **Monorepo & Infrastructure**

* [ ] Rename NPM packages (`@frontjs/*`)
* [ ] Update workspace paths and build scripts
* [ ] Update badges across repo
* [ ] Update docs generation paths for API and guides

### **Docs**

* [ ] Write Actions Guide
* [ ] Write Best Practices chapter
* [ ] Write Integration Cookbook expansions
* [ ] Add examples & screenshots
* [ ] Update website sidebar navigation

### **Core**

* [ ] Implement `onCleanup(fn)`
* [ ] Implement dev-mode warnings
* [ ] Update hydration runtime

### **Labs**

* [ ] Create package folder: `packages/labs/`
* [ ] Implement Shader Helper
* [ ] Implement Animation Frame Loop
* [ ] Write initial documentation

---

## 🧪 Tests & Validation

* Unit test coverage for Actions router and client
* Tests for new cleanup hook
* Labs packages: smoke tests only (do not block release)
* Browser compatibility tests
* Integration test with HTMX/Turbo demo app

---

## 🔄 Migration Notes

**Nothing breaks.**
v0.0.3 remains backwards-compatible.

If a user currently imports:

```js
import { val } from '@front.js/core';
```

They will now see this warning:

> ⚠️ The “@front.js/*” namespace is deprecated. Use “@frontjs/*”.

Auto-fixes via search/replace recommended.

---

## 📣 Post-Release Actions

1. Publish v0.0.3 packages to npm (`@frontjs/core`, `@frontjs/actions`, `@frontjs/labs`)
2. Deploy updated documentation to frontjs.dev
3. Add changelog to GitHub releases page
4. Tag release: `git tag v0.0.3`
5. Begin roadmap for **v0.1.0 RC**
6. Prepare first public announcement (blog + frontjs.dev homepage highlights)

---

## ⭐ Road to v0.1.0 RC

* API freeze for core
* Stabilize Actions package
* Add sandbox/on-page playground (possibly via `frontjs.dev/play`)
* Add benchmarks (hydro vs vanilla island hydration)
* First public announcement

---

