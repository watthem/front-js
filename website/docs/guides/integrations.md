# Integrations Guide

This guide explains how to use **front.js** with other frameworks and libraries, particularly those that swap or remove DOM content (like HTMX, Turbo, Alpine.js, etc.).

## Philosophy: Macro vs Micro

front.js follows the **"Micro Framework"** pattern — it operates on small, isolated islands of interactivity within a larger (mostly static) HTML document.

### Macro Frameworks
Libraries like **HTMX**, **Turbo**, and **Unpoly** are "macro" tools. They handle:
- Page navigation
- Form submissions
- Content swapping
- URL routing

These frameworks excel at **replacing large chunks of the DOM** with fresh HTML from the server.

### Micro Framework (front.js)
front.js operates **inside** the HTML that macro frameworks deliver:
- Hydrates specific `[data-island]` elements
- Manages fine-grained reactivity (val/run/calc)
- Handles local component state

### Why This Matters
When a macro framework swaps content, it can **remove DOM nodes that contain active front.js components**. If these components have timers, event listeners, or other side effects, they will leak memory unless properly cleaned up.

**The solution:** front.js provides a `_front_dispose` function on each island container that you can call before DOM removal.

---

## Integration Pattern: The Cleanup Hook

Every front.js island container has a `_front_dispose` function attached to it. This function:
1. Stops all reactive `run()` subscriptions
2. Executes any cleanup functions returned by runs (e.g., `clearInterval`, `removeEventListener`)
3. Prevents memory leaks

### Basic Pattern
```javascript
// Before removing/swapping a container with front.js islands:
if (container._front_dispose) {
  container._front_dispose();
}
```

### Why Cleanup Is Critical
Consider this component:
```javascript
function ServerMonitor(props) {
  const status = val('checking...');
  
  run(() => {
    const interval = setInterval(() => {
      fetch('/api/status')
        .then(r => r.json())
        .then(data => status(data.status));
    }, 5000);
    
    // Without this cleanup, the interval keeps running forever!
    return () => clearInterval(interval);
  });
  
  return () => html`<div>Status: ${status()}</div>`;
}
```

If the DOM node is removed (via HTMX swap, Turbo navigation, etc.) **without** calling `_front_dispose`, the `setInterval` continues running indefinitely, fetching data for a component that no longer exists.

---

## HTMX Integration

HTMX is a popular macro framework that swaps HTML via AJAX. To integrate with front.js:

### 1. Listen for HTMX's Cleanup Event
HTMX fires `htmx:beforeCleanup` before removing old content. This is your chance to dispose front.js islands.

```javascript
// Place this in your main app.js or a separate integration module
document.body.addEventListener('htmx:beforeCleanup', (event) => {
  const target = event.target;
  
  // Find all islands in the target
  const islands = target.querySelectorAll('[data-island]');
  islands.forEach((island) => {
    if (island._front_dispose) {
      island._front_dispose();
    }
  });
  
  // Also check if the target itself is an island
  if (target._front_dispose) {
    target._front_dispose();
  }
});
```

### 2. Re-hydrate After Swap
After HTMX swaps in new content, you need to hydrate any new islands:

```javascript
document.body.addEventListener('htmx:afterSwap', (event) => {
  // Re-hydrate islands in the new content
  hydrate();
});
```

### Complete HTMX Integration Example
```javascript
import { register, hydrate } from 'front';

// Register your components
register('Counter', Counter);
register('TodoList', TodoList);

// Cleanup before HTMX swaps
document.body.addEventListener('htmx:beforeCleanup', (event) => {
  const target = event.target;
  const islands = target.querySelectorAll('[data-island]');
  
  islands.forEach((island) => {
    if (island._front_dispose) island._front_dispose();
  });
  
  if (target._front_dispose) target._front_dispose();
});

// Re-hydrate after HTMX swaps
document.body.addEventListener('htmx:afterSwap', () => {
  hydrate();
});

// Initial hydration
hydrate();
```

### HTMX Events Reference
- `htmx:beforeCleanup` - Fired before old content is removed (**dispose here**)
- `htmx:afterSwap` - Fired after new content is inserted (**re-hydrate here**)
- `htmx:load` - Alternative to `afterSwap` for lazy-loaded content

---

## Turbo Integration

**Turbo** (from the Hotwire suite) uses similar concepts. It swaps page content during navigation.

### Cleanup Pattern
```javascript
document.addEventListener('turbo:before-cache', () => {
  // Dispose all islands before Turbo caches the page
  document.querySelectorAll('[data-island]').forEach((island) => {
    if (island._front_dispose) island._front_dispose();
  });
});

document.addEventListener('turbo:load', () => {
  // Re-hydrate after Turbo loads new content
  hydrate();
});
```

### Turbo Events Reference
- `turbo:before-cache` - Before page is cached (snapshot taken)
- `turbo:before-render` - Before new page renders
- `turbo:load` - After new page is loaded and rendered

