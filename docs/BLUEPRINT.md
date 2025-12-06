# BLUEPRINT: front.js Engineering Architecture

**Version:** 1.0  
**Status:** Draft for Review  
**Date:** 2025-12-06

---

## 1. Overview

This document translates the PRD into an actionable engineering plan for front.js — a <5KB micro-framework enforcing Islands Architecture with secure-by-default principles.

### 1.1 Core Principles Recap

- **HTML is Truth**: Server renders HTML, client hydrates islands
- **Explicit Boundaries**: Data flows server→client via JSON in `data-props`
- **Zero Magic**: Runs directly in browser via ESM, no build required
- **Security First**: No eval, no innerHTML, strict XSS protection via uhtml

---

## 2. Project Structure

```
front-js/
├── docs/
│   ├── BLUEPRINT.md              # This file
│   ├── ENGINE.md                 # Reactivity engine implementation
│   └── DESIGN.md                 # Design decisions
├── wiki/
│   ├── API.md                    # API reference
│   ├── PRD.md                    # Product requirements
│   ├── STANDARDS.md              # Architectural standards
│   ├── FAQ.md                    # Frequently asked questions
│   └── TRANSLATIONS.md           # React migration guide
├── src/
│   ├── core/
│   │   ├── reactivity.js         # val/run/calc primitives
│   │   └── component.js          # Component wrapper + run binding
│   ├── client.js                 # Main entry: registry + hydrate
│   └── index.js                  # Public API exports
├── examples/
│   ├── index.html                # Todo app demo
│   └── todo-app.js               # Todo component implementation
├── tests/
│   └── (future: unit tests)
├── package.json                  # ESM module config
├── README.md                     # Quickstart guide
└── CONTRIBUTING.md               # Development standards
```

---

## 3. Reactivity System Design (`src/core/reactivity.js`)

### 3.1 Val Implementation

**Purpose**: Fine-grained reactive primitive that tracks dependencies automatically.

**API Surface**:

```javascript
const counter = val(0);
counter(); // getter: returns 0
counter(5); // setter: updates to 5
counter.peek(); // non-reactive read
```

**Internal Logic**:

```
val(initialValue):
  1. Create closure with internal state = initialValue
  2. Maintain Set of subscribers (run functions)
  3. On READ (getter):
     - If currentRun exists globally, add to subscribers
     - Return current state
  4. On WRITE (setter):
     - Update internal state
     - Notify all subscribers by re-executing them
  5. peek() returns state without subscribing
```

**Data Structures**:

- `currentRun`: Global variable tracking active run
- `subscribers`: WeakSet or Set per val (prevents memory leaks)

### 3.2 Run Implementation

**Purpose**: Auto-subscribes to any vals read during execution. Can return cleanup function.

**API Surface**:

```javascript
const dispose = run(() => {
  console.log(counter()); // auto-subscribes to counter
  return () => console.log('cleanup'); // optional cleanup
});
```

**Internal Logic**:

```
run(fn):
  1. Create wrapper function that:
     a. Run previous cleanup if exists
     b. Set global currentRun = wrapper
     c. Execute fn() and capture cleanup return value
     d. Clear global currentRun
  2. Execute wrapper immediately (initial run)
  3. Return dispose function for manual cleanup
```

### 3.3 Calc Implementation

**Purpose**: Derived read-only val.

**API Surface**:

```javascript
const doubled = calc(() => counter() * 2);
doubled(); // returns current value
```

**Internal Logic**:

```
calc(fn):
  1. Create val for cached value
  2. Wrap in run that:
     - Executes fn()
     - Updates internal val
  3. Return read-only getter (no setter)
```

---

## 4. Component Model (`src/core/component.js`)

### 4.1 Component Function Signature

**Pattern**: Higher-order function returning render function.

```javascript
function MyComponent(props) {
  // Setup: create vals, calc values
  const count = val(props.initialCount || 0);

  // Return render function
  return () => html`
    <div>
      <p>Count: ${count()}</p>
      <button onclick=${() => count(count() + 1)}>+</button>
    </div>
  `;
}
```

### 4.2 Component Wrapper Logic

**Purpose**: Bind render function to run for auto-updates.

**Implementation**:

