---
name: Ruthless API Rename
overview: Rename the reactivity API from academic terms (`signal`, `effect`, `computed`) to the "3-Letter Ruthless" system (`val`, `run`, `calc`) that describes what the code does, not how it works internally.
todos:
  - id: core-rename
    content: "Rename functions in src/core/reactivity.js: signal→val, effect→run, computed→calc, and update internal variable currentEffect→currentRun"
    status: completed
  - id: component-update
    content: Update src/core/component.js to use run instead of effect
    status: completed
  - id: index-exports
    content: Update src/index.js exports to val, run, calc
    status: completed
  - id: test-files
    content: Update all test files (reactivity.test.js, lifecycle.test.js, component.test.js, security.test.js, client.test.js) with new names
    status: completed
  - id: example-files
    content: Update example files (todo-app.js, gm-board.js) and examples/README.md
    status: completed
  - id: api-docs
    content: Update docs/API.md with complete new API reference
    status: completed
  - id: other-docs
    content: Update all other documentation files (BLUEPRINT.md, STANDARDS.md, OPTION_4.md, CLAUDE.md, README.md, etc.)
    status: completed
  - id: error-messages
    content: Update all error message strings and JSDoc comments throughout codebase
    status: completed
---

# Ruthless API Rename: signal → val, effect → run, computed → calc

## Philosophy

Replace academic/jargon-heavy naming with intuitive, action-oriented names that describe what the developer is doing, not the internal mechanism.

## Changes Required

### Core Implementation Files

1. **`src/core/reactivity.js`**

- Rename `signal()` → `val()`
- Rename `effect()` → `run()`
- Rename `computed()` → `calc()`
- Rename internal variable `currentEffect` → `currentRun`
- Update all JSDoc comments and error messages
- Update function parameter names in documentation

2. **`src/core/component.js`**

- Update import: `effect` → `run`
- Update usage: `effect(() => ...)` → `run(() => ...)`
- Update comments referencing "effect"

3. **`src/index.js`**

- Update exports: `signal, effect, computed` → `val, run, calc`

### Test Files

4. **`tests/reactivity.test.js`**

- Update imports: `signal, effect, computed` → `val, run, calc`
- Rename all test describe blocks: `'signal'` → `'val'`, `'effect'` → `'run'`, `'computed'` → `'calc'`
- Update all function calls throughout tests
- Update error message assertions (e.g., "Error in effect" → "Error in run")

5. **`tests/lifecycle.test.js`**

- Update imports: `effect, signal` → `run, val`
- Update all function calls
- Update describe block: `'Effect cleanup'` → `'Run cleanup'`
- Update error message assertions

6. **`tests/component.test.js`**

- Update import: `signal` → `val`
- Update all function calls

7. **`tests/security.test.js`**

- Update import: `signal` → `val`
- Update all function calls

8. **`tests/client.test.js`**

- Update import: `signal` → `val`
- Update all function calls

### Example Files

9. **`examples/todo-app.js`**

- Update import: `signal` → `val`
- Update all `signal()` calls to `val()`
- Update comments referencing "Signal-based"

10. **`examples/gm-board.js`**

- Update import: `signal, computed, effect` → `val, calc, run`
- Update all function calls
- Update comments (e.g., "Using effect-based lifecycle" → "Using run-based lifecycle")

11. **`examples/README.md`**

- Update references: "Signal-based reactivity" → "Value-based reactivity" or similar

### Documentation Files

12. **`docs/API.md`**

- Replace entire "Reactivity Primitives" section
- `signal(initialValue)` → `val(initialValue)`
- `effect(fn)` → `run(fn)`
- `computed(fn)` → `calc(fn)`
- Update all code examples
- Update all notes and descriptions

13. **`docs/BLUEPRINT.md`**

- Search and replace all references to old names
- Update code examples
- Update architecture descriptions

14. **`docs/STANDARDS.md`**

- Update reference: "Our `signal` and `effect` primitives" → "Our `val` and `run` primitives"
- Add note about prioritizing intuitive naming over TC39 Signals alignment
- Update any code examples

15. **`docs/OPTION_4.md`**

- Update references to `effect` → `run`
- Update code examples

16. **`docs/GM_BOARD_FEEDBACK.md`**

- Update any code examples or references

17. **`docs/PRD.md`**

- Update any references to old API names

18. **`CLAUDE.md`**

- Update all references in the Reactivity System section
- Update code examples
- Update function names in documentation

19. **`README.md`**

- Update code examples
- Update feature descriptions

### Internal Comments & Error Messages

20. **Error message strings** (in `reactivity.js`):

- `'[front.js] Error in effect:'` → `'[front.js] Error in run:'`
- `'[front.js] Error in effect cleanup:'` → `'[front.js] Error in run cleanup:'`
- `'[front.js] Error disposing effect:'` → `'[front.js] Error disposing run:'`
- `'effect() requires a function argument.'` → `'run() requires a function argument.'`
- `'computed() requires a function argument.'` → `'calc() requires a function argument.'`

21. **JSDoc comments** throughout:

- Update all parameter descriptions
- Update all return type descriptions
- Update all examples

## Implementation Order

1. Core implementation (`reactivity.js`, `component.js`, `index.js`)
2. Tests (verify functionality)
3. Examples (verify usage)
4. Documentation (complete the change)

## Verification

After changes:

- Run `npm test` to ensure all tests pass
- Verify examples still work
- Check bundle size hasn't changed (should be identical)
- Review all documentation for consistency