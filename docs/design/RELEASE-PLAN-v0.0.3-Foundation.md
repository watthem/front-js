# **Release Plan: v0.0.3 — “Foundations & Extensions”**

**Target Release Window:** January 2026
**Focus:** Stabilize core + extend ecosystem with optional “helper” modules
**Theme:** *Finish the foundations, begin the extensions.*
**See also: ../RELEASE-v0.0.3.md

---

# 1. **Goals for v0.0.3**

v0.0.2 established the structural identity of the Front.js ecosystem:

* The monorepo
* Core + Actions
* Documentation engine
* Type generation
* CI automation

v0.0.3 focuses on **completeness, consistency, and capability**.
This is the release that makes the project feel “real” to early adopters.

### **Primary Objectives**

1. **Stabilize @front.js/core**

   * API refinement & formal guarantees
   * Logically grouped docs with examples
   * Edge-case testing (hydration, nested islands, concurrency)

2. **Promote @front.js/actions from alpha → beta**

   * Dedicated docs page
   * Recipes for Next.js, Bun, Cloudflare Workers, HTMX backends
   * Validation + error model refinement

3. **Introduce the first “micro-modules” in the Front.js ecosystem**

   * `@front.js/shaders` (experimental)
   * `@front.js/inspect` (devtools mini-probe)
   * Optional: `@front.js/forms` (schema → reactive form helper)

4. **Finalize the “Zero Trust, Zero Build, Tiny Runtime” guarantees**

   * Document all constraints in a canonical “Front.js Design Contract”
   * Add automated tests to enforce constraints

5. **Launch the first version of the Issue / Milestone scaffolding**

   * A task board describing how to contribute, how issues are structured, how PRs flow

---

# 2. **Feature Set**

---

## **2.1 Core Improvements (@front.js/core)**

### ✔ **1. Hydration Stability Pass**

Add tests + fixes for:

* Hydrating multiple sibling islands
* Hydrating nested islands
* Hydration errors surfacing in dev mode
* Islands that re-render dynamically through Actions or fetch()

### ✔ **2. Reactive Engine Hardening**

* Better error messages for `val()` misuse
* Protective guards around recursive `run()`
* Sanity checks on `calc()` to prevent runaway effects
* Enable reactive debugging behind a flag (for inspect module)

### ✔ **3. UX Enhancements**

Add developer-friendly helpers:

* `html.debug()` mode (log compiled templates)
* A warning if islands are missing calls to `register()`
* A hydration boundary checker showing which island failed and why

---

## **2.2 Actions Enhancements (@front.js/actions)**

### ✔ **1. Move from Alpha → Beta**

* Fully typed error model (no untyped Error strings)
* Configurable validation error responses
* Default “safe error boundary” for production
* Add contextual metadata to router handlers (e.g., user, session, requestId)

### ✔ **2. Add Recipes**

Add official guides for:

* HTMX + Front.js hybrid app
* Next.js Route Handlers (Edge & Node)
* Bun server example
* Node/Express minimal example
* Python / FastAPI bridge (stretch goal)

### ✔ **3. Split `client` and `server` docs**

Currently scattered — make them explicit pages with diagrams.

---

## **2.3 New Ecosystem Modules (Experimental)**

These modules differentiate Front.js from being “just another micro-framework” and push it into purposeful territory.

### **Module A: @front.js/shaders (EXPERIMENTAL)**

Inspired by *Making Software: The Book of Shaders* patterns.

Purpose: **tiny helper around WebGL shader setup**, for use in:

* progressive enhancement
* background procedural textures
* low-footprint visual effects in server-driven UIs

Not a rendering engine — a helper.

API example:

```js
import { shader } from '@front.js/shaders';

const distort = shader({
  frag: `...`,
  vert: `...`,
  uniforms: { time: 0 }
});

distort.mount('#hero-graphic');
```

Must obey Front.js rules:

* No build step
* No bundlers
* No magic imports
* Tiny runtime

### **Module B: @front.js/inspect**

A micro-devtool that attaches to islands:

