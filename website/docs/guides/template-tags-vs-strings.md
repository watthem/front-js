# Template Tags vs Template Literals

## TL;DR

- **`html` tag** (`` html`...` ``) → Returns a **template object** → Use with `render()`
- **Plain literal** (`` `...` ``) → Returns a **string** → Use with `insertAdjacentHTML`, `innerHTML`, etc.

---

## The Distinction

### Template Tag (html)

The `html` template tag is a **function** that processes template literals:

```javascript
import { html, render } from '@frontjs/core';

// This returns a uhtml template OBJECT, not a string
const template = html`<div>Hello, ${name}</div>`;

// Use with render() for efficient DOM diffing
render(container, template);
```

**Returns:** Template object (opaque internal representation)
**Use with:** `render()` function only

---

### Plain Template Literal

Plain template literals (without a tag) return **strings**:

```javascript
// This returns a plain HTML STRING
const htmlString = `<div>Hello, ${name}</div>`;

// Use with string-based DOM APIs
element.insertAdjacentHTML('beforeend', htmlString);
element.innerHTML = htmlString;
```

**Returns:** String
**Use with:** `insertAdjacentHTML`, `innerHTML`, `outerHTML`, etc.

---

## Common Mistake

```javascript
// ❌ WRONG: Using html tag with string API
const template = html`<div>Count: ${count()}</div>`;
element.insertAdjacentHTML('beforeend', template);
// Result: "[object Object]" (object coerced to string)
```

```javascript
// ✅ CORRECT: Use plain template literal
const htmlString = `<div>Count: ${count()}</div>`;
element.insertAdjacentHTML('beforeend', htmlString);
// Result: Properly rendered HTML
```

---

## When to Use Each

| Use Case                  | Use `html` tag        | Use plain literal           |
| ------------------------- | --------------------- | --------------------------- |
| Rendering with `render()` | ✅ Yes                | ❌ No                       |
| Component return value    | ✅ Yes                | ❌ No                       |
| `insertAdjacentHTML`      | ❌ No                 | ✅ Yes                      |
| `innerHTML` / `outerHTML` | ❌ No                 | ✅ Yes                      |
| String concatenation      | ❌ No                 | ✅ Yes                      |
| XSS protection needed     | ✅ Yes (auto-escapes) | ⚠️ Manual escaping required |

---

## Why the Distinction Matters

### html tag advantages:

1. **XSS Protection:** Values are automatically escaped
2. **DOM Diffing:** Efficient updates (only changes what's needed)
3. **Event Binding:** Direct function references (not string handlers)

### Plain literal advantages:

1. **String Output:** Works with all string-based APIs
2. **Flexibility:** Can be manipulated as text before rendering
3. **No Dependency:** Standard JavaScript feature

---

## Front.js Component Pattern

In front.js components, **always return `html` tagged templates**:

```javascript
import { html, val, run } from '@frontjs/core';

function Counter(props) {
  const count = val(props.start || 0);

  // Component MUST return html-tagged template
  return () => html`
    <div>
      <button onclick=${() => count(count() - 1)}>-</button>
      <span>${count()}</span>
      <button onclick=${() => count(count() + 1)}>+</button>
    </div>
  `;
}
```

**Why:** The `render()` function in `defineComponent` expects a template object, not a string.

---

## Technical Details

Template tags in JavaScript are functions that receive:

1. An array of string literals
2. The interpolated values

They can return **anything** (not just strings):

```javascript
// Template tag function signature
function html(strings, ...values) {
  // Process and return a template object
  return uhtmlHtml(strings, ...values);
}

// This is why html`...` returns an object, not a string
```

---

## Summary

- **front.js uses `html` tag** for rendering with `render()`
- **Template objects ≠ HTML strings**
- **Use plain literals** when you need actual string output
- **The framework expects `html` tags** in component return values
