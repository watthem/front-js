# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

`front.js` is a <5KB secure-by-default JavaScript micro-framework enforcing Islands Architecture. The framework provides fine-grained reactivity via values (val/run/calc) and hydrates server-rendered HTML with client-side interactivity. Security is paramount: no eval, no innerHTML, strict XSS protection via uhtml.

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm test                 # Run all tests with Vitest
npm run test:watch       # Run tests in watch mode
npm run build            # Build ESM and UMD bundles
npm run size-check       # Build and verify bundle stays under 5KB (gzipped)
npm run format           # Format code with Prettier
npm run lint             # Lint code with ESLint
npm run validate         # Run linting + filename validation
```

### Testing Specific Files
```bash
npm test -- tests/reactivity.test.js    # Run specific test file
npm test -- tests/security.test.js      # Run security tests
```

### Running Examples
```bash
npx serve .
# Navigate to http://localhost:3000/examples/index.html
```

### Code Generation for LLMs
```bash
npm run repomix          # Generate full codebase context
npm run repomix:dev      # Developer-focused context
npm run repomix:docs     # Documentation-focused context
npm run repomix:ai       # AI-optimized context
```

## Architecture Overview

### Core Principles
1. **HTML is Truth**: Server renders HTML, client hydrates islands
2. **Zero Magic**: Explicit component registration, no auto-importing
3. **Security First**: No eval, no new Function(), JSON-only data flow
4. **Platform First**: Use native browser APIs (ESM, tagged templates, native events)
5. **Headless Reactivity**: Reactivity system is DOM-agnostic

### Module Structure
```
src/
├── core/
│   ├── reactivity.js    # val/run/calc primitives (DOM-agnostic)
│   ├── component.js     # Component wrapper + run binding
│   └── client.js        # Component registry + hydration algorithm
└── index.js             # Public API exports + uhtml re-exports
```

**CRITICAL**: `core/reactivity.js` must NEVER import DOM APIs or uhtml. It's headless by design.

### Reactivity System
- **`val(initialValue)`**: Fine-grained reactive primitive with auto-dependency tracking
  - Acts as getter (no args) and setter (with arg)
  - `.peek()` method for non-reactive reads
  - Shallow equality check prevents unnecessary updates

- **`run(fn)`**: Auto-subscribes to values read during execution
  - Uses global `currentRun` to track active run context
  - Executes immediately on creation
  - Can return cleanup function for side effects (timers, listeners)
  - Isolated error handling (one run failure doesn't break others)

- **`calc(fn)`**: Derived read-only value
  - Internally uses val + run
  - Caches value, only recalculates when dependencies change

**Dependency tracking**: When a value is read inside a run, it adds the run to its subscribers Set. On value update, all subscribers are notified.

### Component Model
Components are higher-order functions:
```javascript
function MyComponent(props) {
  // Setup phase: create values, calculated values
  const state = val(props.initialValue);
  
  // Return render function
  return () => html`<div>${state()}</div>`;
}
```

`defineComponent(renderFn, container)` wraps the render function in a run that auto-reruns on value changes, passing the template to uhtml's render function for efficient DOM diffing.

### Hydration System
**Component Registration**: `register(name, componentFn)` - name must match `/^[a-zA-Z0-9_-]+$/`

**Hydration Algorithm**:
1. Query all `[data-island]` elements
2. For each island:
   - Extract `data-component` name and validate (alphanumeric only)
   - Parse `data-props` JSON (graceful failure on invalid JSON)
   - Lookup component in registry
   - Initialize: `renderFn = componentFn(props)`
   - Bind to DOM: `defineComponent(renderFn, island)`
   - Remove `data-island` marker

**Security**: All validation errors are logged and skipped (non-fatal), preventing one bad island from breaking the entire page.

## Critical Constraints

### Size Budget
- **Hard limit**: <5KB minified + gzipped (excluding uhtml peer dependency)
- Enforced via `npm run size-check` which fails CI if exceeded
- Build config: `build.config.js` uses esbuild with target es2020

### Security Requirements
1. **Never use eval or new Function()** - only JSON.parse() for props
2. **Validate component names** - alphanumeric + underscore/hyphen only
3. **All user content auto-escaped** - handled by uhtml templates
4. **Zero-trust hydration** - invalid islands are logged and skipped
5. **No string-to-function conversion** - event handlers are native functions

### Dependencies
- **Runtime**: ZERO dependencies (uhtml is peer dependency)
- **Dev dependencies**: esbuild, vitest, jsdom, prettier, eslint
- **DO NOT add new runtime dependencies** without approval
- uhtml is the only allowed runtime exception (for secure templating)

## Development Guidelines

### File Organization
Per user rules, markdown files belong in `docs/` folder except for standard GitHub community files (README.md, CONTRIBUTING.md, etc.)

### Code Style
- Use ES modules (`import`/`export`)
- Add JSDoc comments for all public APIs
- Use descriptive variable names
- Keep functions small and focused
- Handle errors gracefully (non-fatal by design)

### Testing Strategy
Tests use Vitest with jsdom environment. Key test files:
- `tests/reactivity.test.js` - val/run/calc behavior
- `tests/component.test.js` - Component lifecycle
- `tests/client.test.js` - Hydration algorithm
- `tests/security.test.js` - XSS protection, injection attacks
- `tests/lifecycle.test.js` - Cleanup and disposal

### Alignment with Standards
When making changes, verify against:
1. **docs/BLUEPRINT.md** - Detailed architecture and implementation specs
2. **wiki/STANDARDS.md** - "North Star" principles (Headless Reactivity, Standard Schema alignment, Platform First)
3. **wiki/PRD.md** - Original product requirements

### Pre-commit Checklist
Before submitting changes:
1. Run `npm run validate` (lint + filename validation)
2. Run `npm test` to ensure tests pass
3. Verify bundle size with `npm run size-check`
4. Test manually with examples (Todo app)
5. Run `npm run format` to format code

### Manual Testing Checklist
Test the Todo app example against these criteria:
1. ✅ Adding todos updates the list
2. ✅ Typing in input doesn't lose focus (proves uhtml diffing works)
3. ✅ Initial state from `data-props` loads correctly
4. ✅ XSS protection: `<script>alert(1)</script>` displays as text

## Architectural Decisions

Major architectural changes require:
1. Discussion in GitHub issue first
2. Update to `docs/BLUEPRINT.md`
3. Alignment with `wiki/STANDARDS.md`
4. Size budget verification

## Future Standards Alignment

### Standard Schema
The framework is designed to support [Standard Schema](https://standardschema.dev) for validation. Any future validation APIs (e.g., props validation during hydration) should accept validators via the `~standard` property, not `instanceof ZodSchema`. This allows users to choose Valibot, Zod, or ArkType interchangeably.

### TC39 Signals
The reactivity API loosely aligns with the TC39 Signals Proposal. If the proposal becomes a browser standard, the internal engine should be swappable without breaking user code. Note: We use `val`/`run`/`calc` naming for developer clarity, not `signal`/`effect`.

## Integration Patterns

### Server-Rendered HTML
```html
<div
  data-island
  data-component="Counter"
  data-props='{"start": 10}'
></div>
```

### Client Component Registration
```javascript
import { html, val, register, hydrate } from 'front';

function Counter(props) {
  const count = val(props.start || 0);
  
  return () => html`
    <button onclick=${() => count(count() - 1)}>-</button>
    <span>${count()}</span>
    <button onclick=${() => count(count() + 1)}>+</button>
  `;
}

register('Counter', Counter);
hydrate();
```

### Lifecycle Cleanup
```javascript
function Timer(props) {
  const seconds = val(0);
  
  run(() => {
    const interval = setInterval(() => {
      seconds(seconds() + 1);
    }, 1000);
    
    // Cleanup when run re-executes or component disposes
    return () => clearInterval(interval);
  });
  
  return () => html`<div>Time: ${seconds()}s</div>`;
}
```

### HTMX Integration
Components can be manually disposed via `container._front_dispose()`:
```javascript
document.body.addEventListener('htmx:beforeSwap', (event) => {
  const island = event.detail.target.querySelector('[data-island]');
  if (island && island._front_dispose) {
    island._front_dispose(); // Runs cleanup functions
  }
});
```
