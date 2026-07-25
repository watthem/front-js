# How the Reactivity Works

> A guided read of the ~150-line reactivity engine at the heart of front.js.
> This is the document to read (and the code to walk through) if you want to
> understand how fine-grained reactivity — the thing that powers Solid, Preact
> Signals, Vue's `ref`, and the TC39 Signals proposal — actually works, without
> a framework in the way.

The whole engine lives in one headless, DOM-free file:
[`packages/core/src/core/reactivity.js`](../../../packages/core/src/core/reactivity.js).
It exports three primitives — `val`, `run`, and `calc` — and nothing else.

## The one idea

Every fine-grained reactivity system is a variation on a single trick:

> While a function runs, secretly record which pieces of state it reads.
> When one of those pieces changes, re-run the function.

That's it. Everything below is bookkeeping around that sentence.

## The shared secret: `currentRun`

```js
let currentRun = null;
```

A single module-level variable. When a reactive function is executing,
`currentRun` points at it. When nothing reactive is running, it's `null`.
This is the channel through which a value being _read_ discovers _who_ is
reading it. No framework magic, no compiler — just a variable that's set for
the duration of a call.

## `val` — a reactive cell

A `val` is a closure over a single value plus a `Set` of subscribers:

```js
export function val(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  const s = (...args) => {
    if (args.length === 0) {          // READ
      if (currentRun) subscribers.add(currentRun);
      return value;
    }
    const newValue = args[0];         // WRITE
    if (value !== newValue) {
      value = newValue;
      subscribers.forEach((fn) => { /* notify */ fn(); });
    }
    return value;
  };

  s.peek = () => value;
  return s;
}
```

Two behaviors packed into one function by argument count:

- **Read** (`count()`): if a run is currently executing, add it to this cell's
  subscribers. This is _dependency tracking_ — the cell now knows this run
  depends on it. Then return the value.
- **Write** (`count(5)`): if the value actually changed (shallow `!==` check —
  this is what prevents redundant updates), store it and notify every
  subscriber by calling it.

`peek()` reads the value _without_ subscribing — the escape hatch for when you
want the current value but don't want to create a dependency.

The `!==` guard matters more than it looks: it's the difference between "set to
the same value 100 times → 0 re-renders" and "100 re-renders." Cheap
correctness.

## `run` — an effect that re-subscribes itself

`run` executes a function immediately, and re-executes it whenever any `val` it
read changes:

```js
export function run(fn) {
  let cleanup;

  const wrapper = () => {
    if (cleanup) cleanup();          // undo last time's side effects

    const prevRun = currentRun;
    currentRun = wrapper;            // "I am the current reader"
    try {
      const result = fn();
      cleanup = typeof result === 'function' ? result : undefined;
    } finally {
      currentRun = prevRun;          // always restore, even on throw
    }
  };

  wrapper();                          // run once, now
  return () => { if (cleanup) cleanup(); };  // dispose
}
```

The important moves:

1. **Set `currentRun` to itself before calling `fn`.** Now any `val()` read
   inside `fn` will see `currentRun` and subscribe `wrapper`. This is where the
   "secretly record what you read" half of the trick happens.
2. **Restore `currentRun` in `finally`.** Runs can be nested (a `calc` inside a
   `run`), so it saves and restores the previous value rather than blindly
   nulling it. `finally` guarantees the restore even if `fn` throws.
3. **Cleanup functions.** If `fn` returns a function, it's treated as teardown —
   run before the next execution and on dispose. This is how you manage timers,
   listeners, and subscriptions without leaking them:

   ```js
   run(() => {
     const id = setInterval(tick, 1000);
     return () => clearInterval(id); // ← cleanup
   });
   ```

4. **Error isolation.** The real file wraps `fn`, the cleanup, and every
   subscriber notification in `try/catch` that logs and continues. One broken
   effect can't take down the others or leave `currentRun` stuck pointing at a
   dead run. This is a deliberate robustness choice — it's why a single bad
   island never white-screens the page.

## `calc` — derived state, for free

`calc` is the payoff for keeping `val` and `run` small: it's just the two of
them composed.

```js
export function calc(fn) {
  const s = val(fn());        // cache the derived value in a cell
  run(() => s(fn()));         // recompute + store when deps change
  return () => s();           // hand back a read-only getter
}
```

