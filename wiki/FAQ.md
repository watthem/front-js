# Frequently Asked Questions

Common questions from developers who prefer server-side rendering but need client-side interactivity.

---

## "I hate JavaScript frameworks. Do I really need one?"

**Short answer:** No, you don't need a framework. You need a hydration library.

**Long answer:** Modern web applications require some JavaScript for interactivity. But you have two options:

1. **Full framework** (React, Vue, etc.) - 200KB+, build step, complex tooling
2. **Hydration library** (front.js) - 5KB, no build, works with your HTML

front.js doesn't replace your server-side rendering. It hydrates your server-rendered HTML with just enough JavaScript to make it interactive.

---

## "I prefer server-side rendering. Can I still use front.js?"

**Yes. That's exactly what front.js is designed for.**

front.js uses the **Islands Architecture** pattern:

- **Server renders HTML** (Rails, Django, PHP, whatever you use)
- **Client hydrates islands** (front.js makes specific parts interactive)

```html
<!-- Server renders this -->
<div 
  data-island 
  data-component="Counter" 
  data-props='{"start": 10}'
></div>
```

```javascript
// Client hydrates it (one small file)
register('Counter', (props) => {
  const count = val(props.start);
  return () => html`<button onclick=${() => count(count() + 1)}>
    Count: ${count()}
  </button>`;
});

hydrate(); // Finds all [data-island] and hydrates them
```

Your server stays in control. front.js just adds interactivity where you need it.

---

## "Do I need Node.js, npm, or a build step?"

**No. Zero build step required.**

front.js works with native ES Modules in the browser:

```html
<script type="module">
  import { val, register, hydrate } from '/js/front.js';
  // Your code here
</script>
```

No Webpack. No Vite. No `npm run build`. Just serve the file and import it.

---

## "How is this different from React/Vue/Angular?"

| Feature | React/Vue/Angular | front.js |
|---------|-------------------|----------|
| **Size** | 200KB+ | 5KB |
| **Build step** | Required | None |
| **Dependencies** | Many (node_modules) | One file (uhtml peer) |
| **Rendering** | Client-side (SPA) | Server-side (Islands) |
| **HTML** | JSX/SFC (compiled) | Native templates |
| **Philosophy** | "JavaScript-first" | "HTML-first" |

front.js is a **hydration library**, not a framework. It doesn't own your entire application—just the interactive parts.

---

## "I'm worried about security. Is this safe?"

**Yes. Security is front.js's top priority.**

1. **No `eval()`** - Never executes code from strings
2. **No `innerHTML`** - Uses uhtml's safe templating
3. **JSON-only props** - Props must be JSON-serializable (no functions)
4. **Component name validation** - Only alphanumeric names allowed
5. **XSS protection** - All template values are automatically escaped

```javascript
// ✅ Safe: JSON props
data-props='{"count": 5}'

// ❌ Rejected: Functions not allowed
data-props='{"handler": function(){}}' // JSON.parse fails
```

---

## "Do I need to learn a new templating language?"

**No. front.js uses standard JavaScript template literals.**

```javascript
// No JSX, no SFC, no special syntax
return () => html`
  <div>
    <h1>Hello, ${name()}</h1>
    <button onclick=${handleClick}>Click me</button>
  </div>
`;
```

If you know JavaScript, you already know how to write front.js templates.

---

## "What about state management? Do I need Redux?"

**No. front.js has built-in reactivity.**

```javascript
// Create a value
const count = val(0);

// Read it
count(); // 0

// Update it
count(5); // Updates to 5, notifies subscribers

// Derived values
const doubled = calc(() => count() * 2);

// Side effects
run(() => {
  console.log('Count is:', count()); // Auto-tracks dependencies
});
```

No Redux. No Zustand. No external state management needed.

---

## "Can I use this with Rails/Django/PHP?"

**Yes. front.js works with any server-side framework.**

The server just needs to render HTML with `data-island` attributes:

**Rails:**
```erb
<div data-island data-component="Counter" data-props='<%= {start: 10}.to_json %>'></div>
```

**Django:**
```django
<div data-island data-component="Counter" data-props='{{ props|safe }}'></div>
```

