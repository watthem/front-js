# Core Enhancements – v0.0.3

## Scope

- New API: `onCleanup(fn)`
- Dev-mode warnings:
  - `val()` outside component
  - Non-JSON-serializable props
  - Misconfigured islands / missing data attributes
  - Component not returning a function

## Why

- Make lifecycle explicit (instead of relying solely on `_front_dispose`).
- Help new users avoid subtle bugs and leaks.
- Preserve <5KB runtime budget.

## Non-Goals

- No breaking changes to existing `val/run/calc` semantics.
- No new component model.
- No runtime overhead in production builds.

## Implementation Notes

### onCleanup()

- `onCleanup` must be safe to call inside component registration only.
- Should integrate with existing `_front_dispose` mechanism.
- Store cleanup callbacks in component context (possibly on the container or in a WeakMap).
- Execute all registered callbacks when component is disposed.

**Current architecture:**
- `defineComponent()` creates a `run()` that manages reactivity
- `run()` returns a dispose function
- This dispose function is attached to `container._front_dispose`

**Proposed:**
- Add context tracking during component initialization
- Store cleanup callbacks in an array associated with the component
- Call all cleanup callbacks when `_front_dispose` is invoked

### Dev-Mode Warnings

Warnings should be gated behind DEV checks and stripped from prod builds.

**DEV flag detection options:**
1. Check `process.env.NODE_ENV !== 'production'` (requires build tool)
2. Use a global `window.__FRONTJS_DEV__` flag
3. Check for presence of specific dev-only markers

**Warning scenarios:**

1. **val() outside component**: Detect if `val()` is called outside of any active component context
2. **Non-JSON-serializable props**: Check props during hydration for functions, symbols, etc.
3. **Missing data-island**: Warn if hydration finds components without proper island markers
4. **Component not returning function**: Already partially implemented, enhance messaging

## Testing Strategy

- Add tests for `onCleanup()` registration and execution
- Add tests for each dev warning scenario
- Mock DEV flag to test warnings don't appear in production mode
- Test cleanup callbacks execute in correct order (if order matters)

## Documentation Updates

- Add `onCleanup()` to API reference
- Add examples to best practices guide
- Document dev warnings and how to resolve them
- Update lifecycle documentation
