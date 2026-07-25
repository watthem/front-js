import { html } from 'uhtml';
import { val, run, register, hydrate } from '../front.esm.js';

/**
 * QueryDemo — an island that fetches data with the HTTP QUERY method (RFC 10008).
 *
 * The query (search term + filters) travels in the request BODY, not the URL.
 * A Service Worker (query-sw.js) answers the request, so it's a real QUERY going
 * over the wire — open DevTools → Network and watch for the "QUERY" method.
 *
 * Teaching patterns on display:
 *  - fetch with `method: 'QUERY'` (uppercase — fetch won't normalize it)
 *  - reactive re-query via run() when the term or filter changes
 *  - the "active flag" cleanup pattern to ignore stale responses when typing fast
 */
function QueryDemo({ endpoint }) {
  const term = val('http');
  const standardsOnly = val(false);
  const results = val([]);
  const status = val('idle'); // 'idle' | 'loading' | 'error'
  const wire = val(null); // last request/response, for the inspector panel

  // True once a Service Worker controls this page (so our endpoint is answerable).
  const controlled = val(Boolean(navigator.serviceWorker && navigator.serviceWorker.controller));

  // Re-run whenever the term or the filter changes.
  run(() => {
    const q = term();
    const only = standardsOnly();
    if (!controlled()) return; // wait until the SW is in control

    let active = true;
    status('loading');

    const requestBody = { q, filters: { standardsOnly: only }, limit: 20 };

    (async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'QUERY', // ← the whole point. Uppercase matters.
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const data = await res.json();
        if (!active) return; // a newer keystroke superseded this request

        results(data.results || []);
        wire({
          sentMethod: 'QUERY',
          requestBody,
          httpStatus: res.status,
          observedMethod: data.observedMethod, // what the SW actually received
        });
        status('idle');
      } catch (err) {
        if (active) status('error');
      }
    })();

    // Cleanup: invalidate this request if the inputs change before it resolves.
    return () => {
      active = false;
    };
  });

  return () => html`
    ${!controlled()
      ? html`<div class="notice">
          ⚙️ Starting the Service Worker… if this doesn't clear, this demo needs to
          be served over <code>http(s)</code> (e.g. <code>npx serve website</code>),
          not opened as a <code>file://</code> URL.
        </div>`
      : null}

    <div class="query-panel">
      <label class="field">
        <span>Search the platform catalog</span>
        <input
          type="search"
          placeholder="try: http, signal, module…"
          .value=${term()}
          oninput=${(e) => term(e.target.value)}
        />
      </label>

      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${standardsOnly()}
          onchange=${(e) => standardsOnly(e.target.checked)}
        />
        <span>Standards-track only</span>
      </label>
    </div>

    <div class="results" aria-live="polite">
      ${status() === 'loading' ? html`<p class="muted">Querying…</p>` : null}
      ${status() === 'error'
        ? html`<p class="error">Something went wrong. Is the Service Worker active?</p>`
        : null}
      ${status() === 'idle' && results().length === 0
        ? html`<p class="muted">No matches.</p>`
        : null}
      <ul>
        ${results().map(
          (r) => html`<li>
            <strong>${r.title}</strong>
            <span class="tag">${r.tag}</span>
            ${r.standardsTrack ? html`<span class="badge">standards-track</span>` : null}
            <div class="note">${r.note}</div>
          </li>`
        )}
      </ul>
    </div>

    ${wire()
      ? html`<div class="inspector">
          <div class="inspector-title">🔌 On the wire</div>
          <dl>
            <dt>Method sent</dt>
            <dd><code>${wire().sentMethod}</code></dd>
            <dt>Method the server received</dt>
            <dd>
              <code>${wire().observedMethod}</code>
              ${wire().observedMethod === 'QUERY'
                ? html`<span class="ok">✓ verbatim</span>`
                : html`<span class="warn">⚠ normalized/changed</span>`}
            </dd>
            <dt>HTTP status</dt>
            <dd><code>${wire().httpStatus}</code></dd>
            <dt>Request body (this is where the query lives)</dt>
            <dd><pre>${JSON.stringify(wire().requestBody, null, 2)}</pre></dd>
          </dl>
          <p class="muted">
            Open <strong>DevTools → Network</strong>, filter by <code>search</code>,
            and watch the request go out with the <code>QUERY</code> method.
          </p>
        </div>`
      : null}
  `;
}

register('QueryDemo', QueryDemo);
hydrate();
