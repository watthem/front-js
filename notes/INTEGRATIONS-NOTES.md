Here is the content for **`wiki/INTEGRATIONS.md`**.

I have structured it to be the definitive guide for "connecting the dots." It focuses heavily on the **HTMX** pattern because that is the most common use case, but it also solves the specific "Re-hydration" problems found in Turbo/Hotwire/Barba.js environments.

You can place this file in **`packages/docs/wiki/INTEGRATIONS.md`**.

-----

# Integrations Guide

**front.js plays well with others.**

Because front.js is built on native DOM primitives and standard events, it can coexist with almost any backend framework or frontend tool. This guide covers the most common integration patterns.

-----

## 1\. front.js 🖤 HTMX

This is arguably the "Holy Grail" stack for modern web development.

  * **HTMX** handles **Macro-Interactivity**: Server round-trips, database updates, and swapping large chunks of HTML.
  * **front.js** handles **Micro-Interactivity**: Instant feedback, toggles, optimistic UI, and client-side validation.

### The Challenge: DOM Thrashing

When HTMX swaps a part of the page, it destroys the old DOM nodes. If a `front.js` component was running on those nodes (e.g., a timer or event listener), it might leave a memory leak or "ghost" processes running in the background.

### The Solution: `_front_dispose`

`front.js` automatically attaches a `_front_dispose` method to every island container. We just need to tell HTMX to call it before it destroys an element.

**Global Cleanup Script:**
Add this once to your main JavaScript entry point:

```javascript
// Listen for HTMX cleaning up DOM elements
document.body.addEventListener('htmx:beforeCleanup', (event) => {
  const target = event.target;
  
  // 1. Check the element itself
  if (target._front_dispose) {
    target._front_dispose();
  }
  
  // 2. Check any children (nested islands)
  target.querySelectorAll('[data-island]').forEach(island => {
    if (island._front_dispose) {
      island._front_dispose();
    }
  });
});

// Re-hydrate new content after a swap
document.body.addEventListener('htmx:afterSwap', (event) => {
  // Only hydrate the new content to avoid re-initializing existing islands
  hydrate(event.target);
});
```

### Example: The Live Dashboard

Imagine a server monitor. HTMX refreshes the list every 10 seconds. front.js handles the "Uptime" ticker inside the card.

```html
<div hx-get="/servers" hx-trigger="every 10s">
  
  <div 
    data-island 
    data-component="UptimeTicker" 
    data-props='{"start": 1600}'
  ></div>

</div>
```

When HTMX replaces the inner HTML, the `htmx:beforeCleanup` listener fires, calls `_front_dispose()`, stopping the timer in `UptimeTicker`. Then `hydrate()` runs on the new HTML, starting a fresh timer.

-----

## 2\. Rails (Turbo), Laravel (Livewire), & Django (Unpoly)

These frameworks often use "Pjax" or "SPA-like" navigation (Turbo Drive, Swup, Barba.js), where the `<body>` is replaced without a full page reload.

### The Challenge: Hydration Timing

`front.js` normally runs on `DOMContentLoaded`. But in a Turbo/Hotwire app, `DOMContentLoaded` only fires once on the first visit. Subsequent navigations invoke custom events.

### The Solution: Event Listening

You need to trigger `hydrate()` on the framework-specific "load" event.

**Rails / Turbo:**

```javascript
import { hydrate } from 'front';

document.addEventListener('turbo:load', () => {
  hydrate();
});
```

**HTMX (Boost):**

```javascript
document.addEventListener('htmx:load', () => {
  hydrate();
});
```

**Barba.js:**

```javascript
barba.init({
  views: [{
    namespace: 'home',
    afterEnter(data) {
      hydrate(data.next.container);
    }
  }]
});
```

-----

## 3\. Astro

Astro is a static site generator that popularized the "Islands Architecture." While Astro has its own component system (React/Vue/Svelte), you can use `front.js` as a lighter alternative for simple islands.

### Implementation

Since there is no official `front.js` adapter for Astro (yet), use a `<script>` tag inside your `.astro` components.

**`src/components/Counter.astro`**

```astro
---
const { initialCount = 0 } = Astro.props;
---

<div 
  id="counter-island"
  data-island 
  data-component="Counter" 
  data-props={JSON.stringify({ count: initialCount })}
>
  <button disabled>-</button>
  <span>{initialCount}</span>
  <button disabled>+</button>
</div>

<script>
  import { html, val, register, hydrate } from 'front-js';

  function Counter(props) {
    const count = val(props.count);
    return () => html`
      <button onclick=${() => count(count() - 1)}>-</button>
      <span>${count()}</span>
      <button onclick=${() => count(count() + 1)}>+</button>
    `;
  }

  register('Counter', Counter);
  hydrate(document.getElementById('counter-island'));
</script>
```

-----

## 4\. Web Components (Custom Elements)

`front.js` can live *inside* a standard Web Component to manage its internal state.

```javascript
import { val, run, html, render } from 'front';

class FrontCounter extends HTMLElement {
  connectedCallback() {
    // 1. Create Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    
    // 2. Setup State
    const count = val(0);
    
    // 3. Define Render Loop
    // Note: We use 'run' manually here instead of 'defineComponent'
    this.dispose = run(() => {
      render(shadow, html`
        <style>:host { display: block; padding: 10px; border: 1px solid #ccc; }</style>
        <button onclick=${() => count(count() + 1)}>
          Clicks: ${count()}
        </button>
      `);
    });
  }

  disconnectedCallback() {
    // 4. Cleanup
    if (this.dispose) this.dispose();
  }
}

customElements.define('front-counter', FrontCounter);
```

-----

## Summary Table

| Technology | Integration Strategy | Key Pattern |
| :--- | :--- | :--- |
| **HTMX** | **Excellent** | `htmx:beforeCleanup` listener |
| **Rails/Turbo** | **Good** | Listen for `turbo:load` to hydrate |
| **Astro** | **Manual** | Inline `<script>` module |
| **React/Vue** | **Avoid** | Use their native state (don't mix paradigms) |
| **jQuery** | **Possible** | Treat jQuery as "Legacy," wrap it in `run()` |
