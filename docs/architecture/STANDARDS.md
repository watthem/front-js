# North Star Standards

**"Strong opinions, loosely held, strictly enforced interfaces."**

This document outlines the architectural standards and future-proofing strategies for `front.js`. It serves as the tie-breaker for technical disagreements and the roadmap for future integrations.

---

## 1. The "Headless Reactivity" Standard

**Insight:** Reactivity is an engine, not a UI feature.

We believe that state management should be decoupled from the DOM. Just as TanStack Query solved "Data Fetching" generically, our reactivity system treats the UI as just one of many possible side effects.

- **Standard:** Our `val` and `run` primitives must remain **DOM-agnostic**.
- **Compliance:** `core/reactivity.js` must never import `uhtml` or reference `window`/`document`.
- **Naming Philosophy:** We prioritize intuitive, action-oriented names (`val`, `run`, `calc`) that describe what the developer is doing, not how the system works internally. While the [TC39 Signals Proposal](https://github.com/tc39/proposal-signals) uses `signal` and `effect`, we believe "ruthless naming" that removes academic jargon better serves developers. If TC39 Signals becomes a standard, we can provide an adapter layer without changing our public API.

---

## 2. The Validation Standard (Standard Schema)

**Insight:** Libraries should not force dependencies. They should define interfaces.

We adhere to the [Standard Schema](https://standardschema.dev) specification. `front.js` does not ship with a validation library, but it relies heavily on validation for security (safe hydration).

- **Standard:** Any API in `front.js` that validates data (e.g., `props` parsing) must accept a Standard Schema compliant validator.
- **Implementation:**
  - We do not check for `instanceof ZodSchema`.
  - We check for the `~standard` property on the validator object.
- **Benefit:** Users can use Valibot (tiny), Zod (popular), or ArkType (fast) interchangeably.

**Example Usage (v0.0.1+):**

```javascript
import { object, string } from 'valibot'; // or zod or arktype
import { register, hydrate } from 'front.js';

// Define your schema with any Standard Schema-compliant validator
const propsSchema = object({
  id: string(),
  count: number(),
});

// Register component with optional schema validation
register('Counter', CounterComponent, {
  schema: propsSchema,
});

// Hydrate validates props before passing to component
await hydrate();
```

**Status:** ✅ Implemented in v0.0.1

- `register()` accepts optional `schema` in options parameter
- `hydrate()` validates props using `schema['~standard'].validate()`
- Supports both sync and async validation
- Failed validation aborts hydration for that island (fail-safe)
- Successful validation can transform props (e.g., string → Date)

---

## 3\. The "Islands" Security Standard

**Insight:** The boundary between Server and Client is the most dangerous line in web development.

- **Standard:** **Zero-Trust Hydration.**
- **Rule 1:** We never execute code from the DOM (No `eval`, `new Function`, or `innerHTML` of untrusted strings).
- **Rule 2:** Data is **Data**, never Code. We only accept JSON-serializable structures (Strings, Numbers, Booleans, Objects, Arrays). We strictly reject Functions or Symbols passed from the server.
- **Rule 3:** Hydration is explicit. We do not "guess" which components to load. The DOM must explicitly ask for a component via `data-component`.

---

## 4\. The "Platform First" Standard

**Insight:** Browsers are fast. Frameworks are slow.

If the browser has a native way to do it, we use it. We do not reinvent the wheel for the sake of "Developer Experience" (DX) if it harms "User Experience" (UX).

- **Templates:** We use Tagged Templates (\`html\`\`) instead of JSX compilers.
- **Events:** We use native `addEventListener` (via `uhtml`) instead of synthetic event systems.
- **Modules:** We use standard ES Modules (`import`/`export`) instead of requiring Webpack/Vite loaders.

---

## 5\. The "Zero Magic" Standard

**Insight:** Magic is fun until it breaks. Then it's a nightmare.

- **Standard:** All behavior must be traceable.
- **Anti-Pattern:** "Auto-importing" components based on file names.
- **Required Pattern:** Explicit `register('Name', Component)` calls.
- **Why:** This ensures that a developer reading `client.js` knows _exactly_ which components are included in the bundle, making the app auditable and secure.

---

## 6\. The "Constraints as Features" Standard

**Insight:** Limitations aren't bugs to fix—they're intentional design decisions.

front.js embraces constraints to maintain focus, security, and simplicity:

- **<5KB size budget** - Forces prioritization of essential features only
- **No build step** - Eliminates entire class of tooling complexity
- **Islands only** - Prevents scope creep into full SPA territory
- **Props are static** - Simplifies hydration, prevents server-client state sync issues
- **No routing** - Server handles routing; client handles interactivity

**Standard:** Before adding a feature, ask:

1. Does this violate a core constraint?
2. Can users solve this with composition instead?
3. Does this bloat the bundle size?

If the answer to any is "yes," reject the feature or document it as a user-space pattern.

**See Also:** [`LIMITATIONS.md`](../docs/LIMITATIONS.md) documents all constraints and trade-offs in detail.
