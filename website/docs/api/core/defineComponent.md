<a name="defineComponent"></a>

## defineComponent(renderFn, container) ⇒ <code>function</code>
Defines a component by binding its render function to a run.
The component will automatically re-render when any values it reads change.
Returns a dispose function and attaches it to container._front_dispose for cleanup.

**Kind**: global function  
**Returns**: <code>function</code> - - Dispose function to stop rendering and cleanup runs  

| Param | Type | Description |
| --- | --- | --- |
| renderFn | <code>function</code> | Function that returns a uhtml template |
| container | <code>HTMLElement</code> | DOM element to render into |

**Example**  
```js
const renderFn = () => html`<div>Hello</div>`;
const dispose = defineComponent(renderFn, document.getElementById('app'));
// Later: dispose() to cleanup
```
