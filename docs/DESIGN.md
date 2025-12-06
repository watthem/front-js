Do not build explicit `onMount` or `onCleanup` hooks as separate registry functions. Instead, **derive them from `run`**.

This is how React `useEffect` and the [TC39 Signals Proposal](https://github.com/tc39/proposal-signals) work. It keeps your API surface tiny and your mental model consistent.

### The Recommendation: Option 4 (Run-Based Lifecycle)

We modify our `run` primitive to accept a **cleanup function** as a return value.

1.  **Mounting:** The run executes immediately.
2.  **Updating:** Before re-executing, the _previous_ cleanup function runs.
3.  **Unmounting:** When the component scope is destroyed (we add a `dispose` method), the final cleanup runs.

This gives you **Option 2 (Full Lifecycle)** power with **Option 1 (Simplicity)** implementation cost.

---

### Why this is better for `front.js`

1.  **Zero API Bloat:** You don't need to export `onMount` or `onCleanup`. You just export `run`.
2.  **Correctness:** It forces developers to keep setup and cleanup logic together (colocation), which reduces bugs with event listeners.
3.  **Standards Aligned:** This is the direction the industry is moving (Standards compliant).

---

### The Implementation Plan

We need to make two small tweaks to your codebase.

#### 1\. Update `core/reactivity.js`

We need to track the `cleanup` function returned by the user's callback.

```javascript
// src/core/reactivity.js

export function run(fn) {
  let cleanup; // <--- Track the cleanup function here

  const wrapper = () => {
    // 1. Run previous cleanup if it exists
    if (cleanup) cleanup();

    const prevRun = currentRun;
    currentRun = wrapper;
    try {
      // 2. Execute function and capture NEW cleanup
      cleanup = fn();
    } finally {
      currentRun = prevRun;
    }
  };

  wrapper();

  // 3. Return a disposer so the system can kill it manually
  return () => {
    if (cleanup) cleanup();
  };
}
```

#### 2\. Update `core/component.js`

We need to capture the `dispose` function returned by `run` and expose it. This solves the "HTMX Problem" (swapping out an island without refreshing the page).

```javascript
// src/core/component.js
import { render } from 'uhtml';
import { run } from './reactivity.js';

export function defineComponent(renderFn, container) {
  // We capture the run disposer
  const dispose = run(() => {
    const template = renderFn();
    render(container, template);
  });

  // We attach it to the container for manual cleanup (e.g., by HTMX or tests)
  container._front_dispose = dispose;

  return dispose;
}
```

### How the Developer Uses It

They don't need a special hook. They just use `run`.

```javascript
// Inside a component
run(() => {
  // --- MOUNT Logic ---
  const handler = (e) => console.log('Key pressed:', e.key);
  window.addEventListener('keydown', handler);

  // --- CLEANUP Logic (Return function) ---
  return () => {
    console.log('Cleaning up listener...');
    window.removeEventListener('keydown', handler);
  };
});
```

### The "Islands" Reality Check

In an Islands Architecture, **true unmounting is rare**.

- **MPA (Multi-Page App):** The user clicks a link, the browser dumps the whole memory. Cleanup is irrelevant.
- **HTMX / Turbo:** The HTML is swapped. The browser kills the DOM, but the JS variables (values) might linger in memory if we aren't careful.

By attaching `container._front_dispose`, we allow advanced users (or a future `htmx` plugin) to clean up memory explicitly:

```javascript
// Example: HTMX cleanup integration
document.body.addEventListener('htmx:beforeSwap', (event) => {
  const island = event.detail.target.querySelector('[data-island]');
  if (island && island._front_dispose) {
    island._front_dispose(); // Runs the run cleanup!
  }
});
```
