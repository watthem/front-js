# Troubleshooting Guide

Common issues and solutions when working with front.js.

## Table of Contents

1. [Navbar or Components Render Late](#navbar-or-components-render-late)
2. [Documentation Loads with Pre-rendered Content](#documentation-loads-with-pre-rendered-content)
3. [Template Tag Returns [object Object]](#template-tag-returns-object-object)
4. [Component Doesn't Update](#component-doesnt-update)
5. [Module Not Found Errors](#module-not-found-errors)
6. [Hydration Fails Silently](#hydration-fails-silently)

---

## Navbar or Components Render Late

**Problem:** Your navbar or critical UI elements appear with a delay, causing layout shift or "pop-in" effect.

**Example:**
```html
<!-- This causes delayed rendering -->
<div data-island data-component="NavBar" data-props='{...}'></div>
```

The navbar is empty until JavaScript hydrates, typically 200-500ms after page load.

**Why it happens:**
1. The `data-island` div is empty in server-rendered HTML
2. Component styles are inline in the render function (not preloaded)
3. Hydration waits for:
   - HTML parsing
   - JavaScript downloads (app.js, front.esm.js)
   - DOMContentLoaded event
   - Component execution

**Timeline:**
```
1. Browser paints empty <div data-island> → User sees blank space
2. JavaScript loads → Still nothing visible
3. DOMContentLoaded fires → Hydration starts
4. Component executes → HTML + inline styles injected
5. Finally rendered → Visual "jump" occurs
```

**Solution 1: Server-Render Critical UI (Recommended)**

For critical components like navbars, render minimal HTML in the server template:

```html
<!-- Server-rendered navbar structure -->
<nav class="navbar">
  <div class="navbar-content">
    <h1>front.js</h1>
    <ul class="nav-links">
      <li><a href="./">Home</a></li>
      <li><a href="./docs/">Docs</a></li>
      <li><a href="./examples/">Examples</a></li>
    </ul>
  </div>
</nav>

<!-- Hydrate for interactivity (mobile menu, active states) -->
<div
  data-island
  data-component="NavBarEnhancement"
  data-props='{...}'
  style="display: none;"
></div>
```

**Solution 2: Extract Styles to CSS File**

Move component styles from inline to external CSS:

```css
/* styles.css - Loads immediately */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 2rem;
  z-index: 100;
}
/* ... rest of navbar styles ... */
```

Then simplify the component:

```javascript
function NavBar(props) {
  const isOpen = val(false);

  return () => html`
    <nav class="navbar"> <!-- Styles already loaded -->
      <!-- Content -->
    </nav>
  `;
}
```

**Solution 3: Add Loading Skeleton**

Provide placeholder content while hydrating:

```html
<div data-island data-component="NavBar" data-props='{...}'>
  <!-- Skeleton (replaced on hydration) -->
  <nav class="navbar navbar-skeleton">
    <div class="skeleton-logo"></div>
    <div class="skeleton-nav"></div>
  </nav>
</div>
```

**Solution 4: Preload JavaScript**

Speed up JavaScript loading with resource hints:

```html
<head>
  <link rel="preload" href="./front.esm.js" as="script">
  <link rel="preload" href="./app.js" as="script">
  <link rel="preconnect" href="https://esm.sh" crossorigin>
</head>
```

**Best Practice:**

For **critical UI** (navbar, layout): Server-render HTML + extract styles to CSS
For **interactive widgets** (todo list, counter): Use islands as-is

---

## Documentation Loads with Pre-rendered Content

**Problem:** Documentation pages show a loading spinner until JavaScript hydrates and fetches markdown content.

**Solution:** Use **progressive enhancement** to pre-render critical content in the server HTML.

**How it works:**

The documentation site's MarkdownViewer component supports an `initialContent` prop for pre-rendered HTML:

```html
<div data-island data-component="MarkdownViewer"
     data-props='{"initialContent": "<h1>Quick Start</h1><p>...</p>"}'>
  <div class="markdown-viewer">
    <div class="markdown-content">
      <!-- Pre-rendered HTML visible immediately -->
      <h1>Quick Start</h1>
      <p>Get front.js running in 30 seconds.</p>
      <!-- ... rest of content ... -->
    </div>
  </div>
</div>
```

**Benefits:**
- ✅ Instant content visibility (no loading spinner)
- ✅ Better SEO (search engines see full content)
- ✅ Progressive enhancement (works without JS)
- ✅ Maintains hash routing for other docs (only default doc is pre-rendered)

**How to implement:**

1. **Generate pre-rendered HTML:**
```bash
node scripts/generate-initial-doc.js
```

This outputs:
- JSON-escaped HTML for `data-props` attribute
- Plain HTML for inserting into the island div

2. **Copy output to `index.html`:**

Option A - Use `data-props` (JSON):
```html
<div data-island data-component="MarkdownViewer"
     data-props='{"initialContent": "<h1>...</h1>"}'>
```

Option B - Use plain HTML in div:
```html
<div data-island data-component="MarkdownViewer" data-props='{}'>
  <div class="markdown-viewer">
    <div class="markdown-content">
      <h1>Quick Start</h1>
      <p>...</p>
    </div>
  </div>
</div>
```

3. **How the component handles it:**

```javascript
function MarkdownViewer(props) {
  const content = val(props.initialContent || '');
  const loading = val(!props.initialContent);  // Skip loading if content provided

  // If initialContent provided → use it, no spinner
  // If user navigates to other doc → fetch as before
}
```

**Zero-build philosophy:**

This script is **optional** - you don't have to use it:
- Site works fine without pre-rendering (loading spinner appears briefly)
- Pre-rendering is a progressive enhancement, not a requirement
- You can manually render HTML once and forget about it
- No build step required for the site to function

**Future direction:**

This pattern may evolve into **`@frontjs/docsjs`** - a build-free documentation tool for runtime markdown rendering.

**Pattern:** Apply this to any critical content that should be immediately visible (landing pages, hero sections, etc.).

---

## Template Tag Returns [object Object]

**Problem:** You see `[object Object]` instead of HTML when using the `html` template tag.

**Example:**
```javascript
// ❌ WRONG
element.innerHTML = html`<div>Hello</div>`;
// Result: "[object Object]"
```

**Why it happens:**
The `html` tag returns a **template object**, not a string. When coerced to string, it becomes `"[object Object]"`.

**Solution:**
Use plain template literals for string-based APIs:

```javascript
// ✅ CORRECT
element.innerHTML = `<div>Hello</div>`;
```

Or use the `html` tag with `render()`:

```javascript
// ✅ CORRECT
import { html, render } from '@frontjs/core';
render(element, html`<div>Hello</div>`);
```

**Rule of thumb:**
- `html` tag → Use with `render()` function
- Plain `` → Use with string APIs (innerHTML, insertAdjacentHTML)

**See also:** [Template Tags vs Strings Guide](#template-tags)

---

## Component Doesn't Update

**Problem:** You change a value but the UI doesn't re-render.

**Example:**
```javascript
function MyComponent(props) {
  const count = val(0);

  const increment = () => {
    count.peek() + 1; // ❌ WRONG - doesn't update
  };

  return () => html`
    <button onclick=${increment}>${count()}</button>
  `;
}
```

**Why it happens:**
- You're reading but not writing to the value
- You're using `.peek()` (non-reactive read)
- The value isn't being called in the render function

**Solutions:**

**1. Write to the value:**
```javascript
const increment = () => {
  count(count() + 1); // ✅ Correct
};
```

**2. Call the value in render:**
```javascript
return () => html`
  <div>${count()}</div> <!-- ✅ Subscribes to updates -->
`;
```

**3. Don't use .peek() for reactive updates:**
```javascript
// ❌ WRONG
const doubled = calc(() => count.peek() * 2); // Won't react to changes

// ✅ CORRECT
const doubled = calc(() => count() * 2); // Reacts to changes
```

---

## Module Not Found Errors

**Problem:** Browser console shows `Failed to resolve module specifier` or 404 errors.

**Example:**
```
Failed to resolve module specifier "@frontjs/core"
```

**Why it happens:**
Missing or incorrect import map configuration.

**Solution:**
Add an import map before your module scripts:

```html
<script type="importmap">
{
  "imports": {
    "@frontjs/core": "https://esm.sh/@frontjs/core@0.0.2",
    "uhtml": "https://esm.sh/uhtml@4.5.11"
  }
}
</script>

<script type="module" src="./app.js"></script>
```

**Common mistakes:**
- Import map after module scripts (must be before)
- Typo in package name
- Missing version number in CDN URL
- Using `require()` instead of `import` (ESM only)

---

## Hydration Fails Silently

**Problem:** Components don't hydrate, but no error appears in console.

**Why it happens:**
- Component name mismatch between HTML and registration
- Invalid JSON in `data-props`
- Component not registered before `hydrate()` call
- `data-island` attribute missing

**Solution 1: Check component name**
```html
<!-- HTML -->
<div data-island data-component="Counter" ...></div>
```

```javascript
// JavaScript - must match exactly (case-sensitive)
register('Counter', Counter); // ✅ Correct
register('counter', Counter); // ❌ Won't hydrate
```

**Solution 2: Validate JSON**
```html
<!-- ❌ WRONG - Single quotes in JSON -->
<div data-props="{'start': 10}"></div>

<!-- ✅ CORRECT - Double quotes -->
<div data-props='{"start": 10}'></div>
```

**Solution 3: Register before hydrate**
```javascript
// ✅ CORRECT order
register('Counter', Counter);
register('TodoList', TodoList);
hydrate(); // Now it can find components

// ❌ WRONG order
hydrate();
register('Counter', Counter); // Too late
```

**Solution 4: Enable debug logging**
```javascript
// Add before hydrate()
window.DEBUG_FRONT = true;
hydrate(); // Will log each island processed
```

---

## Getting Help

If you're still stuck:

1. **Check the examples** - See working code in [/examples/](/../examples/)
2. **Read the API docs** - Detailed references in [API section](#api-core)
3. **Open an issue** - [GitHub Issues](https://github.com/watthem/front-js/issues)
4. **Join discussions** - [GitHub Discussions](https://github.com/watthem/front-js/discussions)

---

**See also:**
- [Security Model](#security) - Understanding security boundaries
- [Limitations](#limitations) - Known constraints and trade-offs
- [Template Tags Guide](#template-tags) - html tag vs plain literals
