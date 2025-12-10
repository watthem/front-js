# Basics

Master the fundamentals of front.js: reactive primitives, component patterns, and Islands Architecture.

## The Three Primitives

front.js has only three core concepts for reactivity:

### val() - Reactive State

`val()` creates a reactive value with automatic dependency tracking.

```javascript
import { val } from '@frontjs/core';

// Create reactive state
const count = val(0);

// Read (subscribes to changes)
count();        // Returns: 0

// Write (notifies subscribers)
count(5);       // Sets value to 5

// Non-reactive read (doesn't subscribe)
count.peek();   // Returns: 5 (no subscription)
```

**When to use `.peek()`:**
- Reading without triggering reactive updates
- Inside event handlers where you don't need subscriptions
- Performance optimization to avoid unnecessary re-runs

```javascript
// ❌ BAD: Creates unnecessary subscription
button.onclick = () => {
  const current = count();  // Subscribes even though we're just reading once
  console.log('Count is:', current);
};

// ✅ GOOD: No subscription needed
button.onclick = () => {
  const current = count.peek();  // Just read the value
  console.log('Count is:', current);
};
```

**How dependency tracking works:**

When a `val()` is read inside a `run()` or `calc()`, it automatically adds that run/calc to its subscribers list. When the value changes, all subscribers are notified and re-execute.

```javascript
const name = val('Alice');

run(() => {
  console.log('Hello', name());  // Subscribes to 'name'
});
// Logs: "Hello Alice"

name('Bob');  // Triggers re-run
// Logs: "Hello Bob"
```

### run() - Auto-Executing Side Effects

`run()` executes a function immediately and re-executes whenever any `val()` read inside it changes.

```javascript
import { run } from '@frontjs/core';

const count = val(0);

run(() => {
  console.log('Count changed to:', count());
  // This runs immediately, then again whenever count changes
});
```

**Cleanup functions:**

Return a cleanup function to dispose of resources (timers, event listeners, etc.):

```javascript
const isPlaying = val(false);

run(() => {
  if (!isPlaying()) return;

  const interval = setInterval(() => {
    console.log('Tick');
  }, 1000);

  // Cleanup runs when:
  // 1. The run re-executes (isPlaying changes)
  // 2. The component disposes
  return () => clearInterval(interval);
});
```

**Isolated error handling:**

If one `run()` throws an error, other runs continue executing:

```javascript
run(() => {
  throw new Error('This run fails');
});

run(() => {
  console.log('This run still executes');
  // Logs: "This run still executes"
});
```

### calc() - Derived Values

`calc()` creates a computed value that automatically updates when its dependencies change.

```javascript
import { calc } from '@frontjs/core';

const firstName = val('Alice');
const lastName = val('Smith');

// Derived value (cached, only recalculates when dependencies change)
const fullName = calc(() => `${firstName()} ${lastName()}`);

fullName();  // Returns: "Alice Smith"

firstName('Bob');
fullName();  // Returns: "Bob Smith" (automatically updated)
```

**Chaining calculations:**

```javascript
const price = val(100);
const quantity = val(2);

const subtotal = calc(() => price() * quantity());
const tax = calc(() => subtotal() * 0.1);
const total = calc(() => subtotal() + tax());

total();  // Returns: 220

price(50);
total();  // Returns: 110 (entire chain recalculates)
```

**Performance:**

`calc()` caches its value and only recalculates when dependencies change. Use it instead of manually computing values in render functions:

```javascript
// ❌ BAD: Recalculates on every render (even if todos didn't change)
return () => html`
  <div>Active: ${todos().filter(t => !t.done).length}</div>
`;

// ✅ GOOD: Only recalculates when todos changes
const activeCount = calc(() => todos().filter(t => !t.done).length);

return () => html`
  <div>Active: ${activeCount()}</div>
`;
```

## Component Pattern

Components are functions that return render functions. This two-phase pattern separates setup from rendering:

```javascript
function MyComponent(props) {
  // 1. SETUP PHASE (runs once)
  const count = val(props.initialCount || 0);
  const doubled = calc(() => count() * 2);

  // 2. RENDER FUNCTION (runs reactively)
  return () => html`
    <div>
      <p>Count: ${count()}</p>
      <p>Doubled: ${doubled()}</p>
      <button onclick=${() => count(count() + 1)}>Increment</button>
    </div>
  `;
}
```

**Why this pattern?**

1. **Setup runs once**: Expensive initialization (event listeners, API calls, etc.) happens only when the component is created
2. **Render runs reactively**: Only when values change, not on every interaction
3. **Clear separation**: Setup logic is distinct from rendering logic

**The render function IS a `run()`:**

Internally, `defineComponent()` wraps your render function in a `run()` that automatically re-executes when any reactive value accessed in the render changes:

```javascript
// What you write:
return () => html`<div>${count()}</div>`;

// What front.js does internally:
run(() => {
  const template = html`<div>${count()}</div>`;
  render(container, template);
});
```

This means:
- Only reactive values accessed in render trigger re-renders
- Values accessed in setup but not render don't cause re-renders
- You control reactivity by controlling what you access in render

