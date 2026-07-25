# Learn front.js

> **front.js is a teaching framework.** It's a small, tested, readable
> implementation of the ideas behind modern front-end frameworks — fine-grained
> reactivity (signals), Islands Architecture, and secure-by-default hydration —
> built so you can understand how they actually work, not just use them.

## Who this is for

You'll get the most out of these guides if you're one of:

- **The "I use React/Vue/Svelte but never understood what a _signal_ actually
  is" developer.** You can build UIs; you want the mental model underneath. The
  reactivity here is ~150 readable lines — small enough to hold in your head.
- **The platform-curious engineer.** You like understanding the browser and the
  web platform directly — ES modules, tagged templates, native events, new HTTP
  methods — rather than through layers of abstraction.
- **The security-minded builder.** You want to know why "no eval, JSON-only
  props, explicit registration" removes whole categories of attack, and what it
  costs you.
- **Someone evaluating the author's work.** This is a reference implementation
  and a portfolio piece; read the code and the guides together.

It is **not** a production framework and makes no stability guarantees. Learn
here; ship with [Solid](https://www.solidjs.com/),
[Preact](https://preactjs.com/), or [Astro](https://astro.build/).

## A learning path

Work through these in order the first time. Each says what you'll learn and what
it assumes.

### 1 · Orientation

- **[Getting Started](./getting-started.md)** — what front.js is, the three
  ideas it's built on, and the constraints it deliberately accepts.
  *Assumes:* HTML + JS basics.
- **[Quick Start](./quick-start.md)** — your first island: server HTML +
  `register` + `hydrate`, running in minutes.
  *Assumes:* Getting Started.

### 2 · The core idea: reactivity

- **[How the Reactivity Works](./how-reactivity-works.md)** — the heart of the
  project. A guided read of the signals engine: dependency tracking via a single
  `currentRun` variable, `val`/`run`/`calc`, error isolation, and the one
  limitation a production signals library solves that this one deliberately
  doesn't. **If you read one guide, read this one.**
  *Assumes:* Quick Start.
- **[Basics: Components & Hydration](./basics.md)** — how reactive state becomes
  DOM, and how server HTML gets "brought to life."
  *Assumes:* How the Reactivity Works.

### 3 · Working with the platform

- **[Template Tags vs Strings](./template-tags-vs-strings.md)** — why `html\`\``
  returns an object, not a string, and how that prevents XSS by construction.
- **[Security Model](./security.md)** — the threat model, and why each
  constraint (no eval, JSON props, name validation, zero-trust hydration) exists.
- **[The QUERY Method](./query-method.md)** — a "Platform First" deep dive: the
  new **RFC 10008** HTTP QUERY verb, why a *read with a request body* was the
  method the web was missing, and how an island fetches data with it.
  *Assumes:* Quick Start; comfort with `fetch`.

### 4 · Integrating & shipping

- **[Integrations](./integrations.md)** — using front.js alongside HTMX and
  other server-driven tools; lifecycle cleanup via `_front_dispose`.
- **[Troubleshooting](./troubleshooting.md)** — common mistakes and their fixes.

### 5 · Knowing the edges

- **[Reference: Limitations](../reference/limitations.md)** — where the model
  strains, and what to reach for instead.
- **[Reference: When to Use](../reference/when-to-use.md)** — the honest
  fit/no-fit checklist.

## How these guides are maintained

Every load-bearing factual claim in these guides — about the web platform,
standards, or how signals work — is checked against a primary source (an RFC, a
living standard, or the framework's own source code) before it's published.
Where a guide states a fact, it links the source. If we can't verify it, we
don't assert it.
