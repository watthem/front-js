# Quick Start

Get front.js running in 30 seconds.

## CDN (Fastest)

Create `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My First front.js App</title>
</head>
<body>
  <!-- 1. Mark the island -->
  <div
    data-island
    data-component="Counter"
    data-props='{"start": 0}'
  ></div>

  <!-- 2. Load dependencies -->
  <script type="importmap">
  {
    "imports": {
      "uhtml": "https://esm.sh/uhtml@4.5.11",
      "@frontjs/core": "https://esm.sh/@frontjs/core@0.0.2"
    }
  }
  </script>

  <!-- 3. Load your app -->
  <script type="module">
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
  </script>
</body>
</html>
```

**Open in browser** - Done! You have a working reactive counter.

## npm (For Projects)

```bash
npm install @frontjs/core uhtml
```

Create `app.js`:

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

Create `index.html`:

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

  <script type="module" src="./app.js"></script>
</body>
</html>
```

**Serve locally:**
```bash
npx serve .
# Visit http://localhost:3000
```

## What's Next?

- **Want context?** → [Getting Started](#getting-started) - Learn what front.js is and when to use it
- **Ready to go deep?** → [Basics](#basics) - Master val/run/calc and component patterns
- **Need examples?** → [Examples](/../examples/) - See real-world patterns
- **API reference?** → [Core API](#api-core) - Complete API documentation
