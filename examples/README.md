# front.js Examples

This directory contains example implementations demonstrating front.js features.

> **Note:** Some examples illustrate advanced patterns that surface underlying limitations of uhtml/templates (e.g., nested array rendering in pixel-art). See [docs/LIMITATIONS.md](../docs/LIMITATIONS.md) for guidance and workarounds.

## Todo App

The `todo-app.js` example demonstrates:

- **Value-based reactivity**: State management with `val()`
- **Component hydration**: Server-rendered HTML with `data-props` initialization
- **Reactive rendering**: Automatic UI updates when values change
- **XSS protection**: Malicious input is automatically escaped by uhtml

### Running the Example

1. Start a local server:
   ```bash
   npx serve .
   ```

2. Navigate to `http://localhost:3000/examples/index.html`

### Success Criteria

The Todo app validates that front.js works correctly:

1. ✅ **Adding todos**: Clicking "Add Todo" or pressing Enter appends items to the list
2. ✅ **No focus loss**: Typing in the input maintains focus (proves uhtml diffing works)
3. ✅ **Server hydration**: Initial items from `data-props` appear on page load
4. ✅ **XSS safety**: Adding `<script>alert(1)</script>` displays as text, not executed

### Testing XSS Protection

Try adding this as a todo item:
```html
<script>alert('XSS')</script>
```

It should display as plain text, not execute JavaScript. This proves uhtml's automatic escaping works.

