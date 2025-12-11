# HTMX + Front.js Integration Example

> **Status:** Placeholder for v0.0.3

This example will demonstrate:

- HTMX handling page navigation and content swapping
- Front.js managing island interactivity within HTMX-delivered HTML
- Proper cleanup on HTMX swaps (`htmx:beforeCleanup`)
- Re-hydration after HTMX swaps (`htmx:afterSwap`)
- Best practices for macro + micro framework integration

## How to run

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser to http://localhost:3000
```

## Files

- `server.js` - Server delivering HTML fragments
- `public/index.html` - Main page with HTMX
- `public/page1.html` - Example page fragment
- `public/page2.html` - Example page fragment
- `public/app.js` - Front.js components + HTMX integration

## Concepts Demonstrated

- HTMX event lifecycle integration
- Island cleanup before content swap
- Re-hydration after content swap
- Progressive enhancement pattern
- Macro framework (HTMX) + micro framework (Front.js) coordination

## Key Integration Points

```javascript
// Cleanup before HTMX swaps
document.body.addEventListener('htmx:beforeCleanup', (event) => {
  // Dispose all islands in swapped content
});

// Re-hydrate after HTMX swaps
document.body.addEventListener('htmx:afterSwap', () => {
  hydrate();
});
```

---

**TODO for v0.0.3:** Implement complete working example