**Lifecycle:**

```javascript
function MyComponent(props) {
  console.log('Setup phase - runs once');

  const count = val(0);

  // Setup side effects with cleanup
  run(() => {
    console.log('Side effect - runs on mount and when count changes');

    return () => {
      console.log('Cleanup - runs before next effect or on dispose');
    };
  });

  return () => {
    console.log('Render - runs on mount and when reactive values change');
    return html`<div>${count()}</div>`;
  };
}
```

**Disposal:**

Components can be manually disposed using the `dispose()` function returned by `defineComponent()`:

```javascript
const dispose = defineComponent(renderFn, container);

// Later...
dispose();  // Cleans up all runs, removes event listeners, etc.
```

In practice, you rarely need manual disposal. Islands are typically long-lived (entire page lifetime).

## Islands Architecture

Islands Architecture is front.js's core pattern: server renders HTML, client selectively hydrates interactive parts.

### How Hydration Works

**1. Server (or static HTML) marks islands:**

```html
<div
  data-island
  data-component="Counter"
  data-props='{"start": 10}'
></div>
```

**2. Client registers components and hydrates:**

```javascript
import { register, hydrate } from '@frontjs/core';

function Counter(props) {
  const count = val(props.start || 0);
  return () => html`<div>${count()}</div>`;
}

register('Counter', Counter);  // Register component by name
hydrate();                      // Find and hydrate all islands
```

**3. Hydration algorithm:**

```javascript
// Simplified pseudocode
function hydrate() {
  const islands = document.querySelectorAll('[data-island]');

  islands.forEach(island => {
    const componentName = island.getAttribute('data-component');
    const propsJSON = island.getAttribute('data-props');

    // Security: validate component name (alphanumeric only)
    if (!/^[a-zA-Z0-9_-]+$/.test(componentName)) {
      console.error('Invalid component name:', componentName);
      return;  // Skip this island
    }

    // Security: JSON-only props (no functions, no executable code)
    const props = JSON.parse(propsJSON || '{}');

    // Lookup registered component
    const componentFn = registry[componentName];
    if (!componentFn) {
      console.error('Component not found:', componentName);
      return;  // Skip this island
    }

    // Initialize: setup phase
    const renderFn = componentFn(props);

    // Hydrate: bind render function to island
    defineComponent(renderFn, island);

    // Cleanup: remove marker (hydrated)
    island.removeAttribute('data-island');
  });
}
```

### Security Model

**JSON-only props:**

Props must be serializable as JSON. No functions, no closures, no circular references:

```javascript
// ✅ VALID
data-props='{"count": 10, "items": ["a", "b"], "config": {"enabled": true}}'

// ❌ INVALID
data-props='{"onClick": function() { ... }}'  // Functions not allowed
data-props='{"ref": <circular>}'              // Circular refs not allowed
```

**Why JSON-only?** This prevents the entire category of deserialization attacks (like the React Server Components CVE-2025-55182). The client never receives executable code in props—only data.

**Component name validation:**

Component names are validated with regex: `/^[a-zA-Z0-9_-]+$/`

```javascript
// ✅ VALID
register('Counter', Counter);
register('todo-list', TodoList);
register('Header_Nav', HeaderNav);

// ❌ INVALID (would be rejected during hydration)
data-component="<script>alert('xss')</script>"  // Blocked
data-component="../../../etc/passwd"            // Blocked
```

**Graceful failure:**

If an island fails to hydrate (invalid component name, missing component, JSON parse error), it's logged and skipped. Other islands continue to hydrate normally.

### Performance Implications

**Selective hydration:**

Only marked islands run JavaScript. Static content (paragraphs, images, navigation) remains static HTML:

```html
<!-- Static: no JavaScript -->
<header>
  <h1>My Site</h1>
  <nav>...</nav>
</header>

<!-- Interactive: JavaScript hydrates this -->
<div data-island data-component="SearchModal" ...></div>

<!-- Static: no JavaScript -->
<article>
  <p>Content...</p>
</article>

<!-- Interactive: JavaScript hydrates this -->
<div data-island data-component="CommentForm" ...></div>
```

**Benefits:**
- **Smaller bundles**: Only interactive code ships
- **Faster TTI**: Less JavaScript to parse and execute
- **Better FCP**: Static content renders immediately

## Common Patterns

### Side Effects with Cleanup

Use `run()` with cleanup for timers, event listeners, subscriptions:

```javascript
function Timer(props) {
  const seconds = val(0);
  const isRunning = val(false);

  run(() => {
    if (!isRunning()) return;  // Don't start timer if not running

    const interval = setInterval(() => {
      seconds(seconds() + 1);
    }, 1000);

    // Cleanup: runs when isRunning changes or component disposes
    return () => clearInterval(interval);
  });

  return () => html`
    <div>
      <p>Time: ${seconds()}s</p>
      <button onclick=${() => isRunning(!isRunning())}>
        ${isRunning() ? 'Stop' : 'Start'}
      </button>
    </div>
  `;
}
```

### Derived State

Use `calc()` for computed values that depend on other reactive values:

