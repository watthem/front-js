<a name="module_@frontjs/actions/client"></a>

## @frontjs/actions/client
Client-side wrapper for type-safe RPC calls

<a name="module_@frontjs/actions/client.createClient"></a>

### @frontjs/actions/client.createClient ⇒ <code>Object</code>
Creates a client for making type-safe action requests.

**Kind**: static constant of [<code>@frontjs/actions/client</code>](#module_@frontjs/actions/client)  
**Returns**: <code>Object</code> - Client with send method  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The API URL (e.g., '/api/actions') |

**Example**  
```js
const client = createClient('/api/actions');
await client.send('todo:create', { text: 'Hello' });
```