* Shows reactive graph (val links)
* Displays hydration status
* Shows runtime size & performance metrics

Should be small enough that it never gets bundled in prod, only loads via:

```html
<script src="/frontjs/inspect.js" data-mode="dev"></script>
```

### **Module C: @front.js/forms** (Optional)

Maps Standard Schema → reactive form helpers.

Not a full form library — just:

* field registration
* reactive error messages
* validation helpers

Especially useful with HTMX roundtrips.

---

# 3. Documentation Objectives

### **1. Finish the “Core Guides” Section**

Add:

* "When to Use Islands"
* "Patterns for Nested Islands"
* "Avoiding Pitfalls with val/run/calc"

### **2. Dedicated “Actions” Section**

* Concept overview
* Client guide
* Server guide
* Security & trust boundaries
* Framework integrations

### **3. New “Ecosystem Modules” Section**

Start cataloging official micro-modules.

### **4. Add First Real Demo Applications**

* Small HTMX + Front.js component demo
* Minimal “todos” app using Actions
* “Shader-enhanced landing page” demo using shaders module

---

# 4. CI / Tooling Work

* Add bundle-size regression tests
* Add a doc-lint rule for broken internal links
* Add smoke tests for all packages before publish
* Ensure `types` files match JS exports in CI
* Add “runtime size badge” generation to GitHub Actions

---

# 5. Issue List / Milestones Board

Below is the recommended board for v0.0.3.

---

## **Milestone: v0.0.3 — Core Stabilization**

### **Core:**

1. Hydration: sibling islands test
2. Hydration: nested islands test
3. Reactive engine: infinite loop guard
4. Add `html.debug()`
5. Improve hydration error reporting
6. Docs: Islands troubleshooting page
7. Add val/run/calc misuse errors

---

## **Milestone: v0.0.3 — Actions Beta**

1. Standardized error response model
2. Schema validation error formatting
3. Add metadata contexts to handlers
4. Create Next.js example repo
5. Create HTMX integration guide
6. Create Bun example repo
7. Docs: Actions overview page
8. Docs: Client guide
9. Docs: Server guide

---

## **Milestone: v0.0.3 — Ecosystem Modules**

### **Shaders (Experimental)**

* Basic shader loader
* Uniform update system
* Simple frag/vert examples
* Island integration test
* Docs: shaders intro

### **Inspect**

* Island map view
* Reactive graph view
* Runtime metrics
* Dev-only script loader
* Docs: inspect intro

### **Forms (Optional)**

* Schema → fields mapping
* Error messages
* Native HTML-first approach
* Docs: forms intro

---

## **Milestone: v0.0.3 — Documentation**

* “When to Use Islands”
* “Front.js Design Contract”
* “Security Model Deep Dive”
* “Server-Driven UI Patterns with Front.js”
* Actions + Ecosystem documentation

---

# 6. Envisioned Scaffolding

The v0.0.3 cycle should create a predictable structure for all future releases.

### **/docs/structure**

```
docs/
  strategy/
  architecture/
  design/
  contributing/
  modules/
  recipes/
website/docs/
  core/
  actions/
  modules/
  guides/
  reference/
```

### **/packages**

```
packages/
  core/
  actions/
  shaders/        (new)
  inspect/        (new)
  forms/          (optional new)
```

### **Examples**

```
examples/
  htmx/
  nextjs/
  bun/
  shader-demo/
  actions-todo/
```

---

# 7. Summary

The v0.0.3 cycle is about **stabilizing the core**, **hardening the actions package**, and **expanding the ecosystem** with your first official micro-modules.

It gives Front.js:

* A predictable identity
* A growing, cohesive ecosystem
* A documented philosophy
* A realistic pathway toward v0.1.0 RC

And it positions Front.js as the **default glue layer** for server-driven UIs — exactly as envisioned.

---

If you'd like, I can also:

✅ Generate the GitHub Milestones
✅ Create Issue templates
✅ Write the CHANGELOG draft
✅ Build the website docs stubs for the new modules
✅ Produce an RC roadmap toward v0.1.0

Just say the word.
