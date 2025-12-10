# Getting Started with front.js

## What is front.js?

front.js is a <5KB micro-framework for building reactive web applications using the Islands Architecture pattern. It's secure-by-default, has zero build step, and uses fine-grained reactivity.

**Key Features:**
- 🏝 **Islands Architecture** - Hydrate only what needs interaction
- 🔒 **Secure by Default** - JSON-only data flow, no eval, no closures
- ⚡ **Tiny Runtime** - <5KB gzipped, hard size limit enforced in CI
- 🛡 **Sanitized Rendering** - Powered by uhtml to prevent XSS
- 🎯 **Fine-Grained Reactivity** - Automatic dependency tracking

## When to Use front.js

**December 2025** — React Server Components had a [CVSS 10.0 remote code execution vulnerability](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) (CVE-2025-55182). React patched it correctly. This isn't about blaming React—it's a reminder of a broader truth:

**Any system that serializes executable intent across a trust boundary expands its attack surface.**

This got us thinking: _what if we removed that category of risk entirely?_

### What front.js Refuses to Do

front.js is a <5KB hydration micro-framework that enforces Islands Architecture. Here's what it **won't** do:

- ❌ **No server functions** — You can't call server functions from the client. If you need server data, make an HTTP request yourself.
- ❌ **No function serialization** — Props are JSON only. No closures, no functions, no magic.
- ❌ **No build step** — Write HTML and JavaScript. That's it.
- ❌ **No virtual DOM** — Uses native DOM diffing via `uhtml`.
- ❌ **No automatic imports** — Explicit component registration only.
- ❌ **No JSX** — Tagged template literals only.

**Why these constraints?** Each one removes an attack vector. No serialization means the deserialization attack surface doesn't exist. JSON-only props means the client never sends executable intent. Explicit registration means component injection via the DOM is structurally impossible.

### Ideal Use Cases

✅ **Server-rendered apps** where most content is static HTML
✅ **Progressive enhancement** — Add interactivity to existing pages
✅ **Security-critical apps** where serialization attack surfaces are unacceptable
✅ **Performance-critical apps** where bundle size matters
✅ **Complementing frameworks** — Use front.js for specific islands in Next.js, Redwood, or other frameworks
✅ **Simple apps** that don't need React's full ecosystem

### When NOT to Use

❌ **SPAs** — If you need client-side routing, use React Router or similar
❌ **Complex state management** — No Redux, no Zustand. Just `val`/`run`/`calc`
❌ **Component libraries** — No Material-UI, no Chakra. Write your own
❌ **Server functions** — If you need RPC-style server calls, use React or tRPC
❌ **Build tool integration** — No Vite plugins, no Webpack loaders. It's just JavaScript

## Why Islands Architecture?

Islands Architecture is a pattern where:

1. **Server renders HTML** → Fast initial load, full content immediately visible
2. **Client hydrates only interactive parts** → Minimal JavaScript execution
3. **Static content stays static** → No unnecessary re-renders
4. **Progressive enhancement** → Works without JavaScript

**Example:** This documentation site uses Islands Architecture:
- **Static**: Sidebar navigation, markdown content, layout
- **Interactive**: Search modal (Cmd+K), mobile menu toggle

Only the search modal and mobile menu run JavaScript. The rest is plain HTML. This means:
- Fast page loads (most content renders immediately)
- Minimal bundle size (only interactive code ships)
- Better accessibility (works without JS)
- Improved SEO (search engines see full content)

## Understanding the Counter Example

Let's break down how a front.js component works using the counter from the [Quick Start](#quick-start):

**Server HTML:**
```html
<div data-island data-component="Counter" data-props='{"start": 10}'></div>
```

**Client JavaScript:**
```javascript
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

**What happens:**

1. **Server renders placeholder** - The empty `<div data-island>` waits for hydration
2. **Client finds islands** - `hydrate()` searches for all `[data-island]` elements
3. **Parse props** - JSON.parse the `data-props` attribute → `{start: 10}`
4. **Initialize component** - Call `Counter(props)` → creates reactive `count` value
5. **Render** - Execute render function → generates HTML with buttons
6. **Inject** - Replace island div with generated HTML
7. **React** - Changes to `count` automatically re-render

**Security flow:**
- Props are JSON only (no functions, no closures, no executable code)
- Component name validated (alphanumeric only)
- All HTML escaped by uhtml (XSS protection)
- No eval, no `new Function()`, no string-to-code execution

**Performance flow:**
- Hydration is selective (only marked islands, not entire page)
- Reactivity is fine-grained (only affected DOM nodes update)
- Bundle is tiny (<5KB + uhtml ~7KB = ~12KB total)

## Size + Security Guarantees

- **<5KB gzipped** — Hard limit enforced in CI
- **Zero runtime dependencies** — `uhtml` is a peer dependency, but front.js itself has none
- **No eval, no `new Function()`** — We never execute strings from the DOM
- **XSS protection by default** — `uhtml` escapes all values automatically
- **Component name validation** — Alphanumeric only. Injection via component names is structurally impossible
- **Graceful failure** — Invalid islands are logged and skipped. One bad island doesn't break the page

## Complementing, Not Replacing

front.js isn't here to replace React, Next.js, or any other tool. It's designed to complement them:

- **Next.js developers** can use front.js for specific islands that need minimal JavaScript
- **Redwood developers** can use front.js for lightweight interactive components
- **React developers** can use front.js for progressive enhancement of server-rendered pages

If you're building with Next.js or Redwood, you can absolutely use front.js for specific interactive islands while keeping your framework for routing, SSR, and the rest of your app.

## Next Steps

- **Ready to code?** → [Quick Start](#quick-start) - Get running in 30 seconds
- **Want to master it?** → [Basics](#basics) - Deep dive into val/run/calc and component patterns
- **Need examples?** → [Examples](/../examples/) - See real-world patterns
- **Questions?** → [FAQ](#faq) - Common questions answered
- **API reference?** → [Core API](#api-core) - Complete API documentation
- **Understand constraints?** → [Limitations](#limitations) - What front.js can't do
- **Design principles?** → [Manifesto](#manifesto) - Why we built it this way
