# front.js API Reference

Complete API documentation for front.js.

## Table of Contents

- [Reactivity Primitives](#reactivity-primitives)
- [Component System](#component-system)
- [Hydration](#hydration)
- [Rendering](#rendering)

---

## Reactivity Primitives

### `val(initialValue)`

Creates a reactive value that tracks dependencies and notifies subscribers on changes.

**Parameters:**

- `initialValue` (any): Initial value for the value

**Returns:** `Function` - Value function that acts as getter/setter

**Usage:**

```javascript
import { val } from 'front.js';

const count = val(0);

// Getter: No arguments
count(); // returns 0

// Setter: Provide new value
count(5); // updates to 5, returns 5

// Peek: Read without subscribing (non-reactive)
count.peek(); // returns current value without tracking
```

**Notes:**

- Values automatically track which runs read them
- Setting the same value twice won't trigger updates (shallow equality check)
- `peek()` is useful for reading values without creating dependencies

---

### `run(fn)`

Runs code that automatically re-executes when any values it reads change. Runs can return a cleanup function that executes before re-execution or when manually disposed.

**Parameters:**

- `fn` (Function): Function to execute reactively. Can return a cleanup function.

**Returns:** `Function` - Dispose function to stop the run and execute cleanup

**Basic Usage:**

```javascript
import { val, run } from 'front.js';

const count = val(0);

run(() => {
  console.log('Count is:', count()); // Auto-subscribes to count
});

count(5); // Run re-executes, logs "Count is: 5"
```

**Cleanup Usage:**

```javascript
import { val, run } from 'front.js';

const count = val(0);

const dispose = run(() => {
  console.log('Count changed:', count());

  // Cleanup runs before next execution or on dispose
  return () => {
    console.log('Cleaning up...');
  };
});

count(5); // Logs: "Cleaning up..." then "Count changed: 5"
dispose(); // Logs: "Cleaning up..." and stops run
```

**Common Use Cases:**

- **Timers:** Clean up `setInterval` / `setTimeout`
- **Event listeners:** Remove `addEventListener` handlers
- **WebSocket connections:** Close connections with `ws.close()`
- **Subscriptions:** Unsubscribe from external data sources

**Example with Timer:**

```javascript
run(() => {
  const interval = setInterval(() => {
    console.log('Tick!');
  }, 1000);

  return () => clearInterval(interval);
});
```

**Notes:**

- Runs execute immediately on creation
- Runs automatically track all values read during execution
- Cleanup runs before the run re-executes (when dependencies change)
- Cleanup runs when dispose() is called manually
- Errors in runs are logged but don't break other runs
- Runs can be nested (inner runs inherit outer run context)

---

### `calc(fn)`

Creates a calculated (derived) value that automatically updates when dependencies change.

**Parameters:**

- `fn` (Function): Function that calculates the derived value

**Returns:** `Function` - Read-only getter function

**Usage:**

```javascript
import { val, calc } from 'front.js';

const count = val(5);
const doubled = calc(() => count() * 2);

doubled(); // returns 10
count(10); // doubled() now returns 20
```

**Notes:**

- Calculated values are read-only (no setter)
- Calculated values are cached and only recalculate when dependencies change
- Errors during calculation keep the previous value

---

## Component System

### `defineComponent(renderFn, container)`

Defines a component by binding its render function to a run. The component will automatically re-render when any values it reads change.

**Parameters:**

- `renderFn` (Function): Function that returns a uhtml template
- `container` (HTMLElement): DOM element to render into

**Usage:**

```javascript
import { defineComponent, val, html } from 'front.js';

const count = val(0);
const renderFn = () => html`<div>Count: ${count()}</div>`;

defineComponent(renderFn, document.getElementById('app'));
```

**Notes:**

- Components are typically created via `hydrate()` rather than called directly
- The render function should return a uhtml template
- Rendering errors are caught and displayed as fallback text

---

## Hydration

### `register(name, componentFn)`

Registers a component function by name for hydration.

**Parameters:**

- `name` (string): Component name (must be alphanumeric with optional underscores/hyphens)
- `componentFn` (Function): Component function that accepts props and returns render function

**Returns:** `undefined`

**Usage:**

```javascript
import { register } from 'front.js';

function MyComponent(props) {
  const data = val(props.initialValue || 0);
  return () => html`<div>${data()}</div>`;
}

register('MyComponent', MyComponent);
```

**Validation:**

- Component names must match `/^[a-zA-Z0-9_-]+$/` (alphanumeric, underscores, hyphens)
- Invalid names or non-function components are rejected with console errors

---

### `hydrate(root?)`

Hydrates all island components found in the DOM. Scans for elements with `data-island` attribute and initializes components.

**Parameters:**

- `root` (HTMLElement, optional): Root element to scan (defaults to `document.body`)

**Returns:** `undefined`

**Usage:**

```javascript
import { hydrate } from 'front.js';

// Hydrate all islands in document.body
hydrate();

// Or hydrate from a specific root element
hydrate(document.querySelector('#app'));
```

**HTML Structure:**

```html
<div data-island data-component="MyComponent" data-props='{"initialValue": 10}'></div>
```

**Attributes:**

- `data-island`: Marks the element as an island boundary
- `data-component`: Component name (must be registered)
- `data-props`: JSON-serialized props object

**Security:**

- Component names are validated (alphanumeric only)
- Props are parsed with `JSON.parse()` only (no eval)
- Invalid JSON or missing components are logged and skipped
- The `data-island` attribute is removed after hydration

---

## Rendering

### `html\`template\``

Tagged template literal from uhtml that safely creates DOM nodes. Handles attribute binding and text escaping automatically.

**Usage:**

```javascript
import { html } from 'front.js';

const name = val('World');
const template = html`<h1>Hello, ${name()}!</h1>`;
```

**Features:**

- Automatic XSS protection (all values are escaped)
- Event handler binding via `onclick`, `oninput`, etc.
- Attribute binding via `${value}` in attributes
- Safe by default

**Event Handlers:**

```javascript
const count = val(0);
html`<button onclick=${() => count(count() + 1)}>Increment</button>`;
```

**Attribute Binding:**

```javascript
const disabled = val(false);
html`<button disabled=${disabled()}>Click me</button>`;
```

---

### `render(container, template)`

Renders a uhtml template into a DOM container. Handles DOM diffing efficiently.

**Parameters:**

- `container` (HTMLElement): Target DOM element
- `template` (TemplateResult): uhtml template result

**Usage:**

```javascript
import { render, html } from 'front.js';

const template = html`<div>Hello</div>`;
render(document.getElementById('app'), template);
```

**Notes:**

- Typically used internally by `defineComponent()`
- Performs efficient DOM diffing (no full re-render)
- Preserves focus and input state when possible

---

## Type Definitions

While front.js is written in JavaScript, TypeScript definitions can be generated from JSDoc comments. The API is designed to be type-safe:

```typescript
// Conceptual TypeScript types (not actual implementation)
type Val<T> = {
  (): T;
  (value: T): T;
  peek(): T;
};

function val<T>(initialValue: T): Val<T>;
function run(fn: () => void): () => void;
function calc<T>(fn: () => T): () => T;
function defineComponent(renderFn: () => TemplateResult, container: HTMLElement): void;
function register(name: string, componentFn: (props: any) => () => TemplateResult): void;
function hydrate(root?: HTMLElement): void;
```

---

## Error Handling

front.js implements comprehensive error handling:

- **Value errors**: Subscriber errors are logged but don't break other subscribers
- **Run errors**: Errors are logged with context, run continues
- **Component errors**: Rendering errors show fallback text instead of blank UI
- **Hydration errors**: Invalid islands are logged and skipped, others continue

All errors include `[front.js]` prefix for easy filtering in console.

---

## Security Considerations

1. **No eval**: Never uses `eval()` or `new Function()` - only `JSON.parse()` for props
2. **XSS protection**: uhtml automatically escapes all template values
3. **Component name validation**: Only alphanumeric names allowed (prevents injection)
4. **Props serialization**: Props must be JSON-serializable (no functions or symbols)

---

## Examples

See the [`examples/`](../examples/) directory for complete working examples.