```
defineComponent(renderFn, container):
  1. Create run that:
     - Calls renderFn() to get template
     - Passes template to uhtml.render(container, template)
  2. Run auto-reruns when any val in renderFn changes
  3. uhtml handles DOM diffing (no full re-render)
```

**Why this works**:

- Run subscribes to all vals read in `renderFn()`
- When val updates → run re-runs → new template → uhtml diffs → minimal DOM update

---

## 5. Hydration System (`src/client.js`)

### 5.1 Component Registry

**Purpose**: Map component names to functions.

```javascript
const componentRegistry = new Map();

export function register(name, componentFn) {
  componentRegistry.set(name, componentFn);
}
```

### 5.2 Hydration Algorithm

**Entry Point**:

```javascript
export function hydrate(rootElement = document.body) {
  // Implementation below
}
```

**Step-by-Step Logic**:

```
hydrate(rootElement):
  1. Query all islands:
     islands = rootElement.querySelectorAll('[data-island]')

  2. For each island:
     a. Extract metadata:
        componentName = island.dataset.component
        propsJSON = island.dataset.props || '{}'

     b. Security validation:
        - Verify componentName is alphanumeric (no injection)
        - Try-catch JSON.parse(propsJSON)
        - If parse fails: log error, skip island

     c. Lookup component:
        componentFn = componentRegistry.get(componentName)
        if (!componentFn): log warning, skip

     d. Initialize component:
        renderFn = componentFn(props)
        defineComponent(renderFn, island)

     e. Remove hydration marker:
        island.removeAttribute('data-island')
```

**Security Checks**:

- **No eval**: Only `JSON.parse()` is used
- **Malformed JSON**: Graceful failure with console warning
- **Unknown components**: Logged but non-fatal

---

## 6. Public API (`src/index.js`)

**Exports**:

```javascript
// Reactivity primitives
export { val, run, calc } from './core/reactivity.js';

// Component utilities
export { defineComponent } from './core/component.js';

// Client hydration
export { register, hydrate } from './client.js';

// Re-export uhtml for convenience
export { html, render } from 'uhtml';
```

---

## 7. Security Verification Plan

### 7.1 XSS Protection Matrix

| Attack Vector            | Mitigation              | Verification Method                        |
| ------------------------ | ----------------------- | ------------------------------------------ |
| User input in template   | uhtml auto-escapes      | Render `<script>alert(1)</script>` as text |
| Malicious props JSON     | JSON.parse only         | Try `data-props="alert(1)"` → fails safely |
| Component name injection | Alphanumeric validation | Try `data-component="../../../etc/passwd"` |
| Event handler injection  | Native DOM events       | No string-to-function conversion           |

### 7.2 Test Cases

**Test 1: Template Injection**

```javascript
const userInput = val('<img src=x onerror=alert(1)>');
// Expected: Renders as text, no script execution
```

**Test 2: Props Injection**

```html
<div data-island data-component="Todo" data-props='{"title":"<script>alert(1)</script>"}'></div>
<!-- Expected: Title displayed as text -->
```

**Test 3: Malformed Props**

```html
<div data-island data-component="Todo" data-props="invalid json"></div>
<!-- Expected: Console error, island skipped, no crash -->
```

---

## 8. Todo App Example Specification

### 8.1 Server-Rendered HTML (`examples/index.html`)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>front.js - Todo Demo</title>
  </head>
  <body>
    <h1>Todo List (front.js)</h1>

    <!-- Island boundary -->
    <div data-island data-component="TodoApp" data-props='{"items":["Buy milk","Walk dog"]}'></div>

    <!-- Load uhtml from CDN -->
    <script type="importmap">
      {
        "imports": {
          "uhtml": "https://esm.sh/uhtml@4.5.11"
        }
      }
    </script>

    <!-- Load front.js + component -->
    <script type="module" src="./todo-app.js"></script>
  </body>
</html>
```

### 8.2 Component Implementation (`examples/todo-app.js`)

**Pseudocode**:

```javascript
import { html } from 'uhtml';
import { val } from '../src/index.js';
import { register, hydrate } from '../src/index.js';

