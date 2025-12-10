<a name="module_@frontjs/actions/server"></a>

## @frontjs/actions/server
Server-side router with Standard Schema validation

<a name="module_@frontjs/actions/server.createRouter"></a>

### @frontjs/actions/server.createRouter ⇒ <code>Object</code>
Creates a router that handles action requests with validation.

**Kind**: static constant of [<code>@frontjs/actions/server</code>](#module_@frontjs/actions/server)  
**Returns**: <code>Object</code> - Router with handle method  

| Param | Type | Description |
| --- | --- | --- |
| schemaMap | <code>Object</code> | Map of action names to Standard Schema validators |
| handlers | <code>Object</code> | Map of action names to handler functions |

**Example**  
```js
const router = createRouter(ActionSchema, {
  'todo:create': async (payload, ctx) => {
    return await db.todos.add(payload.text);
  }
});
await router.handle(request);
```
