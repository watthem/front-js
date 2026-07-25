# The QUERY Method

> **Platform First.** front.js has no data-fetching layer of its own — an island
> that needs server data just makes an HTTP request. So the *right HTTP verb* is
> part of the framework's story. In 2026 the web finally got the verb that reads
> were missing: **QUERY**, standardized as
> [RFC 10008](https://datatracker.ietf.org/doc/rfc10008/).

## The problem QUERY solves

For decades the web had two shapes of request and neither fit "run a read whose
input is complex":

| Verb | Safe? | Idempotent? | Has a body? | The catch |
| ---- | ----- | ----------- | ----------- | --------- |
| `GET`  | ✅ | ✅ | ❌ (in practice) | Input goes in the URL — length limits, and your query lands in server logs, browser history, and `Referer` headers. |
| `POST` | ❌ | ❌ | ✅ | You get a body, but you've told every cache and client "this changes state," so nothing may retry or cache it. |

A faceted search, a GraphQL-style query, a geo bounding-box lookup — these are
**reads** (no side effects, safe to retry) whose **input doesn't fit in a URL**.
Jamming them into `GET` blows past URL limits and leaks data; sending them as
`POST` lies about their semantics.

## What QUERY is

> "A QUERY request asks the target to process the enclosed content in a safe and
> idempotent manner and respond with the result." — [RFC 10008](https://datatracker.ietf.org/doc/rfc10008/)

QUERY is **GET's semantics with POST's body**:

- **Safe** — no side effects. Prefetchers and crawlers may issue it.
- **Idempotent** — retrying is harmless. A dropped connection can be retried
  without the "did my POST go through twice?" anxiety.
- **Body-carrying** — the query goes in the request body, so there are no URL
  length limits and sensitive parameters stay out of URLs, logs, and history.

It was published in **June 2026** on the IETF Standards Track (a Proposed
Standard), authored by J. Reschke, J. M. Snell, and M. Bishop. Older articles
call it "a draft" — that's out of date; it's an RFC now.

## Calling QUERY from an island

Because front.js leaves fetching to you, a QUERY request is just `fetch`. Here's
a search island — server-rendered markup hydrated into a live component that
QUERYs an endpoint as you type:

```html
<!-- Server-rendered -->
<div data-island data-component="Search" data-props='{"endpoint": "/api/search"}'></div>
```

```javascript
import { html, val, register, hydrate } from '@frontjs/core';

function Search({ endpoint }) {
  const term = val('');
  const results = val([]);
  const status = val('idle');

  async function runQuery(q) {
    status('loading');
    try {
      const res = await fetch(endpoint, {
        method: 'QUERY', // ← uppercase matters — see the gotcha below
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, limit: 20, filters: { inStock: true } }),
      });
      results(await res.json());
      status('idle');
    } catch {
      status('error');
    }
  }

  return () => html`
    <input
      placeholder="Search…"
      .value=${term()}
      oninput=${(e) => {
        term(e.target.value);
        runQuery(e.target.value);
      }}
    />
    ${status() === 'loading' ? html`<p>Searching…</p>` : null}
    <ul>
      ${results().map((r) => html`<li>${r.title}</li>`)}
    </ul>
  `;
}

register('Search', Search);
hydrate();
```

The query — the term, the limit, the filters — travels in the **body** as JSON.
No `?q=...&limit=20&filters=...` in the URL, no truncation on a long query, and
nothing sensitive in the server's access log.

## Three gotchas the browser won't warn you about

These are the details that bite people. Each is verified against the
[WHATWG Fetch Standard](https://fetch.spec.whatwg.org/).

1. **Uppercase `'QUERY'` — always.** `fetch` case-normalizes only a fixed set of
   methods (`DELETE, GET, HEAD, OPTIONS, POST, PUT`). `QUERY` is **not** on that
   list, so whatever string you pass is sent **verbatim**. Write `'query'` and a
   case-sensitive server will reject it with `405`/`501`. Write `'QUERY'`.

2. **Cross-origin QUERY is always preflighted.** QUERY is not a CORS-safelisted
   method (only `GET`, `HEAD`, `POST` are). A cross-origin QUERY triggers an
   `OPTIONS` preflight; the server must respond with
   `Access-Control-Allow-Methods: QUERY` or the browser blocks it. Same-origin
   requests (the common island case) don't preflight.

3. **The server has to actually implement it.** `fetch` will happily send a
   QUERY request, but a framework/proxy that doesn't recognize the method will
   404 or 501. Check your server, CDN, and any reverse proxy in front of it.

## Where this is headed in front.js

The [`@frontjs/actions`](../../../packages/actions/) package is a typed
command/RPC layer. Conceptually, **commands** (writes) map to `POST` and
**queries** (reads) map naturally to `QUERY` — a read with a typed,
schema-validated input body is exactly what QUERY was standardized for. That
alignment is a design direction, not a shipped feature yet; this guide teaches
the platform verb so the mapping is obvious when it lands.

## Status & caveats

- **Standard:** RFC 10008, Proposed Standard, June 2026. Stable to build on.
- **Browsers:** `fetch()` can send QUERY today (it's not a forbidden method).
  End-to-end support depends on your **server** and any intermediaries.
- **Live demo:** try it — **[The QUERY Method, live](../../examples/query-method.html)**.
  A front.js island sends a real `QUERY` request; a Service Worker answers it, so
  there's no backend. Open DevTools → Network and watch the `QUERY` method go
  out. (Verified end-to-end: the worker receives the method verbatim as `QUERY`.)

## Sources

- [RFC 10008 — The HTTP QUERY Method](https://datatracker.ietf.org/doc/rfc10008/)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/) (method normalization,
  forbidden methods, CORS-safelisted methods)
