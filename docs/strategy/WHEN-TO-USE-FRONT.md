# When to Use front.js

**December 2025** — React Server Components had a [CVSS 10.0 remote code execution vulnerability](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) (CVE-2025-55182). React patched it correctly. This isn't about blaming React—it's a reminder of a broader truth:

**Any system that serializes executable intent across a trust boundary expands its attack surface.**

React Server Components deserialize payloads sent to Server Function endpoints. That deserialization layer is where the vulnerability lived. The more magic you have, the more ways it can break.

This got us thinking: _what if we removed that category of risk entirely?_

## Libraries vs Frameworks: A Quick Distinction

Before we dive in, let's clarify the landscape:

- **Libraries** (React, Vue, Svelte): UI rendering primitives you compose into your app
- **Frameworks** (Next.js, Redwood, Remix): Full-stack solutions with routing, data fetching, build tools, and more

front.js is a **micro-framework for hydration**—it's designed to complement, not replace, these tools. If you're building with Next.js or Redwood, you can absolutely use front.js for specific interactive islands while keeping your framework for routing, SSR, and the rest of your app.

## What front.js Refuses to Do

front.js is a <5KB hydration micro-framework that enforces Islands Architecture. Here's what it **won't** do:

- ❌ **No server functions** — You can't call server functions from the client. If you need server data, make an HTTP request yourself.
- ❌ **No function serialization** — Props are JSON only. No closures, no functions, no magic.
- ❌ **No build step** — Write HTML and JavaScript. That's it.
- ❌ **No virtual DOM** — Uses native DOM diffing via `uhtml`.
- ❌ **No automatic imports** — Explicit component registration only.
- ❌ **No JSX** — Tagged template literals only.

**Why these constraints?** Each one removes an attack vector. No serialization means the deserialization attack surface doesn't exist. JSON-only props means the client never sends executable intent. Explicit registration means component injection via the DOM is structurally impossible.

## A Tiny Example

**Server renders HTML:**

```html
<div data-island data-component="Counter" data-props='{"start": 10}'></div>
```

**Client hydrates:**

```javascript
import { html, val, register, hydrate } from 'front';

function Counter(props) {
  const count = val(props.start || 0);

  return () => html`
    <button onclick=${() => count(count() - 1)}>-</button>
    <span>${count()}</span>
    <button onclick=${() => count(count() + 1)}>+</button>
  `;
}

register('Counter', Counter);
hydrate();
```

That's it. No build step. No bundler. No serialization layer. Just HTML + JavaScript.

## Size + Security Guarantees

- **<5KB gzipped** — Hard limit enforced in CI.
- **Zero runtime dependencies** — `uhtml` is a peer dependency, but front.js itself has none.
- **No eval, no `new Function()`** — We never execute strings from the DOM.
- **XSS protection by default** — `uhtml` escapes all values automatically.
- **Component name validation** — Alphanumeric only. Injection via component names is structurally impossible.
- **Graceful failure** — Invalid islands are logged and skipped. One bad island doesn't break the page.

## When to Use front.js

✅ **Server-rendered apps** where most content is static HTML  
✅ **Progressive enhancement** — Add interactivity to existing pages  
✅ **Security-critical apps** where serialization attack surfaces are unacceptable  
✅ **Performance-critical apps** where bundle size matters  
✅ **Complementing frameworks** — Use front.js for specific islands in Next.js, Redwood, or other frameworks  
✅ **Simple apps** that don't need React's full ecosystem

## When NOT to Use front.js

❌ **SPAs** — If you need client-side routing, use React Router or similar  
❌ **Complex state management** — No Redux, no Zustand. Just `val`/`run`/`calc`  
❌ **Component libraries** — No Material-UI, no Chakra. Write your own  
❌ **Server functions** — If you need RPC-style server calls, use React or tRPC  
❌ **Build tool integration** — No Vite plugins, no Webpack loaders. It's just JavaScript

## When NOT to Use React (the Library)

If you're building a server-rendered app where most of your page is static HTML with a few interactive islands, React's full complexity might be more than you need. For these cases, you probably don't need:

- Function serialization
- Server/client component boundaries
- A 200KB+ JavaScript bundle
- Complex build-time optimizations

You need:

- Server-rendered HTML
- A few interactive islands
- Fast page loads
- A smaller attack surface

front.js gives you that. Nothing more, nothing less.

## When NOT to Use a Framework (Next.js, Redwood, etc.)

Frameworks like Next.js and Redwood are excellent for full-stack applications with complex routing, data fetching, and build optimizations. But if you're building:

- A simple blog or marketing site
- A static site with a few interactive components
- An app where you want to control every aspect of your stack

You might not need a full framework. In these cases, front.js can handle the hydration while you handle routing and data fetching however you prefer.

## Complementing, Not Replacing

front.js isn't here to replace React, Next.js, or any other tool. It's designed to complement them:

- **Next.js developers** can use front.js for specific islands that need minimal JavaScript
- **Redwood developers** can use front.js for lightweight interactive components
- **React developers** can use front.js for progressive enhancement of server-rendered pages

The goal is to give you options, not to force a choice.

## Try It

```bash
npm install front
```

No build step. No config. Just HTML + JavaScript.

See [examples/](../examples/) for working demos.

---

**Questions?** Check [LIMITATIONS.md](./LIMITATIONS.md) for what front.js can't do, or [MANIFESTO.md](./MANIFESTO.md) for our design principles.