---

## Alpine.js Integration

**Alpine.js** is a micro framework like front.js, but uses directives (`x-data`, `x-bind`, etc.). You can use both together, but typically you'd choose one.

If you need to use both:
- Use Alpine for declarative UI bindings (`x-show`, `x-bind`)
- Use front.js for fine-grained reactivity and component isolation

### Cleanup Pattern
If Alpine removes a subtree containing front.js islands, you'd need to manually dispose:

```javascript
// Before removing a subtree:
const subtree = document.getElementById('my-section');
subtree.querySelectorAll('[data-island]').forEach((island) => {
  if (island._front_dispose) island._front_dispose();
});
subtree.remove();
```

---

## Manual Disposal (No Framework)

If you're manually removing DOM nodes that contain front.js islands:

```javascript
function removeSection(containerId) {
  const container = document.getElementById(containerId);
  
  // 1. Dispose all islands
  container.querySelectorAll('[data-island]').forEach((island) => {
    if (island._front_dispose) island._front_dispose();
  });
  
  // 2. Now safe to remove from DOM
  container.remove();
}
```

---

## Testing Integration

When writing tests, you can manually trigger disposal:

```javascript
import { test, expect, beforeEach, afterEach } from 'vitest';
import { register, hydrate } from 'front';

let container;

beforeEach(() => {
  container = document.createElement('div');
  container.innerHTML = `
    <div data-island data-component="Timer" data-props="{}"></div>
  `;
  document.body.appendChild(container);
  hydrate();
});

afterEach(() => {
  // Cleanup to prevent leaks between tests
  container.querySelectorAll('[data-island]').forEach((island) => {
    if (island._front_dispose) island._front_dispose();
  });
  container.remove();
});

test('component updates correctly', () => {
  // Your test logic here
});
```

---

## Best Practices

### 1. Always Return Cleanup Functions
When using `run()` with side effects, always return a cleanup function:

```javascript
// ✅ Good: Returns cleanup
run(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(id);
});

// ❌ Bad: No cleanup (memory leak!)
run(() => {
  setInterval(() => console.log('tick'), 1000);
});
```

### 2. Use the "Active Flag" Pattern for Async Operations
When fetching data, use a flag to prevent race conditions:

```javascript
function UserProfile(props) {
  const user = val(null);
  
  run(() => {
    let active = true;
    
    fetch(`/api/users/${props.userId}`)
      .then(r => r.json())
      .then(data => {
        if (active) user(data); // Only update if still mounted
      });
    
    return () => { active = false; }; // Mark inactive on cleanup
  });
  
  return () => html`<div>${user()?.name || 'Loading...'}</div>`;
}
```

### 3. Test Cleanup in Development
Open DevTools Console and watch for cleanup logs. If you see timers still running after a swap, you have a leak.

```javascript
// Add logging to verify cleanup
run(() => {
  console.log('Timer started');
  const id = setInterval(() => console.log('tick'), 1000);
  
  return () => {
    console.log('Timer stopped'); // Should see this on swap
    clearInterval(id);
  };
});
```

### 4. Centralize Integration Logic
Create a dedicated integration module (e.g., `htmx-integration.js`) that handles all cleanup/re-hydration logic. Don't scatter event listeners across your codebase.

---

## Common Pitfalls

### Forgetting to Re-hydrate
After swapping content, you must call `hydrate()` again to initialize new islands:

```javascript
// ❌ Bad: Only cleanup, no re-hydration
htmx.on('htmx:beforeCleanup', cleanup);

// ✅ Good: Both cleanup AND re-hydration
htmx.on('htmx:beforeCleanup', cleanup);
htmx.on('htmx:afterSwap', () => hydrate());
```

### Calling Dispose Multiple Times
front.js handles this gracefully, but it's wasteful. Make sure your event listeners aren't duplicated:

```javascript
// ❌ Bad: Registers listener every time component mounts
export function MyComponent(props) {
  document.body.addEventListener('htmx:beforeCleanup', cleanup);
  // ...
}

// ✅ Good: Register once at app initialization
document.body.addEventListener('htmx:beforeCleanup', cleanup);
```

### Not Disposing Nested Islands
Make sure to traverse the entire subtree:

```javascript
// ✅ Good: Uses querySelectorAll to find all nested islands
target.querySelectorAll('[data-island]').forEach((island) => {
  if (island._front_dispose) island._front_dispose();
});
```

---

## Further Reading

- [HTMX Documentation](https://htmx.org/docs/)
- [Turbo Handbook](https://turbo.hotwired.dev/handbook/introduction)
- [Alpine.js Documentation](https://alpinejs.dev/)
- [Islands Architecture](https://jasonformat.com/islands-architecture/)

For questions or issues, open a discussion on [GitHub](https://github.com/watthem/front-js/discussions).
