import { html, svg } from 'uhtml';
import { val, run, register, hydrate } from '../front.esm.js';

/**
 * SignalGraph — a live visualization of fine-grained reactivity.
 *
 * The graph is driven by REAL front.js primitives. Each derived node is a
 * `run` that recomputes when its dependencies change; when a run executes it
 * records itself, so the highlight you see is genuine propagation, not an
 * animation. Change `a` and only the a-b-sum-doubled-log₁ chain lights up —
 * the c² branch doesn't run, because it doesn't depend on `a`. That's the whole
 * point of fine-grained reactivity: work is proportional to the dependency
 * graph, not the whole app.
 *
 * (We use `run` for the derived nodes so we can instrument them. `calc` is
 * exactly this under the hood: a val updated by a run — see calc() in the core.)
 */
function SignalGraph() {
  // --- The reactive graph: real vals + runs -------------------------------
  const a = val(1);
  const b = val(2);
  const c = val(3);

  const sum = val(0);
  const dbl = val(0);
  const sq = val(0);
  const log1 = val('');
  const log2 = val('');

  // --- Instrumentation (plain, non-reactive so runs don't depend on it) ----
  const counts = { sum: 0, dbl: 0, sq: 0, log1: 0, log2: 0 };
  let activeIds = new Set();
  let lastChanged = null;
  const paint = val(0); // reactive repaint tick
  const bump = () => paint(paint.peek() + 1);
  function fire(id) {
    counts[id] += 1;
    activeIds.add(id);
    bump(); // notify the renderer (write-only: creates no dependency)
  }

  // The reactivity itself. Each run auto-subscribes to whatever it reads.
  run(() => { sum(a() + b()); fire('sum'); });          // depends on a, b
  run(() => { dbl(sum() * 2); fire('dbl'); });          // depends on sum
  run(() => { sq(c() * c()); fire('sq'); });            // depends on c
  run(() => { log1('doubled = ' + dbl()); fire('log1'); }); // depends on dbl
  run(() => { log2('c² = ' + sq()); fire('log2'); });   // depends on sq

  // Every run executed once on creation — reset to a neutral starting view.
  for (const k in counts) counts[k] = 0;
  activeIds = new Set();
  bump();

  function step(sig, id, delta) {
    activeIds = new Set(); // clear last highlight
    lastChanged = id;
    sig(sig.peek() + delta); // triggers the cascade; runs call fire()
    bump();
  }

  // --- Layout -------------------------------------------------------------
  const W = 118;
  const H = 56;
  const NODES = {
    a:    { x: 20,  y: 34,  label: 'a',     kind: 'val',    read: a },
    b:    { x: 20,  y: 116, label: 'b',     kind: 'val',    read: b },
    c:    { x: 20,  y: 276, label: 'c',     kind: 'val',    read: c },
    sum:  { x: 250, y: 75,  label: 'a + b', kind: 'calc',   read: sum },
    dbl:  { x: 480, y: 75,  label: '× 2',   kind: 'calc',   read: dbl },
    sq:   { x: 250, y: 276, label: 'c × c', kind: 'calc',   read: sq },
    log1: { x: 640, y: 75,  label: 'log₁',  kind: 'effect', read: log1 },
    log2: { x: 480, y: 276, label: 'log₂',  kind: 'effect', read: log2 },
  };
  const EDGES = [
    ['a', 'sum'], ['b', 'sum'], ['sum', 'dbl'], ['dbl', 'log1'],
    ['c', 'sq'], ['sq', 'log2'],
  ];
  const rightAnchor = (n) => [n.x + W, n.y + H / 2];
  const leftAnchor = (n) => [n.x, n.y + H / 2];

  const KIND_LABEL = { val: 'val', calc: 'calc (derived)', effect: 'run (effect)' };
  const ACTIVE_LABEL = { sum: 'a + b', dbl: '× 2', sq: 'c²', log1: 'log₁', log2: 'log₂' };

  // --- Render -------------------------------------------------------------
  return () => {
    paint(); // establish the repaint dependency

    const ORDER = ['sum', 'dbl', 'sq', 'log1', 'log2'];
    const lit = ORDER.filter((id) => activeIds.has(id));
    const punchline =
      lastChanged === null
        ? 'Nudge a value below and watch which nodes recompute.'
        : lit.length === 0
        ? `You changed ${lastChanged}, but nothing downstream needed recomputing.`
        : `You changed ${lastChanged} → ${lit.length} node${lit.length > 1 ? 's' : ''} recomputed: ` +
          `${lit.map((id) => ACTIVE_LABEL[id]).join(', ')}. ` +
          `The other branch didn't run — it doesn't depend on ${lastChanged}.`;

    const edgeLine = ([from, to]) => {
      const [x1, y1] = rightAnchor(NODES[from]);
      const [x2, y2] = leftAnchor(NODES[to]);
      const hot = activeIds.has(to);
      const midX = (x1 + x2) / 2;
      return svg`<path
        d=${`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
        class=${hot ? 'edge hot' : 'edge'}
        marker-end=${hot ? 'url(#arrow-hot)' : 'url(#arrow)'} />`;
    };

    const node = (id) => {
      const n = NODES[id];
      const active = activeIds.has(id);
      const raw = n.read();
      const value = typeof raw === 'number' ? String(raw) : raw;
      const showCount = n.kind !== 'val';
      return svg`<g class=${`node ${n.kind}${active ? ' active' : ''}`} transform=${`translate(${n.x} ${n.y})`}>
        <rect width=${W} height=${H} rx="10" class="node-box" />
        <text x="12" y="21" class="node-label">${n.label}</text>
        <text x="12" y="42" class="node-value">${value}</text>
        ${showCount
          ? svg`<g transform=${`translate(${W - 16} -10)`}>
              <circle r="13" class="badge" />
              <text class="badge-text" y="4" text-anchor="middle">${counts[id]}</text>
            </g>`
          : null}
      </g>`;
    };

    return html`
      <div class="sg">
        <div class="sg-controls">
          ${['a', 'b', 'c'].map((id) => {
            const sig = NODES[id].read;
            return html`<div class="stepper">
              <span class="stepper-name">${id}</span>
              <button onclick=${() => step(sig, id, -1)} aria-label=${`decrease ${id}`}>−</button>
              <span class="stepper-val">${sig()}</span>
              <button onclick=${() => step(sig, id, +1)} aria-label=${`increase ${id}`}>+</button>
            </div>`;
          })}
        </div>

        <p class="sg-punchline" aria-live="polite">${punchline}</p>

        ${svg`<svg viewBox="0 0 780 360" class="sg-svg" role="img" aria-label="Reactive dependency graph">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" class="arrow" />
            </marker>
            <marker id="arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-hot" />
            </marker>
          </defs>
          ${EDGES.map(edgeLine)}
          ${Object.keys(NODES).map(node)}
        </svg>`}

        <div class="sg-legend">
          <span class="chip val">val — writable state</span>
          <span class="chip calc">calc — derived value</span>
          <span class="chip effect">run — side effect</span>
          <span class="chip badge-legend">badge = times recomputed</span>
        </div>
      </div>
    `;
  };
}

register('SignalGraph', SignalGraph);
hydrate();
