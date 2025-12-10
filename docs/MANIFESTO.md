# Manifesto

**What front.js stands for (and what it doesn't).**

This document exists to set clear expectations and prevent scope creep. front.js is intentionally minimal—if you need features beyond what's listed here, other excellent frameworks exist that can help.

---

## Server Functions / RPC

**Not supported:** Calling server functions directly from client components.

**Why:** This requires serialization of functions/closures across a trust boundary. That's the exact attack surface we're avoiding.

**Alternatives:** Make HTTP requests yourself. Use `fetch()`, or a lightweight RPC library like tRPC if you need type safety.

---

## Client-Side Routing

**Not supported:** Built-in routing, route guards, or navigation helpers.

**Why:** Routing is a server concern. front.js is for client hydration only.

**Alternatives:** Server-side routing, or a lightweight client router like `navaid` if you must.

---

## Global State Management

**Not supported:** Redux, Zustand, or any global state store.

**Why:** `val`/`run`/`calc` are enough for component-local state. Global state is a user-space concern.

**Alternatives:** Pass props down, or use `val` at module scope if you really need shared state.

---

## Component Libraries / UI Kits

**Not supported:** Material-UI, Chakra, or any component library integration.

**Why:** front.js is a framework, not an ecosystem. Write your own components.

**Alternatives:** Write components yourself, or copy-paste from component libraries and adapt them.

---

## Build Tool Integration

**Not supported:** Vite plugins, Webpack loaders, or any build-time magic.

**Why:** Zero build step is a core constraint. If you need a build step, use React.

**Alternatives:** Write HTML and JavaScript. That's it.

---

## JSX / TypeScript Compilation

**Not supported:** JSX syntax or TypeScript compilation.

**Why:** Tagged template literals are enough. TypeScript types can be generated from JSDoc (if someone wants to maintain that), but no compilation step.

**Alternatives:** Tagged template literals for templates. JSDoc for types (optional).

---

## Animation Helpers

**Not supported:** Built-in animation utilities or transition helpers.

**Why:** Use CSS animations or the Web Animations API. Keep the library minimal.

**Alternatives:** CSS `@keyframes`, `transition`, or the Web Animations API.

---

## Form Validation Library

**Not supported:** Built-in form validation or schema validation.

**Why:** Many validation libraries exist. Standard Schema integration (future) is enough.

**Alternatives:** Standard Schema validators (Valibot, Zod, ArkType) when we add that integration.

---

## State Persistence (LocalStorage)

**Not supported:** Built-in localStorage/sessionStorage helpers.

**Why:** Trivial to implement in components. Not framework concern.

**Alternatives:** Write it yourself. It's 3 lines of code.

---

## Time Travel Debugging

**Not supported:** Redux DevTools-style time travel or state snapshots.

**Why:** Too niche. Adds complexity to reactivity system.

**Alternatives:** Use `run()` to log value changes if you need debugging.

---

## Streaming SSR

**Not supported:** Progressive hydration or streaming HTML support.

**Why:** Islands Architecture doesn't need this. Server renders HTML, client hydrates. Done.

**Alternatives:** If you need streaming, use a framework designed for it (Next.js, Remix).

---

## Server Actions (Next.js-style)

**Not supported:** `'use server'` directives or automatic server action generation.

**Why:** Requires build step and serialization layer. Violates core constraints.

**Alternatives:** Make HTTP requests. Use tRPC if you need type-safe RPC.

---

## Automatic Code Splitting

**Not supported:** Automatic bundle splitting or lazy loading.

**Why:** No build step means no bundle analysis. Write smaller components if you need less code.

**Alternatives:** Write smaller components. Load them conditionally if needed.

---

## Hot Module Replacement (HMR)

**Not supported:** Development-time hot reloading.

**Why:** No build step means no HMR infrastructure. Refresh the page.

**Alternatives:** Refresh the page. It's fast enough.

---

## Why This Document Exists

Every feature request starts with "can you just add X?" This document explains our design philosophy _before_ you ask.

front.js is intentionally minimal. If you need more, React, Vue, and Svelte are excellent frameworks. front.js is for a specific use case: server-rendered apps with islands.

**If you're asking "can it do X?" and X isn't in the core API, the answer is probably "no, and it won't be."**

That's not a limitation—it's the design.

---

**See also:**

- [LIMITATIONS.md](./LIMITATIONS.md) — What front.js can't do (technical constraints)
- [WHEN-TO-USE-FRONT.md](./WHEN-TO-USE-FRONT.md) — When to use front.js (and when not to)
