# front.js

**The secure-by-default, islands-first micro-framework.**

`front.js` is a tiny (<5KB) glue layer that connects server-rendered HTML to client-side interactivity. It enforces the "Islands Architecture" to prevent data leakage and XSS vulnerabilities common in modern Server Component frameworks.

## Features

* 🏝 **Islands Architecture:** Hydrate only what needs interaction.
* 🔒 **Secure by Default:** Data flows via JSON only. No server closures.
* ⚡ **Tiny Runtime:** No build step required. Uses native ESM.
* 🛡 **Sanitized Rendering:** Powered by `uhtml` to prevent XSS.
* 🎯 **Fine-Grained Reactivity:** Value-based state management (val/run/calc) with automatic dependency tracking.

## Installation

Since `front.js` is designed to be zero-build, you can use it directly from source:

```bash
npm install front
```

Or use it directly via ESM import (no build step required).

## Quick Start

### 1. The Server (HTML)

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

### 2. The Client (JavaScript)

Register your component and hydrate.

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

## License

ISC