function TodoApp(props) {
  // State
  const todos = val(props.items || []);
  const input = val('');

  // Actions
  const addTodo = () => {
    if (input().trim()) {
      todos([...todos(), input()]);
      input('');
    }
  };

  // Render
  return () => html`
    <div>
      <input value=${input()} oninput=${(e) => input(e.target.value)} placeholder="New todo..." />
      <button onclick=${addTodo}>Add</button>
      <ul>
        ${todos().map((todo) => html`<li>${todo}</li>`)}
      </ul>
    </div>
  `;
}

// Register and hydrate
register('TodoApp', TodoApp);
hydrate();
```

### 8.3 Success Criteria

1. **Add Todo**: Clicking "Add" appends item to list
2. **No Focus Loss**: Typing in input maintains focus (uhtml diffing works)
3. **Hydration**: Initial items from `data-props` appear on load
4. **XSS Safe**: Adding `<script>alert(1)</script>` displays as text

---

## 9. File Size Budget

| Module                    | Target Size | Rationale                    |
| ------------------------- | ----------- | ---------------------------- |
| `reactivity.js`           | ~1.5KB      | Minimal val/run impl         |
| `component.js`            | ~0.5KB      | Thin wrapper around run      |
| `client.js`               | ~1KB        | Registry + hydration scanner |
| `index.js`                | ~0.2KB      | Re-exports only              |
| **Total (minified+gzip)** | **<3.5KB**  | Excluding uhtml (~2KB)       |

---

## 10. Development Roadmap

### Phase 1: Core Implementation

1. Implement `reactivity.js` (val/run/calc)
2. Implement `component.js` (defineComponent)
3. Implement `client.js` (register/hydrate)
4. Create public API in `index.js`

### Phase 2: Example & Validation

1. Create `examples/index.html` with server-rendered HTML
2. Create `examples/todo-app.js` component
3. Manually test Todo app against success criteria
4. Verify XSS protection with malicious inputs

### Phase 3: Documentation

1. Generate `README.md` with quickstart
2. Generate `CONTRIBUTING.md` with standards
3. Generate `wiki/API.md` with full reference

### Phase 4: Polish (Future)

1. Add TypeScript definitions
2. Add unit tests
3. Performance benchmarks
4. CDN distribution setup

---

## 11. Open Questions & Decisions

### 11.1 uhtml Import Strategy

**Decision**: Use import maps for examples (as shown above).  
**Rationale**: Works in modern browsers without bundler, aligns with "zero magic" principle.

### 11.2 Effect Cleanup

**Decision**: Not implemented in v1.  
**Rationale**: Todo app doesn't require unmounting. Can add later if needed.

### 11.3 Component Props Reactivity

**Decision**: Props are passed once during hydration, not reactive.  
**Rationale**: Server-rendered islands have static initial state. Internal vals handle updates.

### 11.4 Multiple Islands of Same Component

**Decision**: Supported by design (querySelectorAll handles multiple).  
**Rationale**: Natural use case (e.g., multiple comment widgets on a blog).

---

## 12. Alignment Verification

### PRD → Blueprint Mapping

| PRD Requirement        | Blueprint Section        | Status       |
| ---------------------- | ------------------------ | ------------ |
| <5KB core              | §9 File Size Budget      | ✓ Planned    |
| uhtml for rendering    | §6 Public API            | ✓ Integrated |
| Signals implementation | §3 Reactivity System     | ✓ Detailed   |
| Component model        | §4 Component Model       | ✓ Detailed   |
| Hydration algorithm    | §5 Hydration System      | ✓ Detailed   |
| No eval/new Function   | §7 Security Verification | ✓ Enforced   |
| Todo app test          | §8 Todo App Example      | ✓ Specified  |
| Islands architecture   | §5.2 Hydration Algorithm | ✓ Enforced   |

---

## 13. Next Steps

**For Human Review**:

1. Verify reactivity logic (§3) matches mental model
2. Confirm component pattern (§4) is ergonomic
3. Validate security approach (§7) is sufficient
4. Approve file structure (§2)

**After Approval**:

1. Scaffold all files in §2 structure
2. Implement code per pseudocode specifications
3. Create working Todo example
4. Generate README and CONTRIBUTING docs

---

**End of Blueprint**
