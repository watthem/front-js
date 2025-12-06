# Limitations Quick Reference

> This is a condensed summary. See [docs/LIMITATIONS.md](../docs/LIMITATIONS.md) for the full documentation.

---

## Top 5 Things to Know

### 1. **Nested Arrays Don't Render**
```javascript
// ❌ Doesn't work
canvas.map(row => row.map(cell => html`<div>${cell}</div>`))

// ✅ Flatten first
const flat = []; canvas.forEach(row => row.forEach(cell => flat.push(cell)));
flat.map(cell => html`<div>${cell}</div>`)
```

### 2. **Props Are Not Reactive**
Props from `data-props` are read once during hydration. Use `val()` for reactive state.

### 3. **No Parent-Child Prop Passing**
Use module-level `val()` or custom events for cross-component communication.

### 4. **Mutations Don't Trigger Updates**
```javascript
// ❌ Doesn't notify
items().push(newItem);

// ✅ Create new reference
items([...items(), newItem]);
```

### 5. **Async Reactivity Doesn't Auto-Track**
```javascript
// ❌ Won't re-run on userId change
run(async () => {
  const data = await fetch(`/api/${userId()}`);
});

// ✅ Read synchronously first
run(() => {
  const id = userId(); // Tracked
  (async () => {
    const data = await fetch(`/api/${id}`);
  })();
});
```

---

## What front.js Is NOT

- ❌ Not a full SPA framework (no routing)
- ❌ Not a build tool (no bundler/transpiler)
- ❌ Not a component library (no UI components)
- ❌ Not a server framework (no SSR runtime)

**front.js is a hydration library** for server-rendered HTML with Islands Architecture.

---

## When NOT to Use front.js

Don't use front.js if you need:
- Pure client-side apps (no SSR)
- Complex SPAs with client-side routing
- Real-time collaboration features
- Mobile apps (React Native/Capacitor)
- IE11 support

**Use React/Vue/Svelte instead.**

---

## Key Design Philosophy

> "Constraints as Features"

Limitations are **intentional design decisions** to keep front.js:
- 🎯 Focused (Islands only)
- 🔒 Secure (no eval/innerHTML)
- 📦 Tiny (<5KB)
- ⚡ Fast (no build step)

---

## Common Patterns & Workarounds

### Cross-Component Communication
```javascript
// Module-level shared state
export const sharedState = val(null);

// Component A
sharedState(someValue);

// Component B
const value = sharedState();
```

### Flattening 2D Arrays
```javascript
const flat = [];
grid.forEach((row, y) => {
  row.forEach((cell, x) => {
    flat.push({ cell, x, y });
  });
});
```

### Async Data Fetching
```javascript
run(() => {
  const id = userId(); // Track synchronously
  let active = true;
  
  (async () => {
    const data = await fetch(`/api/${id}`);
    if (active) result(data);
  })();
  
  return () => { active = false; }; // Cleanup
});
```

---

## Need More Detail?

📖 **[Full Documentation](../docs/LIMITATIONS.md)** - Complete limitations guide  
❓ **[FAQ](../wiki/FAQ.md)** - Common questions  
🏗️ **[STANDARDS](../wiki/STANDARDS.md)** - Design philosophy  
🔧 **[API Reference](../wiki/API.md)** - Complete API docs

---

**Remember:** These aren't bugs—they're intentional trade-offs that keep front.js focused, secure, and maintainable.
