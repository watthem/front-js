## Functions

<dl>
<dt><a href="#val">val(initialValue)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a reactive value that tracks dependencies and notifies subscribers on changes.</p>
</dd>
<dt><a href="#run">run(fn)</a> ⇒ <code>function</code></dt>
<dd><p>Runs code that automatically re-executes when any values it reads change.
Runs are isolated - if one fails, others continue to run.
The run function can return a cleanup function that runs before re-execution or disposal.</p>
</dd>
<dt><a href="#calc">calc(fn)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a calculated (derived) value that automatically updates when dependencies change.</p>
</dd>
</dl>

<a name="val"></a>

## val(initialValue) ⇒ <code>function</code>
Creates a reactive value that tracks dependencies and notifies subscribers on changes.

**Kind**: global function  
**Returns**: <code>function</code> - - Value function that acts as getter/setter  

| Param | Type | Description |
| --- | --- | --- |
| initialValue | <code>\*</code> | Initial value for the value |

**Example**  
```js
const count = val(0);
count(); // getter: returns 0
count(5); // setter: updates to 5
count.peek(); // non-reactive read
```
<a name="run"></a>

## run(fn) ⇒ <code>function</code>
Runs code that automatically re-executes when any values it reads change.
Runs are isolated - if one fails, others continue to run.
The run function can return a cleanup function that runs before re-execution or disposal.

**Kind**: global function  
**Returns**: <code>function</code> - - Dispose function to stop the run and execute cleanup  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to execute reactively. Can return a cleanup function. |

**Example**  
```js
run(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer); // Cleanup function
});
```
<a name="calc"></a>

## calc(fn) ⇒ <code>function</code>
Creates a calculated (derived) value that automatically updates when dependencies change.

**Kind**: global function  
**Returns**: <code>function</code> - - Read-only getter function  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function that calculates the derived value |

**Example**  
```js
const doubled = calc(() => count() * 2);
doubled(); // returns current calculated value
```
