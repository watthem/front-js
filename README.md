# frontjs

**The secure-by-default, islands-first micro-framework.**

[![NPM Version](https://img.shields.io/npm/v/@frontjs/core.svg)](https://www.npmjs.com/package/@frontjs/core)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![CI](https://github.com/frontjs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/frontjs/core/actions/workflows/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@frontjs/core)](https://bundlephobia.com/package/@frontjs/core)

**🌐 [Website](https://frontjs.dev)** | **📚 [Documentation](https://frontjs.dev/KB/)** | **💻 [Examples](https://frontjs.dev/examples/)**

> ### 📚 An educational reference implementation
>
> **front.js is a working, tested exploration of how browser reactivity and
> Islands Architecture work under the hood — built to be _read_, not depended
> on in production.** The entire reactivity engine is ~150 well-commented,
> DOM-free lines with 74 passing tests, and the whole runtime is **1.43 KB
> gzipped**. If you've ever wanted to understand how Solid, Preact Signals, or
> the TC39 Signals proposal actually work, this is a from-scratch implementation
> small enough to hold in your head.
>
> **New here? Follow the guided path → [Learn front.js](./website/docs/guides/README.md).**
> Or jump straight to the heart of it →
> [How the Reactivity Works](./website/docs/guides/how-reactivity-works.md), a
> walk through the engine that ends with the one limitation a production signals
> library solves and this one deliberately doesn't.
>
> It is not maintained as a production framework and makes no stability
> guarantees. Use it to learn; reach for [Solid](https://www.solidjs.com/),
> [Preact](https://preactjs.com/), or [Astro](https://astro.build/) to ship.
>
> _Author's note: this project grew out of several years of using Claude models
> as a patient tutor for how modern signal engines actually work. It's a place to
> think in public — so the docs are written to teach the next person the way I
> was taught._

## Table of Contents

- [Install](#install)
- [Hello World](#hello-world)
- [Why front.js?](#why-frontjs)
- [Core Concepts](#core-concepts)
  - [Values](#values)
  - [Components](#components)
  - [Hydration](#hydration)
  - [Lifecycle Cleanup](#lifecycle-cleanup)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Limitations](#limitations)
- [Security Model](#security-model)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Monorepo Structure

This repository is organized as a monorepo containing:

- **[@frontjs/core](./packages/core/)** - The runtime (<5KB) with Islands Architecture hydration
- **[@frontjs/actions](./packages/actions/)** - Type-safe command/RPC layer with Standard Schema validation

## Install

```bash
# Install the core runtime
npm install @frontjs/core uhtml

# Optional: Install actions for type-safe server communication
npm install @frontjs/actions
```

Or run it with no build step at all — the framework ships as plain ES modules.
Point an import map at the source (or your own copy) and load it directly:

```html
<script type="importmap">
  {
    "imports": {
      "@frontjs/core": "./packages/core/src/index.js",
      "uhtml": "https://esm.sh/uhtml@4.5.11"
    }
  }
</script>
```

## Hello World

**1. HTML** - Mark interactive areas with `data-island`:

Output your HTML with `data-island`, `data-component`, and `data-props`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <div data-island data-component="Counter" data-props='{"start": 10}'></div>

    <script type="importmap">
      {
        "imports": {
          "uhtml": "https://esm.sh/uhtml@4.5.11"
        }
      }
    </script>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

**2. JavaScript** - Register your component and hydrate:

```javascript
import { html, val, register, hydrate } from '@frontjs/core';

function Counter(props) {
  const count = val(props.start || 0);

  return () => html`
    <div>
      <button onclick=${() => count(count() - 1)}>-</button>
      <span>Count: ${count()}</span>
      <button onclick=${() => count(count() + 1)}>+</button>
    </div>
  `;
}

register('Counter', Counter);
hydrate();
```

### ⚠️ Important: html Tag vs Plain Template Literals

The `html` tag returns a **template object**, not a string:

```javascript
// ✅ CORRECT: Use html tag with render()
const template = html`<div>Hello</div>`;
render(container, template);

// ❌ WRONG: html tag with string API
element.innerHTML = html`<div>Hello</div>`; // Shows "[object Object]"

// ✅ CORRECT: Use plain template literal for strings
element.innerHTML = `<div>Hello</div>`;
```

📖 See [Template Tags vs Strings Guide](./website/docs/guides/template-tags-vs-strings.md) for details.

## Why front.js?

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![CI](https://github.com/frontjs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/frontjs/core/actions/workflows/ci.yml)

- 🏝 **Islands Architecture:** Hydrate only what needs interaction.
- 🔒 **Secure by Default:** Data flows via JSON only. No server closures.
- ⚡ **Tiny Runtime:** <5KB gzipped. No build step required.
- 🛡 **Sanitized Rendering:** Powered by `uhtml` to prevent XSS.
- 🎯 **Fine-Grained Reactivity:** Value-based state management (val/run/calc) with automatic dependency tracking.

> **Note:** Built in response to recent security concerns with React Server Components ([context](https://overreacted.io/a-chain-reaction/)).

## Core Concepts

### Values

Values are reactive primitives that track dependencies automatically:

```javascript
import { val, run } from '@frontjs/core';

const count = val(0);

// Read value
count(); // 0

// Update value
count(5); // Updates to 5, notifies subscribers

// Read without subscribing
count.peek(); // 5 (doesn't track dependency)

// Auto-track in runs
run(() => {
  console.log('Count changed:', count());
});
```

### Components

Components are functions that return render functions:

```javascript
function MyComponent(props) {
  const state = val(props.initialValue);

  return () => html` <div>Value: ${state()}</div> `;
}
```

### Hydration

Components are hydrated from server-rendered HTML:

```html
<div data-island data-component="MyComponent" data-props='{"initialValue": 42}'></div>
```

### Lifecycle Cleanup

Runs can clean up side effects like timers, event listeners, and subscriptions:

```javascript
function Timer(props) {
  const seconds = val(0);

  run(() => {
    const interval = setInterval(() => {
      seconds(seconds() + 1);
    }, 1000);

    // Cleanup when run re-executes or component disposes
    return () => clearInterval(interval);
  });

  return () => html`<div>Time: ${seconds()}s</div>`;
}
```

Components can be manually disposed via `container._front_dispose()` for cleanup when using frameworks like HTMX:

```javascript
// HTMX integration example
document.body.addEventListener('htmx:beforeSwap', (event) => {
  const island = event.detail.target.querySelector('[data-island]');
  if (island && island._front_dispose) {
    island._front_dispose(); // Runs cleanup functions
  }
});
```

## Examples

See the [`website/examples/`](./website/examples/) directory for complete working
examples — a calculator, a GitHub user lookup, an HTMX integration, and more.

To run them:

```bash
npx serve website
# Navigate to http://localhost:3000/examples/
```

## API Reference

The engine internals are documented in
[`docs/architecture/ENGINE.md`](./docs/architecture/ENGINE.md), and the guided
walkthrough lives in
[`website/docs/guides/how-reactivity-works.md`](./website/docs/guides/how-reactivity-works.md).

### Quick Reference

- **`val(initialValue)`** - Create reactive value
- **`run(fn)`** - Run code reactively
- **`calc(fn)`** - Create calculated (derived) value
- **`register(name, componentFn)`** - Register component
- **`hydrate(root?)`** - Hydrate islands in DOM
- **`html\`template\``** - Safe template literal (from uhtml)
- **`render(container, template)`** - Render template (from uhtml)

## Limitations

front.js is designed for server-rendered apps with Islands Architecture. For the
trade-offs and known constraints, see:

- [How the Reactivity Works → the dependency-cleanup limitation](./website/docs/guides/how-reactivity-works.md#the-honest-limitation-dependencies-are-never-pruned)
- [`tests/limitations.test.js`](./packages/core/tests/limitations.test.js) — executable documentation of the current edges
- [When to use front.js](./docs/strategy/WHEN-TO-USE-FRONT.md) and [when not to reach for React](./docs/strategy/WHEN-NOT-TO-USE-REACT.md)

## Security Model

`front.js` assumes the HTML is the Source of Truth.

- **No eval:** We never execute strings from the DOM.
- **Explicit Props:** Data must be serialized to JSON.
- **Strict Content:** `uhtml` escapes all values by default.
- **Component Validation:** Component names are validated (alphanumeric only).
- **Zero Trust:** Invalid islands are logged and skipped, never crash the app.

## Architecture

front.js follows the "Islands Architecture" pattern:

1. **Server renders HTML** with `data-island` markers
2. **Client hydrates** only interactive islands
3. **Data flows** via JSON in `data-props` attributes
4. **No magic** - explicit component registration

See [`docs/architecture/BLUEPRINT.md`](./docs/architecture/BLUEPRINT.md) for detailed architecture documentation.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Check bundle size
npm run size-check

# Run tests
npm test

# Format code
npm run format
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development guidelines.

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) for how to run the website and KB locally, and deployment instructions.

## License

ISC
