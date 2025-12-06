# Known Limitations

**Version:** 1.0  
**Date:** 2025-12-06

This document outlines the known limitations, constraints, and trade-offs of front.js. Understanding these helps set appropriate expectations and guides architectural decisions.

---

## 1. Template Rendering Limitations

### 1.1 Nested Arrays in Templates

**Issue:** uhtml cannot directly render nested arrays from `.map()` operations.

**Problem Code:**
```javascript
// ❌ This creates an array of arrays that uhtml can't render
return () => html`
  <div>
    ${canvas.map((row, y) => row.map((cell, x) => html`<div>${cell}</div>`))}
  </div>
`;
```

**Solution:**
```javascript
// ✅ Flatten first, then map
const flatCells = [];
canvas.forEach((row, y) => {
  row.forEach((cell, x) => {
    flatCells.push({ cell, x, y });
  });
});

return () => html`
  <div>
    ${flatCells.map(({ cell, x, y }) => html`<div>${cell}</div>`)}
  </div>
`;
```

**Why:** uhtml expects a flat array of templates, not nested structures. This is a limitation of the underlying template system, not front.js itself.

**Workaround:** Always flatten multi-dimensional data structures before rendering.

---

### 1.2 Multi-line Style Attributes

**Issue:** Template literals with multi-line style strings can cause parsing issues.

**Problem Code:**
```javascript
// ❌ May cause issues
return () => html`
  <div style="
    color: red;
    background: blue;
  ">Content</div>
`;
```

**Solution:**
```javascript
// ✅ Use single-line template strings
return () => html`
  <div style="color: ${color}; background: ${bg};">Content</div>
`;
```

**Why:** String interpolation in attributes works best with single-line strings to avoid whitespace issues.

---

## 2. Reactivity Limitations

### 2.1 Object Mutation Detection

**Issue:** Mutating objects or arrays in-place doesn't trigger updates.

**Problem Code:**
```javascript
const items = val([1, 2, 3]);

// ❌ Mutation doesn't trigger updates
items().push(4); // Doesn't notify subscribers
```

**Solution:**
```javascript
// ✅ Create new reference
items([...items(), 4]); // Notifies subscribers
```

**Why:** front.js uses shallow equality checks (like most reactive systems). Only new references trigger updates.

**Best Practice:** Always use immutable update patterns:
- Arrays: `[...arr, newItem]`, `arr.filter(...)`, `arr.map(...)`
- Objects: `{ ...obj, key: value }`

---

### 2.2 Async Reactivity

**Issue:** `run()` doesn't automatically track values read inside async functions.

**Problem Code:**
```javascript
run(async () => {
  const id = userId(); // ✅ Tracked
  const data = await fetch(`/api/${id}`); // ❌ userId() changes won't re-run this
  result(data);
});
```

**Solution:**
```javascript
run(() => {
  const id = userId(); // ✅ Tracked synchronously
  
  (async () => {
    const data = await fetch(`/api/${id}`);
    result(data);
  })();
});
```

**Why:** Dependency tracking is synchronous. Values read after an `await` are not tracked.

**Best Practice:** Read all reactive values synchronously at the top of the `run()`, then use them in async code.

---

### 2.3 Conditional Dependency Tracking

**Issue:** Dependencies are only tracked during execution, not conditionally.

**Example:**
```javascript
const showDetails = val(false);
const userId = val(1);

run(() => {
  if (showDetails()) {
    // userId is only tracked when showDetails is true
    console.log(userId());
  }
});

// Later: userId(2) won't re-run if showDetails() is false
```

**Why:** This is intentional and matches TC39 Signals behavior. Only values actually read are tracked.

**Not a Bug:** This is the expected behavior for fine-grained reactivity.

---

## 3. Component Architecture Limitations

### 3.1 Props Are Not Reactive

**Issue:** Component props are passed once during hydration and don't update.

**Example:**
```javascript
function Counter(props) {
  const count = val(props.start); // Only reads props.start once
  
  // If the server changes data-props later, this won't update
  return () => html`<div>${count()}</div>`;
}
```

**Why:** Islands Architecture assumes server-rendered HTML is static. Props are initial state only.

**Workaround:** If you need reactive props:
1. Use shared module-level `val()` for cross-component communication
2. Use `postMessage` or custom events for communication
3. Re-hydrate the island with new props (nuclear option)

**Design Decision:** This is by design. Props are for server→client initial data only.

---

### 3.2 No Parent-Child Communication Built-in

**Issue:** front.js doesn't provide parent-child prop passing like React.