**PHP:**
```php
<div data-island data-component="Counter" data-props='<?= json_encode(['start' => 10]) ?>'></div>
```

The server renders HTML. front.js hydrates it. That's it.

---

## "What if I need to fetch data from an API?"

**Use `run()` with async/await:**

```javascript
run(() => {
  const userId = currentUserId();
  let active = true;

  (async () => {
    const res = await fetch(`/api/user/${userId}`);
    const data = await res.json();
    
    if (active) {
      userData(data); // Only update if still valid
    }
  })();

  return () => { active = false; }; // Cleanup cancels in-flight requests
});
```

This pattern handles race conditions and cleanup automatically.

---

## "Do I need TypeScript?"

**No. front.js is written in JavaScript.**

TypeScript definitions can be generated from JSDoc comments if you want type checking, but it's not required.

---

## "What about routing? Forms? Authentication?"

**front.js doesn't provide these. That's by design.**

front.js is a **hydration library**, not a full-stack framework. For routing, use:
- Server-side routing (your framework handles it)
- Or a lightweight router like [navaid](https://github.com/lukeed/navaid)

For forms, use native HTML forms with server-side handling, or enhance them with front.js for client-side validation.

front.js does **one thing well**: hydrates server-rendered HTML with client-side interactivity.

---

## "How do I test this?"

**Use Vitest (or any test runner) with jsdom:**

```javascript
import { val, run } from './src/core/reactivity.js';

test('value updates', () => {
  const count = val(0);
  count(5);
  expect(count()).toBe(5);
});
```

front.js is designed to be testable without a browser.

---

## "What browsers are supported?"

**Any browser that supports ES Modules** (all modern browsers).

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE11: ❌ (no ES Module support)

For older browsers, use a polyfill or stick with server-side rendering.

---

## "Can I use this in production?"

**Yes. front.js is production-ready.**

- ✅ Comprehensive test suite
- ✅ Security-first design
- ✅ Error handling and isolation
- ✅ Performance optimized (<5KB runtime)

The framework is designed for real applications, not just demos.

---

## "I'm still not convinced. Why not just use vanilla JavaScript?"

**You can. But front.js solves common problems:**

**Vanilla JS:**
```javascript
// Manual DOM updates
function updateCounter() {
  document.querySelector('.count').textContent = count;
  document.querySelector('.button').onclick = () => {
    count++;
    updateCounter(); // Don't forget to call this!
  };
}
```

**front.js:**
```javascript
// Automatic updates
const count = val(0);
run(() => {
  render(container, html`<button onclick=${() => count(count() + 1)}>
    Count: ${count()}
  </button>`);
});
```

front.js handles:
- ✅ Dependency tracking (no manual update calls)
- ✅ DOM diffing (efficient updates)
- ✅ Cleanup (memory leak prevention)
- ✅ Error isolation (one component failure doesn't break others)

If you're building more than a simple page, front.js saves you from writing this infrastructure yourself.

---

## "What's the catch?"

**There are trade-offs:**

1. **Not a full framework** - No routing, forms, or authentication built-in
2. **Islands only** - Not designed for full SPAs
3. **Small community** - Less Stack Overflow answers (but simpler codebase to understand)
4. **Server-rendering required** - Doesn't work for pure client-side apps

If you need a full SPA framework, use React/Vue. If you want server-rendered HTML with selective interactivity, front.js is perfect.

---

## "Where do I start?"

1. **Read the [API docs](./API.md)** - Understand the primitives
2. **Check the [examples](../examples/)** - See real code
3. **Try the Todo app** - Clone and run locally
4. **Build something small** - Add one interactive component to your existing app

front.js is designed to be learned in an afternoon, not a week.

---

## "I have more questions."

Check the other documentation:
- **[API Reference](./API.md)** - Complete API docs
- **[BLUEPRINT](../docs/BLUEPRINT.md)** - Architecture deep-dive
- **[STANDARDS](./STANDARDS.md)** - Design principles
- **[Translation Guide](./TRANSLATIONS.md)** - Coming from React?

Or open an issue on GitHub. We're here to help.
