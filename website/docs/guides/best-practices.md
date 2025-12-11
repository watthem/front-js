# Front.js Best Practices

> **Status:** Draft for v0.0.3  
> **Audience:** Developers building with Front.js

This guide covers best practices for building robust, maintainable applications with Front.js.

## 1. Hydration Boundaries and Island Sizing

<!-- TODO: When to create islands -->
<!-- How to determine island boundaries -->
<!-- Avoiding too-large or too-small islands -->
<!-- Performance considerations -->

### Guidelines

- Keep islands focused on a single interactive concern
- Avoid wrapping entire pages in islands
- Consider progressive enhancement patterns

## 2. State Ownership

<!-- TODO: Where to keep val() -->
<!-- Local vs shared state patterns -->
<!-- Avoiding accidental global state -->

### Local State

```javascript
// TODO: Example of local component state
```

### Shared State Patterns

```javascript
// TODO: Patterns for sharing state between islands
```

### Anti-patterns

```javascript
// TODO: Common mistakes with state ownership
```

## 3. Cleanup and Lifecycle

<!-- TODO: Using onCleanup() -->
<!-- When cleanup is necessary -->
<!-- Common cleanup scenarios: timers, listeners, subscriptions -->

### Using onCleanup()

```javascript
// TODO: onCleanup() examples
```

### Manual Cleanup with _front_dispose

```javascript
// TODO: When to use _front_dispose directly
```

## 4. Event Isolation

<!-- TODO: Event handling patterns -->
<!-- Avoiding event delegation issues -->
<!-- Integration with macro frameworks -->

## 5. Avoiding Server Closures and Serialized Functions

<!-- TODO: Why server closures are dangerous -->
<!-- How to pass data safely via JSON -->
<!-- What NOT to do examples -->

### Bad Practices

```javascript
// TODO: Anti-patterns that break security model
```

### Good Practices

```javascript
// TODO: Correct patterns for server-client communication
```

## 6. Working with Macro Frameworks

<!-- TODO: HTMX, Turbo, Unpoly patterns -->
<!-- Cleanup integration -->
<!-- Re-hydration patterns -->

### HTMX

```javascript
// TODO: HTMX best practices
```

### Turbo

```javascript
// TODO: Turbo best practices
```

## 7. Performance Considerations

<!-- TODO: Bundle size awareness -->
<!-- Lazy loading patterns -->
<!-- Avoiding unnecessary reactivity -->
<!-- When to use calc() vs run() -->

### Reactivity Performance

- Use `val.peek()` to read without subscribing
- Avoid deep reactivity chains
- Consider batching updates

## 8. Development vs Production

<!-- TODO: Using dev-mode warnings -->
<!-- How to debug reactive issues -->
<!-- Production build considerations -->

## 9. Testing Islands

<!-- TODO: Testing strategies -->
<!-- Unit testing components -->
<!-- Integration testing with hydration -->

## 10. Common Pitfalls

<!-- TODO: List of common mistakes and solutions -->

### Pitfall 1: Defining val() outside components

<!-- TODO: Explanation and solution -->

### Pitfall 2: Not cleaning up side effects

<!-- TODO: Explanation and solution -->

### Pitfall 3: Breaking hydration contract

<!-- TODO: Explanation and solution -->

---

**See also:**
- [Security Guide](./security.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Integrations Guide](./integrations.md)
