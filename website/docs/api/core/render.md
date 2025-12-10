## Functions

<dl>
<dt><a href="#html">html(strings, ...values)</a> ⇒ <code>*</code></dt>
<dd><p>Template tag function for creating HTML templates.
Currently delegates to uhtml, but can be swapped to another renderer.</p>
<p>IMPORTANT: This returns a template OBJECT, not a string.</p>
<ul>
<li>Use with render(): render(container, html<code>&lt;div&gt;...&lt;/div&gt;</code>)</li>
<li>DO NOT use with string APIs: insertAdjacentHTML, innerHTML, etc.</li>
<li>For HTML strings, use plain template literals: <code>&lt;div&gt;...&lt;/div&gt;</code></li>
</ul>
</dd>
<dt><a href="#render">render(container, template)</a></dt>
<dd><p>Renders a template into a DOM container.
Currently delegates to uhtml, but can be swapped to another renderer.</p>
<p>Uses efficient DOM diffing to minimize reflows and repaints.</p>
<p>IMPORTANT: Only accepts template objects from html tag, NOT strings.</p>
<ul>
<li>CORRECT: render(container, html<code>&lt;div&gt;...&lt;/div&gt;</code>)</li>
<li>WRONG: render(container, <code>&lt;div&gt;...&lt;/div&gt;</code>) or render(container, &#39;<div>...</div>&#39;)</li>
</ul>
</dd>
</dl>

<a name="html"></a>

## html(strings, ...values) ⇒ <code>\*</code>
Template tag function for creating HTML templates.
Currently delegates to uhtml, but can be swapped to another renderer.

IMPORTANT: This returns a template OBJECT, not a string.
- Use with render(): render(container, html`<div>...</div>`)
- DO NOT use with string APIs: insertAdjacentHTML, innerHTML, etc.
- For HTML strings, use plain template literals: `<div>...</div>`

**Kind**: global function  
**Returns**: <code>\*</code> - Template object (opaque, for use with render() only)  

| Param | Type | Description |
| --- | --- | --- |
| strings | <code>TemplateStringsArray</code> | Template literal strings |
| ...values | <code>\*</code> | Interpolated values (auto-escaped by renderer) |

**Example**  
```js
// CORRECT: Use html tag with render()
const template = html`<div>${userInput}</div>`;
render(container, template);
```
**Example**  
```js
// WRONG: html tag with string API
element.insertAdjacentHTML('beforeend', html`<div>...</div>`); // "[object Object]"
```
**Example**  
```js
// CORRECT: Plain template literal for strings
element.insertAdjacentHTML('beforeend', `<div>...</div>`); // Works
```
<a name="render"></a>

## render(container, template)
Renders a template into a DOM container.
Currently delegates to uhtml, but can be swapped to another renderer.

Uses efficient DOM diffing to minimize reflows and repaints.

IMPORTANT: Only accepts template objects from html tag, NOT strings.
- CORRECT: render(container, html`<div>...</div>`)
- WRONG: render(container, `<div>...</div>`) or render(container, '<div>...</div>')

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | Target DOM element |
| template | <code>\*</code> | Template object (from html() tag function) |

**Example**  
```js
const container = document.getElementById('app');
render(container, html`<div>Hello</div>`);
```