**React Pattern (doesn't exist in front.js):**
```javascript
// ❌ Not supported
<ChildComponent parentValue={someValue} />
```

**Solution 1: Shared State**
```javascript
// Module-level shared state
export const sharedData = val(null);

// Parent component
function Parent(props) {
  sharedData(props.initialData);
  // ...
}

// Child component
function Child(props) {
  const data = sharedData(); // Access shared state
  // ...
}
```

**Solution 2: Custom Events**
```javascript
// Parent dispatches events
function Parent(props) {
  const notify = () => {
    document.dispatchEvent(new CustomEvent('data-update', { 
      detail: { value: someValue() } 
    }));
  };
  // ...
}

// Child listens
function Child(props) {
  run(() => {
    const handler = (e) => localValue(e.detail.value);
    document.addEventListener('data-update', handler);
    return () => document.removeEventListener('data-update', handler);
  });
  // ...
}
```

**Why:** front.js focuses on islands, not nested component trees. This is an intentional trade-off for simplicity.

---

### 3.3 No Built-in Routing

**Issue:** front.js doesn't provide client-side routing.

**Why:** This is by design. front.js is for server-rendered apps where the server handles routing.

**Solutions:**
1. **Server-side routing** (recommended) - Let your server framework handle routes
2. **Hash routing** - Use `window.location.hash` for client-side routing
3. **History API** - Use `pushState`/`popState` manually
4. **Lightweight router** - Use libraries like [navaid](https://github.com/lukeed/navaid)

**Not a Limitation:** This is an intentional non-feature. front.js hydrates server-rendered HTML; it doesn't replace server routing.

---

## 4. Performance Limitations

### 4.1 Large Lists Without Keys

**Issue:** Rendering large lists without stable keys can cause performance issues.

**Problem Code:**
```javascript
return () => html`
  <ul>
    ${items().map(item => html`<li>${item.name}</li>`)}
  </ul>
`;
```

**Issue:** uhtml uses order-based diffing. Inserting items at the start causes full re-render.

**Solution:**
```javascript
// ✅ Use keyed templates for large lists
import { html } from 'uhtml/keyed';

return () => html`
  <ul>
    ${items().map(item => html.for(item, item.id)`<li>${item.name}</li>`)}
  </ul>
`;
```

**Why:** Order-based diffing is simpler but slower for large, reorderable lists.

**Best Practice:** For lists >100 items or frequently reordered lists, use keyed templates.

---

### 4.2 Deep Nested Runs

**Issue:** Deeply nested `run()` calls can cause cascading updates.

**Problem Pattern:**
```javascript
// ❌ Can cause update storms
run(() => {
  run(() => {
    run(() => {
      // Too many nested runs
    });
  });
});
```

**Why:** Each `run()` subscribes to its dependencies. Nested runs can cause redundant re-executions.

**Best Practice:** Keep `run()` shallow. Use `calc()` for derived values instead of nested runs.

---

### 4.3 No Virtual Scrolling Built-in

**Issue:** Rendering 10,000+ DOM nodes will cause performance issues.

**Why:** front.js doesn't provide virtual scrolling/windowing out of the box.

**Solutions:**
1. **Pagination** - Render only visible items
2. **Virtual scrolling library** - Use [tanstack-virtual](https://github.com/TanStack/virtual) or similar
3. **Lazy loading** - Load items as needed

**Not a Bug:** This is expected. front.js is a hydration library, not a full framework with built-in performance optimizations.

---

## 5. Browser Compatibility Limitations

### 5.1 ES Module Support Required

**Requirement:** Browsers must support ES Modules (`import`/`export`).

**Supported:**
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+

**Not Supported:**
- Internet Explorer (all versions)
- Very old mobile browsers

**Workaround:** For older browsers, use server-side rendering only (no hydration) or polyfills.

---

### 5.2 Import Maps Support

**Issue:** Examples use import maps, which aren't supported in older browsers.

**Supported:**
- Chrome/Edge 89+
- Firefox 108+
- Safari 16.4+

**Workaround:** Use full URLs in imports:
```javascript
// Instead of import maps
import { html } from 'https://esm.sh/uhtml@4.5.11';
```

---

## 6. Security Limitations

### 6.1 No Built-in CSRF Protection

**Issue:** front.js doesn't provide CSRF tokens or protection.

**Why:** This is a server concern, not a client hydration concern.

**Solution:** Use your server framework's CSRF protection:
- Rails: `form_authenticity_token`
- Django: `{% csrf_token %}`
- Express: `csurf` middleware

---

### 6.2 No Built-in Content Security Policy

**Issue:** front.js doesn't enforce CSP headers.

**Why:** CSP is a server/HTTP header concern.

**Best Practice:** Configure CSP headers on your server:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://esm.sh
```

---

## 7. Developer Experience Limitations

### 7.1 No TypeScript Built-in

**Issue:** front.js is written in JavaScript, not TypeScript.

**Status:** TypeScript definitions can be generated from JSDoc comments.

**Workaround:** Use JSDoc for type hints:
```javascript
/**
 * @param {number} initialValue
 * @returns {{ (): number, (value: number): void }}
 */
function val(initialValue) { /* ... */ }
```

---

### 7.2 No DevTools Extension

**Issue:** No browser extension for debugging reactivity.

**Workaround:** Use `console.log` or `run()` for debugging:
```javascript
run(() => {
  console.log('Count changed:', count());
});
```

**Future:** A devtools extension could be built to visualize reactive dependencies.

---

### 7.3 No Hot Module Replacement (HMR)

**Issue:** No built-in HMR during development.

**Why:** front.js has no build step, so traditional HMR doesn't apply.

**Workaround:** Use `npx serve` and manual refresh, or set up a simple file watcher to reload the page.

---

## 8. Ecosystem Limitations

### 8.1 Small Community

**Reality:** front.js is new and has a smaller community than React/Vue.

**Implications:**
- Fewer Stack Overflow answers
- Fewer third-party component libraries
- More self-sufficiency required

**Advantages:**
- Simpler codebase (easier to understand internals)
- Less churn (fewer breaking changes)
- Direct access to maintainers

---

### 8.2 No Plugin Ecosystem

**Issue:** front.js doesn't have a plugin system.

**Why:** The framework is intentionally minimal.

**Philosophy:** Extend via composition, not plugins. Use native JavaScript and browser APIs.

---

## 9. What front.js Is NOT

To avoid disappointment, here's what front.js explicitly does **not** do:

### ❌ Not a Full SPA Framework
- No built-in routing
- No built-in state management beyond reactivity
- No built-in data fetching abstractions

### ❌ Not a Build Tool
- No bundler
- No transpiler
- No asset pipeline

### ❌ Not a Component Library
- No UI components
- No form validation library
- No animation helpers

### ❌ Not a Server Framework
- No SSR runtime
- No API routes
- No middleware system

---

## 10. Design Philosophy: Intentional Constraints

Many "limitations" are intentional design decisions:

1. **No Magic** - Explicit is better than implicit
2. **Platform First** - Use browser APIs, not abstractions
3. **Islands Only** - Not designed for full SPAs
4. **Server Truth** - HTML is the source of truth
5. **Minimal Core** - <5KB means trade-offs

If you need features beyond these constraints, front.js may not be the right tool. Consider:
- **React/Vue** - For full SPAs with complex state
- **Astro** - For static site generation with islands
- **HTMX** - For server-driven interactivity without JavaScript frameworks

---

## 11. When NOT to Use front.js

front.js is **not suitable** for:

1. **Pure client-side apps** - No server-side rendering
2. **Complex SPAs** - No routing, large state management needs
3. **Real-time collaboration** - No built-in WebSocket/sync primitives
4. **Mobile apps** - Not designed for React Native/Capacitor
5. **Legacy browser support** - Requires modern ES Modules

---

## 12. Future Improvements

Some limitations may be addressed in future versions:

- [ ] Better TypeScript support (generate .d.ts files)
- [ ] Keyed templates by default (switch to `uhtml/keyed`)
- [ ] DevTools browser extension
- [ ] Standard Schema validation for props
- [ ] Improved error messages with stack traces

---

## 13. Reporting Limitations

Found a limitation not listed here?

1. Check if it's a **bug** (unintended behavior) → [Open an Issue](https://github.com/your-org/front-js/issues)
2. Check if it's a **design constraint** (intentional) → [Start a Discussion](https://github.com/your-org/front-js/discussions)
3. Document workarounds → Submit a PR to this file

---

## Summary

front.js is a **focused tool** for a **specific use case**: hydrating server-rendered HTML with client-side interactivity. It prioritizes:

- ✅ Small size (<5KB)
- ✅ Security by default
- ✅ Zero build step
- ✅ Server-first architecture

Trade-offs include:
- ❌ Limited to Islands Architecture
- ❌ No full SPA features
- ❌ Smaller ecosystem
- ❌ Manual patterns for some common tasks

**Philosophy:** These aren't bugs to fix—they're intentional constraints that keep the library focused, secure, and maintainable.

If front.js's constraints align with your needs, it's a powerful tool. If not, that's okay—use the right tool for your use case.
