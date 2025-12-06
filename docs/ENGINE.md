# ENGINE.md

Hypothesis: If we let users return Promises from `run()`, we create a "foot-gun" where cleanup functions fail silently, or worse, the framework crashes when it tries to "call" a Promise object as if it were a function.

## Engine

Here is the **Hardened Reactivity Engine** and the **Async Data Proof**.

### 1\. The Fix: Hardening `run()`

We modify `src/core/reactivity.js`. We add a check to see if the return value of the user's function looks like a Promise. If it does, we strip it and shout.

**`src/core/reactivity.js`**

```javascript
/**
 * src/core/reactivity.js
 * The "Ruthless" Reactive Engine (Hardened)
 */

let currentRun = null;

// ... val() implementation remains the same ...
export function val(initial) {
  let value = initial;
  const subscribers = new Set();
  const unit = (...args) => {
    if (args.length === 0) {
      if (currentRun) subscribers.add(currentRun);
      return value;
    }
    if (value !== args[0]) {
      value = args[0];
      subscribers.forEach((fn) => fn());
    }
    return value;
  };
  unit.peek = () => value;
  return unit;
}

/**
 * run(fn) - Executing side effects safely
 * @param {Function} fn - The effect function
 */
export function run(fn) {
  let cleanup;

  const wrapper = () => {
    // 1. Run previous cleanup
    if (typeof cleanup === 'function') cleanup();

    const prev = currentRun;
    currentRun = wrapper;

    try {
      // 2. Execute the function
      const result = fn();

      // 3. HARDENING: Check for Promise return type
      if (result instanceof Promise || (result && typeof result.then === 'function')) {
        console.warn(
          '[front.js] Warning: run() returned a Promise. ' +
            'Async functions are not supported directly in run() because they break cleanup. ' +
            'Use an IIFE (async () => {})() inside the effect instead.'
        );
        // Discard the promise so we don't crash later
        cleanup = undefined;
      } else {
        // Valid cleanup function (or undefined)
        cleanup = result;
      }
    } catch (e) {
      console.error('[front.js] Error in run:', e);
    } finally {
      currentRun = prev;
    }
  };

  wrapper();

  // Return a manual disposer
  return () => {
    if (typeof cleanup === 'function') cleanup();
  };
}

// ... calc() remains the same ...
export function calc(fn) {
  const s = val(fn());
  run(() => s(fn()));
  return () => s();
}
```

---

### 2\. The Pattern: Safe Async Effects

Now that we block `async run`, how do we actually fetch data?

We use the **"Active Flag" Pattern**. This is crucial because network requests often finish _after_ the user has clicked away (unmounted) or changed the inputs (update). If we don't track this, we get "Race Conditions" where an old request overwrites new data.

**The Correct Pattern:**

```javascript
run(() => {
  // 1. Read dependencies (auto-subscribes)
  const query = searchQuery();

  // 2. Setup Cancellation Token
  let active = true;

  // 3. Fire-and-Forget Async (IIFE)
  (async () => {
    const res = await fetch(`/api/${query}`);
    const json = await res.json();

    // 4. Only update if still active
    if (active) results(json);
  })();

  // 5. Cleanup: Invalidate the token
  return () => {
    active = false;
  };
});
```

---

### 3\. The Proof: `examples/github-user.js`

Create this file to verify the pattern works ergonomically with `val/run`.

```javascript
import { html } from 'uhtml';
import { val, run, register, hydrate } from '../src/index.js';

function GithubUser({ initialUser }) {
  // State (Values)
  const username = val(initialUser || 'octocat');
  const profile = val(null);
  const error = val(null);
  const loading = val(false);

  // Effect (The Run)
  run(() => {
    const user = username();
    if (!user) return;

    // Cancellation flag
    let active = true;
    loading(true);
    error(null);
    profile(null); // Clear previous result

    // The Async Logic
    (async () => {
      try {
        // Artificial delay to demonstrate race conditions if you type fast
        await new Promise((r) => setTimeout(r, 500));

        const res = await fetch(`https://api.github.com/users/${user}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();

        // Safety Check
        if (active) {
          profile(data);
          loading(false);
        } else {
          console.log(`[front.js] Ignored stale response for ${user}`);
        }
      } catch (err) {
        if (active) {
          error(err.message);
          loading(false);
        }
      }
    })();

    // Cleanup function
    return () => {
      active = false;
    };
  });

  // Render
  return () => html`
    <div class="card">
      <h3>GitHub User Search</h3>
      <input
        value="${username()}"
        oninput="${(e) => username(e.target.value)}"
        placeholder="Enter username..."
      />

      ${loading() ? html`<p>Loading...</p>` : ''}
      ${error() ? html`<p style="color: red">Error: ${error()}</p>` : ''}
      ${profile()
        ? html`
            <div style="margin-top: 10px; border: 1px solid #ddd; padding: 10px;">
              <img src="${profile().avatar_url}" width="50" style="float:left; margin-right:10px" />
              <strong>${profile().name || profile().login}</strong><br />
              <small>Public Repos: ${profile().public_repos}</small>
            </div>
          `
        : ''}
    </div>
  `;
}

register('GithubUser', GithubUser);
hydrate();
```

### 4\. Verification Steps

1.  **Update `src/core/reactivity.js`** with the code above.
2.  **Save `examples/github-user.js`**.
3.  **Create a test HTML file** (or update `examples/index.html`) to include:
    ```html
    <div data-island data-component="GithubUser" data-props='{"initialUser": "torvalds"}'></div>
    ```
4.  **Run it.**
    - **Test 1 (Normal):** It should load "torvalds".
    - **Test 2 (Race Condition):** Type "microsoft" really fast. You should see logs in the console saying `[front.js] Ignored stale response...`. The UI should _only_ show the result for the final string you typed, never an intermediate state flickering.
    - **Test 3 (The Warning):** Temporarily change `run(() => ...)` to `run(async () => ...)` in the code. Check the console. You should see the nice warning: _"Use an IIFE inside the effect instead."_

This confirms that `front.js` is now "Async Safe" while remaining ruthless about its API surface.

See the [`wiki/TRANSLATIONS.md`](../wiki/TRANSLATIONS.md) for more details on how to translate this pattern to React users.