```javascript
function TodoList(props) {
  const todos = val(props.todos || []);
  const filter = val('all'); // 'all', 'active', 'completed'

  // Derived values (cached, only recalculate when dependencies change)
  const filteredTodos = calc(() => {
    const f = filter();
    if (f === 'all') return todos();
    if (f === 'active') return todos().filter(t => !t.done);
    return todos().filter(t => t.done);
  });

  const activeCount = calc(() => todos().filter(t => !t.done).length);
  const completedCount = calc(() => todos().filter(t => t.done).length);

  return () => html`
    <div>
      <div class="filters">
        <button onclick=${() => filter('all')}>All (${todos().length})</button>
        <button onclick=${() => filter('active')}>Active (${activeCount()})</button>
        <button onclick=${() => filter('completed')}>Completed (${completedCount()})</button>
      </div>

      <ul>
        ${filteredTodos().map(todo => html`
          <li>
            <input
              type="checkbox"
              checked=${todo.done}
              onchange=${() => {
                const updated = todos().map(t =>
                  t.id === todo.id ? { ...t, done: !t.done } : t
                );
                todos(updated);
              }}
            />
            <span>${todo.text}</span>
          </li>
        `)}
      </ul>
    </div>
  `;
}
```

### Event Handlers

Event handlers can read and write reactive values:

```javascript
function Form(props) {
  const email = val('');
  const message = val('');
  const status = val('idle'); // 'idle' | 'submitting' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    status('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.peek(),     // Use .peek() in handlers
          message: message.peek()
        })
      });

      if (!response.ok) throw new Error('Failed to submit');

      status('success');
      email('');    // Clear form
      message('');
    } catch (err) {
      status('error');
      console.error('Submit error:', err);
    }
  };

  return () => html`
    <form onsubmit=${handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value=${email()}
        oninput=${(e) => email(e.target.value)}
        disabled=${status() === 'submitting'}
      />

      <textarea
        placeholder="Message"
        value=${message()}
        oninput=${(e) => message(e.target.value)}
        disabled=${status() === 'submitting'}
      ></textarea>

      <button type="submit" disabled=${status() === 'submitting'}>
        ${status() === 'submitting' ? 'Sending...' : 'Send'}
      </button>

      ${status() === 'success' ? html`
        <p class="success">Message sent!</p>
      ` : ''}

      ${status() === 'error' ? html`
        <p class="error">Failed to send. Please try again.</p>
      ` : ''}
    </form>
  `;
}
```

## Advanced Topics

### Reactivity Dependency Tracking

front.js uses a **pull-based** reactive system with automatic dependency tracking:

1. **Subscription**: When a `val()` is read inside a `run()`, the run is added to the val's subscribers
2. **Notification**: When a `val()` is written, all subscribers are notified
3. **Execution**: Notified runs re-execute, reading new values
4. **Unsubscription**: Before re-executing, a run unsubscribes from all previous dependencies
5. **Resubscription**: During re-execution, the run subscribes to newly read values

This means dependencies are **dynamic**—they change based on what values are actually read during execution.

**Example:**

```javascript
const showDetails = val(false);
const details = val('Details here');

run(() => {
  console.log('Running');
  if (showDetails()) {
    console.log('Details:', details());  // Only subscribes when showDetails is true
  }
});

// Changing details() won't trigger re-run (not subscribed yet)
details('New details');  // No re-run

// Now enable details
showDetails(true);  // Re-runs, subscribes to details()

// Now changing details() triggers re-run
details('Updated details');  // Re-runs (subscribed now)
```

### Constraints & Guarantees

**Hard limits:**
- **<5KB gzipped** - Enforced in CI, build fails if exceeded
- **No runtime dependencies** - front.js has zero dependencies (uhtml is peer dep)
- **No polyfills** - Requires modern browsers (ES2020+, native ESM, import maps)

**Security guarantees:**
- **No eval/new Function()** - Never executes strings as code
- **JSON-only props** - No deserialization of functions/closures
- **Automatic XSS escaping** - uhtml escapes all values by default
- **Component name validation** - Alphanumeric only, injection impossible
- **Isolated errors** - One failing component doesn't break others

**Design constraints:**
- **Explicit over implicit** - No auto-imports, no magic, everything is explicit
- **Platform over abstraction** - Use native DOM, native events, native modules
- **Simplicity over features** - If it adds complexity, it doesn't belong

### When to Use Each Primitive

**Use `val()` for:**
- Form inputs
- Toggle states (open/closed, visible/hidden)
- User interactions (clicks, hovers)
- Any mutable state

**Use `run()` for:**
- Side effects (timers, subscriptions, event listeners)
- DOM manipulation outside uhtml
- Logging/debugging
- External API calls

**Use `calc()` for:**
- Derived values (filtered lists, totals, formatting)
- Expensive computations you want to cache
- Values that depend on multiple other values

---

**You've mastered the basics!** Now explore:
- **[API Reference](#api-core)** - Complete API documentation
- **[Examples](/../examples/)** - Real-world patterns
- **[Troubleshooting](#troubleshooting)** - Common issues and solutions
- **[Limitations](#limitations)** - What front.js can't do
