# Roadmap

**Version:** 1.0  
**Last Updated:** 2025-12-06

This document tracks potential future improvements, organized by priority and effort level. Items here address limitations documented in [LIMITATIONS.md](./LIMITATIONS.md).

---

## Priority Legend

- 🔴 **Critical** - Blocks adoption or causes severe issues
- 🟡 **High** - Improves DX significantly or addresses common pain points
- 🟢 **Nice-to-Have** - Polish, conveniences, or niche use cases
- 🔵 **Research** - Needs investigation before commitment

## Effort Legend

- S (Small) - < 1 day
- M (Medium) - 1-3 days
- L (Large) - 1+ weeks

---

## v1.1 - Developer Experience

### TypeScript Support

**Priority:** 🟡 High  
**Effort:** M  
**Status:** Not Started

**Goal:** Generate `.d.ts` files from JSDoc comments.

**Tasks:**

- [ ] Add JSDoc type annotations to all public APIs
- [ ] Use `tsc --declaration --emitDeclarationOnly` to generate types
- [ ] Test types with example projects
- [ ] Add `types` field to `package.json`
- [ ] Document in README

**Benefits:**

- IntelliSense in VS Code
- Type checking for users
- Better IDE autocomplete

**Trade-offs:**

- Adds build step (dev-only)
- Maintenance burden to keep JSDoc in sync

---

### Better Error Messages

**Priority:** 🟡 High  
**Effort:** M  
**Status:** Not Started

**Goal:** Provide helpful error messages with stack traces and suggestions.

**Current Issues:**

- Silent failures during hydration
- Unclear reactivity errors
- No context for JSON parse failures

**Improvements:**

```javascript
// Before
console.warn('Component not found:', name);

// After
console.error(
  `[front.js] Component "${name}" not registered.\n` +
    `Did you forget to call register('${name}', Component)?\n` +
    `Registered components: ${Array.from(registry.keys()).join(', ')}`
);
```

**Tasks:**

- [ ] Add error codes (e.g., `ERR_COMPONENT_NOT_FOUND`)
- [ ] Include helpful suggestions in error messages
- [ ] Add stack traces to reactivity errors
- [ ] Create error documentation page
- [ ] Test error messages across browsers

---

## v1.2 - Performance Optimizations

### Switch to Keyed Templates

**Priority:** 🟢 Nice-to-Have  
**Effort:** S  
**Status:** Not Started

**Goal:** Use `uhtml/keyed` by default for better list rendering performance.

**Change:**

```javascript
// From
import { html } from 'uhtml';

// To
import { html } from 'uhtml/keyed';
```

**Benefits:**

- Better performance for large lists
- Stable item identity during reordering
- Reduced DOM thrashing

**Trade-offs:**

- Slightly larger bundle (~200 bytes)
- Breaking change (requires explicit keys)

**Migration Path:**

```javascript
// Before (v1.0)
items().map((item) => html`<li>${item}</li>`);

// After (v1.1)
items().map((item) => html.for(item, item.id)`<li>${item}</li>`);
```

---

### Batched Updates

**Priority:** 🔵 Research  
**Effort:** L  
**Status:** Not Started

**Goal:** Batch multiple value updates to reduce re-renders.

**Current Behavior:**

```javascript
// Triggers 3 separate renders
firstName('John');
lastName('Doe');
age(30);
```

**Proposed Behavior:**

```javascript
batch(() => {
  firstName('John');
  lastName('Doe');
  age(30);
}); // Single render at end
```

**Research Questions:**

