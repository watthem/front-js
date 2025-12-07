# front.js

**The secure-by-default, islands-first micro-framework.**

[![NPM Version](https://img.shields.io/npm/v/@watthem/front-js.svg)](https://www.npmjs.com/package/@watthem/front-js)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![CI](https://github.com/watthem/front-js/actions/workflows/ci.yml/badge.svg)](https://github.com/watthem/front-js/actions/workflows/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@watthem/front-js)](https://bundlephobia.com/package/@watthem/front-js)

**🌐 [Website](https://frontjs.dev)** | **📚 [Documentation](https://frontjs.dev/KB/)** | **💻 [Examples](https://frontjs.dev/examples/)**

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

## Install

```bash
npm install front-js
```

Or use directly via CDN:

```html
<script type="importmap">
{
  "imports": {
    "front-js": "https://esm.sh/front-js@0.0.1",
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
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <div 
    data-island 
    data-component="Counter" 
    data-props='{"start": 10}'
  ></div>

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
import { html, val, register, hydrate } from './src/index.js';

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

## Why front.js?

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![CI](https://github.com/watthem/front-js/actions/workflows/ci.yml/badge.svg)](https://github.com/watthem/front-js/actions/workflows/ci.yml)

* 🏝 **Islands Architecture:** Hydrate only what needs interaction.
* 🔒 **Secure by Default:** Data flows via JSON only. No server closures.
* ⚡ **Tiny Runtime:** <5KB gzipped. No build step required.
* 🛡 **Sanitized Rendering:** Powered by `uhtml` to prevent XSS.
* 🎯 **Fine-Grained Reactivity:** Value-based state management (val/run/calc) with automatic dependency tracking.

> **Note:** Built in response to recent security concerns with React Server Components ([context](https://overreacted.io/a-chain-reaction/)).

## Core Concepts

### Values

Values are reactive primitives that track dependencies automatically:

```javascript
import { val, run } from './src/index.js';

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
  
  return () => html`
    <div>Value: ${state()}</div>
  `;
}
```

### Hydration

Components are hydrated from server-rendered HTML:

```html
<div
  data-island
  data-component="MyComponent"
  data-props='{"initialValue": 42}'
></div>
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

See the [`examples/`](./examples/) directory for complete working examples, including a Todo app that demonstrates all framework features.

To run examples:

```bash
npx serve .
# Navigate to http://localhost:3000/examples/index.html
```

## API Reference

See [`wiki/API.md`](./wiki/API.md) for complete API documentation.

### Quick Reference

- **`val(initialValue)`** - Create reactive value
- **`run(fn)`** - Run code reactively
- **`calc(fn)`** - Create calculated (derived) value
- **`register(name, componentFn)`** - Register component
- **`hydrate(root?)`** - Hydrate islands in DOM
- **`html\`template\``** - Safe template literal (from uhtml)
- **`render(container, template)`** - Render template (from uhtml)

## Limitations

front.js is designed for server-rendered apps with Islands Architecture. See [`docs/LIMITATIONS.md`](./docs/LIMITATIONS.md) for:

- Known constraints and trade-offs
- When NOT to use front.js
- Performance considerations
- Workarounds for common issues

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

See [`docs/BLUEPRINT.md`](./docs/BLUEPRINT.md) for detailed architecture documentation.

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
