/*
 * query-sw.js — a Service Worker that answers a real HTTP QUERY request.
 *
 * Why this exists: GitHub Pages (and `npx serve`) are static hosts with no
 * origin server that understands the QUERY method. A Service Worker sits between
 * the page and the network, so it can intercept the request, read the method and
 * body verbatim, and respond — letting us demonstrate a genuine QUERY request
 * (visible in DevTools → Network) with no backend at all.
 *
 * See the guide: /docs/guides/query-method.md
 */

// A tiny searchable dataset of web-platform + reactivity concepts.
const DATASET = [
  { title: 'HTTP QUERY', tag: 'http', standardsTrack: true, note: 'RFC 10008 — safe, idempotent, carries a body' },
  { title: 'HTTP GET', tag: 'http', standardsTrack: true, note: 'Safe & idempotent, but no body' },
  { title: 'HTTP POST', tag: 'http', standardsTrack: true, note: 'Has a body, but not safe or idempotent' },
  { title: 'Fetch API', tag: 'http', standardsTrack: true, note: 'WHATWG living standard' },
  { title: 'Signals', tag: 'reactivity', standardsTrack: true, note: 'TC39 proposal for fine-grained reactivity' },
  { title: 'Fine-grained reactivity', tag: 'reactivity', standardsTrack: false, note: 'val / run / calc in front.js' },
  { title: 'Islands Architecture', tag: 'rendering', standardsTrack: false, note: 'Hydrate only interactive regions' },
  { title: 'Import Maps', tag: 'modules', standardsTrack: true, note: 'Bare-specifier resolution in the browser' },
  { title: 'ES Modules', tag: 'modules', standardsTrack: true, note: 'Native <script type="module">' },
  { title: 'Custom Elements', tag: 'components', standardsTrack: true, note: 'Web Components building block' },
  { title: 'Service Worker', tag: 'pwa', standardsTrack: true, note: 'Programmable network proxy — powering this demo' },
  { title: 'Tagged templates', tag: 'templating', standardsTrack: true, note: 'How html`` works, XSS-safe via uhtml' },
];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only intercept our demo endpoint; everything else falls through to network.
  if (url.pathname.endsWith('/api/search')) {
    event.respondWith(handleSearch(event.request));
  }
});

async function handleSearch(request) {
  // The whole point of the demo: read the method exactly as it arrived.
  const observedMethod = request.method;

  // Teach the semantics: reject anything that isn't QUERY, the way a
  // spec-compliant server would refuse the wrong verb for a read-with-a-body.
  if (observedMethod !== 'QUERY') {
    return json(
      { observedMethod, error: `This endpoint only accepts QUERY. Received "${observedMethod}".` },
      405
    );
  }

  let body = {};
  try {
    body = await request.clone().json();
  } catch {
    return json({ observedMethod, error: 'Invalid JSON body.' }, 400);
  }

  const q = String(body.q || '').trim().toLowerCase();
  const standardsOnly = !!(body.filters && body.filters.standardsOnly);

  let results = DATASET;
  if (q) {
    results = results.filter(
      (d) => d.title.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q)
    );
  }
  if (standardsOnly) {
    results = results.filter((d) => d.standardsTrack);
  }

  // A little latency so the loading state is visible.
  await new Promise((r) => setTimeout(r, 200));

  return json({ observedMethod, echoedBody: body, count: results.length, results });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
