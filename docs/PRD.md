# Product Requirements Document (PRD): front.js

## 1. Mission Statement

Build a lightweight (<5KB core), secure-by-default JavaScript micro-framework that enforces the "Islands Architecture." It acts as a thin glue layer between server-rendered HTML and client-side interactivity, preventing the "leaky abstractions" and security risks associated with modern isomorphic server components.

## 2. Core Philosophy

1.  **HTML is Truth:** The server renders HTML. The client hydrates only specific "islands."
2.  **Explicit Data Boundaries:** Data passes from Server to Client **only** via serialized JSON in DOM attributes (`data-props`). No function closures, no hidden server scope.
3.  **Zero Magic:** No build steps required for the runtime. Uses standard ESM.
4.  **Platform Native:** Outsourced rendering to `uhtml` (microlibrary) to handle sanitization and DOM diffing; outsourced events to native DOM events.

## 3. Technical Stack & Dependencies

- **Language:** Vanilla JavaScript (ESM).
- **Rendering Engine:** `uhtml` (must be used for DOM patching and XSS protection).
- **Reactivity:** Custom fine-grained vals (implementation details below).
- **Build Tooling:** Optional. The core must run directly in the browser via `<script type="module">`.

## 4. Functional Requirements

### 4.1 Reactivity Engine (`src/core/reactivity.js`)

- Must implement `val(initial)`: Returns getter/setter/peek object.
- Must implement `run(fn)`: Auto-subscribes to vals read during execution.
- Must implement `calc(fn)`: Read-only val derived from others.
- **Constraint:** Implementation must be minimal and dependency-free.

### 4.2 Component Model (`src/core/component.js`)

- Components are functions: `(props) => () => html\`template\``.
- Must bind the component's render function to an `run` to auto-update on val changes.
- Must delegate actual DOM updates to `uhtml.render`.

### 4.3 Hydration & Entry (`src/client.js`)

- **Registry:** A method to register component functions by name.
- **Hydrate:** A function that:
  1.  Scans DOM for `[data-island]`.
  2.  Reads `data-component` name.
  3.  **Securely** parses `data-props` (JSON.parse only).
  4.  Initializes the component in that DOM slot.

## 5. Security Requirements (Critical)

- **No `eval` or `new Function`:** Never execute strings from the DOM.
- **Sanitization:** All dynamic values in templates must be escaped by `uhtml` by default.
- **Serialization:** Props must be strictly serializable (JSON).

## 6. Success Metrics (The "Todo App" Test)

The framework is successful if a developer can build a "Todo List" where:

1.  Adding a todo updates the list.
2.  Typing in the input does **not** lose focus (proving `uhtml` diffing works).
3.  Refreshing the page (simulated server render) loads initial state from `data-props`.

## 7. Deliverables Structure

- `docs/BLUEPRINT.md`: The architectural map.
- `src/`: Source code.
- `examples/`: A working Todo app usage example.
- `README.md`: usage instructions.