- The inner `run` reads whatever `fn` reads, so it subscribes to those
  dependencies automatically.
- When they change, the run re-executes, recomputes `fn()`, and writes it into
  the backing `val` `s`.
- Writing to `s` notifies _its_ subscribers — so anything reading the calc
  updates too. Reactivity composes.
- Consumers get back `() => s()`, a getter with no setter: derived state is
  read-only by construction.

The caching falls out naturally: `s`'s `!==` guard means a `calc` that
recomputes to the same value notifies nobody downstream.

## Putting it together

```js
const first = val('Ada');
const last  = val('Lovelace');
const full  = calc(() => `${first()} ${last()}`);

run(() => console.log(full()));   // logs "Ada Lovelace"

last('Byron');                    // logs "Ada Byron"
```

The write to `last` notifies the `calc`'s internal run, which recomputes
`full`, which notifies the logging run. No diffing, no virtual DOM, no
subscriptions written by hand — the dependency graph built itself as the code
read values.

## How the DOM gets involved (it doesn't, in here)

Notice `reactivity.js` imports nothing. It never touches the DOM. Rendering is
layered _on top_ in
[`component.js`](../../../packages/core/src/core/component.js), which wraps a
component's render function in a `run`:

```js
const dispose = run(() => render(container, renderFn()));
```

Because `render` calls `renderFn()`, and `renderFn` reads `val`s, the run
subscribes to exactly the state that component uses — and re-renders only when
that state changes. The reactivity engine doesn't know or care that a DOM is on
the other end. That separation (headless core, DOM as a consumer) is the design
principle the framework is organized around, and it's why the same engine could
in principle drive canvas, a terminal, or the TC39 Signals proposal underneath.

## The honest limitation: dependencies are never pruned

This is the most instructive part, and the thing a production signals library
(Solid, the TC39 proposal) does that this one deliberately does not.

When a run executes, it _adds_ itself to the subscriber set of every `val` it
reads. **It never removes itself.** There is no step that clears a run's old
subscriptions before re-running. Consider:

```js
const showDetails = val(false);
const name        = val('Ada');

run(() => {
  if (showDetails()) {
    console.log(name());   // only read when showDetails is true
  }
});

showDetails(true);   // run now reads name() → subscribes to `name`
showDetails(false);  // run no longer reads name()...
name('Grace');       // ...but the run STILL fires, needlessly
```

After `showDetails(false)`, the effect no longer depends on `name` — but it's
still in `name`'s subscriber set from the earlier pass, so updating `name`
re-runs it anyway. Two consequences:

- **Over-execution:** effects run more often than they logically need to. Output
  stays _correct_ (the guard skips the `console.log`), but work is wasted.
- **Retention:** a subscriber `Set` holds references to runs that no longer care
  about the cell, so they aren't eligible for collection while the `val` lives.

A full implementation fixes this by tracking dependencies _per execution_:
before each run, it clears the previous edge set; during the run it records the
new reads; afterward it diffs and unsubscribes from cells that dropped out.
That's the "dynamic dependency tracking" or "auto-disposal" you'll see described
in Solid's reactivity and the TC39 Signals explainer.

It's left out here on purpose — adding it costs bytes and complexity, and for
the small, island-sized components this framework targets (a counter, a toggle,
a form), the accumulated edges are bounded and short-lived. But it's the first
thing you'd add to take the engine from "correct for islands" to "correct for
long-lived, deeply-branching UIs," and it's a great exercise: the test in
[`tests/limitations.test.js`](../../../packages/core/tests/limitations.test.js)
documents the current behavior, and implementing pruning is a self-contained
change to `run`.

## Where to go from here

- Read the source top-to-bottom — it's ~150 lines and every line is covered
  above.
- Read [`tests/reactivity.test.js`](../../../packages/core/tests/reactivity.test.js)
  for the behavior spec, and `tests/limitations.test.js` for the known edges.
- Compare against the [TC39 Signals proposal](https://github.com/tc39/proposal-signals)
  — the vocabulary (`state`, `computed`, `watcher`) maps cleanly onto
  (`val`, `calc`, `run`), which is intentional.