- Is this actually needed? (Most apps don't hit this)
- Does it complicate the mental model?
- Can we auto-batch like React 18?

**Decision:** Defer until user reports performance issues.

---

## v1.3 - Standard Schema Integration

### Props Validation

**Priority:** 🟢 Nice-to-Have  
**Effort:** M  
**Status:** Not Started

**Goal:** Validate `data-props` JSON against Standard Schema validators.

**API:**

```javascript
import { object, string, number } from 'valibot';

const propsSchema = object({
  userId: number(),
  name: string(),
});

register('UserCard', UserCard, { schema: propsSchema });

hydrate(); // Validates props, logs errors for invalid islands
```

**Benefits:**

- Catch invalid props at hydration time
- Better error messages
- Aligns with Standard Schema standard

**Trade-offs:**

- Adds runtime validation overhead
- Requires users to install validator library

---

## v2.0 - Tooling & Ecosystem

### DevTools Extension

**Priority:** 🟡 High  
**Effort:** L  
**Status:** Not Started

**Goal:** Browser extension for debugging reactivity.

**Features:**

- Visualize reactive dependency graph
- Track value changes over time
- Highlight components on page
- Show current run stack
- Performance profiling

**Tech Stack:**

- Chrome Extension API
- React DevTools as reference
- D3.js for dependency graph

**Tasks:**

- [ ] Design extension UI/UX
- [ ] Implement reactivity inspector
- [ ] Add component tree viewer
- [ ] Publish to Chrome Web Store
- [ ] Port to Firefox

---

### CLI Tool

**Priority:** 🟢 Nice-to-Have  
**Effort:** M  
**Status:** Not Started

**Goal:** `front` CLI for scaffolding and dev tasks.

**Commands:**

```bash
front create my-app          # Scaffold new project
front add component Counter  # Add component boilerplate
front dev                    # Dev server with live reload
front test                   # Run tests
front bundle                 # Bundle for production (optional)
```

**Benefits:**

- Faster onboarding for new users
- Consistent project structure
- Optional build pipeline for optimization

**Trade-offs:**

- Violates "zero build" philosophy
- Maintenance burden
- Feature creep risk

**Decision:** Community-driven. Only build if demanded.

---

## v2.1 - Advanced Features

### Server Actions Integration

**Priority:** 🔵 Research  
**Effort:** L  
**Status:** Not Started

**Goal:** First-class support for server actions (inspired by Next.js).

**Proposed API:**

```javascript
// Server defines action
export async function addTodo(text) {
  'use server';
  await db.todos.create({ text });
}

// Client calls it
import { addTodo } from './actions.js';

function TodoForm(props) {
  const submit = async (e) => {
    e.preventDefault();
    await addTodo(input());
  };

  return () => html`<form onsubmit=${submit}>...</form>`;
}
```

**Research Questions:**

- How to implement without build step?
- Security implications?
- Does this fit Islands Architecture?

**Decision:** Needs RFC (Request for Comments) discussion.

---

### Streaming SSR Support

**Priority:** 🔵 Research  
**Effort:** L  
**Status:** Not Started

**Goal:** Support streaming HTML with progressive hydration.

**Concept:**

```javascript
// Server streams HTML
<div data-island data-component="Slow" data-props="{}">
  <template data-fallback>Loading...</template>
</div>

// Client hydrates immediately with fallback, then replaces when ready
```

**Research Questions:**

- Is this valuable for Islands Architecture?
- How to handle async component initialization?
- Browser support for streaming?

**Decision:** Wait for user demand.

---

## Rejected Ideas

These ideas have been considered and **rejected** to maintain focus.

### ❌ Built-in Routing

**Why Rejected:** Routing is a server concern. front.js is for client hydration only.  
**Alternative:** Use server routing or lightweight client router like `navaid`.

### ❌ Animation Helpers

**Why Rejected:** Use CSS animations or Web Animations API. Keep library minimal.  
**Alternative:** Document patterns in wiki.

### ❌ Form Validation Library

**Why Rejected:** Many validation libraries exist. Standard Schema integration is enough.  
**Alternative:** Use Standard Schema validators (Valibot, Zod, ArkType).

### ❌ State Persistence (LocalStorage)

**Why Rejected:** User-space concern. Trivial to implement in components.  
**Alternative:** Document pattern in examples.

### ❌ Time Travel Debugging

**Why Rejected:** Too niche. Adds complexity to reactivity system.  
**Alternative:** Use `run()` to log value changes.

---

## Community Requests

Track feature requests from users here. Link to GitHub discussions/issues.

**Template:**

```markdown
### Feature Name

**Requested By:** @username (Issue #123)  
**Use Case:** Brief description  
**Status:** Under Review / Accepted / Rejected  
**Notes:** Discussion summary
```

_No requests yet. Add them as they come in._

---

## How to Contribute

Want to work on a roadmap item?

1. **Check Status** - Ensure item isn't already in progress
2. **Open Discussion** - Discuss approach in GitHub Discussions
3. **Get Approval** - Wait for maintainer approval before starting
4. **Submit PR** - Follow [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines

**Note:** Roadmap items are **not promises**. They may be deprioritized, rejected, or deferred based on user feedback and maintenance capacity.

---

## Review Schedule

This roadmap is reviewed:

- **Monthly** - Adjust priorities based on feedback
- **Quarterly** - Major version planning
- **Annually** - Long-term vision alignment

Last reviewed: 2025-12-06

---

## Summary

**Near-term (v1.1-1.3):**

- ✅ Focus on DX improvements (TypeScript, error messages)
- ✅ Small performance wins (keyed templates)
- ✅ Standard Schema alignment

**Long-term (v2.0+):**

- 🔬 Research advanced features (server actions, streaming)
- 🛠 Tooling (DevTools, CLI) if community demands
- ⚖️ Balance features with "minimal core" philosophy

**Philosophy:** Prefer user-space solutions over framework features. Grow conservatively.
