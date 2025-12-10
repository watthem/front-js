## Functions

<dl>
<dt><a href="#validateWithStandardSchema">validateWithStandardSchema(schema, data, context)</a> ⇒ <code>Object</code> | <code>Promise.&lt;{valid: boolean, value: *, issues: *}&gt;</code></dt>
<dd><p>Validates data using a Standard Schema compliant validator.</p>
</dd>
<dt><a href="#isValidComponentName">isValidComponentName(name)</a> ⇒ <code>boolean</code></dt>
<dd><p>Validates that a component name is alphanumeric (with optional underscores/hyphens).
Prevents injection attacks via component names.</p>
</dd>
<dt><a href="#register">register(name, componentFn, [options])</a></dt>
<dd><p>Registers a component function by name for hydration with optional schema validation.</p>
</dd>
<dt><a href="#hydrate">hydrate(root)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Hydrates all island components found in the DOM.
Supports async validation if schema returns a Promise.
Scans for elements with <code>data-island</code> attribute and initializes components.</p>
</dd>
</dl>

<a name="validateWithStandardSchema"></a>

## validateWithStandardSchema(schema, data, context) ⇒ <code>Object</code> \| <code>Promise.&lt;{valid: boolean, value: \*, issues: \*}&gt;</code>
Validates data using a Standard Schema compliant validator.

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>Promise.&lt;{valid: boolean, value: \*, issues: \*}&gt;</code> - - Validation result (sync or async)  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>Object</code> | Standard Schema validator with ~standard property |
| data | <code>\*</code> | Data to validate |
| context | <code>string</code> | Context string for error messages (e.g., component name) |

<a name="isValidComponentName"></a>

## isValidComponentName(name) ⇒ <code>boolean</code>
Validates that a component name is alphanumeric (with optional underscores/hyphens).
Prevents injection attacks via component names.

**Kind**: global function  
**Returns**: <code>boolean</code> - - True if valid, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Component name to validate |

<a name="register"></a>

## register(name, componentFn, [options])
Registers a component function by name for hydration with optional schema validation.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Component name (must be alphanumeric) |
| componentFn | <code>function</code> | Component function that accepts props and returns render function |
| [options] | <code>Object</code> | Configuration options |
| [options.schema] | <code>Object</code> | Standard Schema compliant validator |

<a name="hydrate"></a>

## hydrate(root) ⇒ <code>Promise.&lt;void&gt;</code>
Hydrates all island components found in the DOM.
Supports async validation if schema returns a Promise.
Scans for elements with `data-island` attribute and initializes components.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| root | <code>HTMLElement</code> | Root element to scan (defaults to document.body) |

