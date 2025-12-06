# React to front.js Translation Guide

Coming from React? This guide helps you map your existing mental models to `front.js` primitives.

## The Big Shift: "Setup" vs. "Render"

In React, your component function runs **every time** state changes.
In `front.js`, your component function runs **only once** (when the island mounts).

**React:**
```javascript
function Counter() {
  // ⚠️ Runs on every render
  const [count, setCount] = useState(0);
  console.log('Rendered'); 

  return <button>{count}</button>;
}
````

**front.js:**

```javascript
function Counter() {
  // ✅ Runs ONLY ONCE
  const count = val(0);
  console.log('Setup complete');

  // Returned function runs on update
  return () => html`<button>${count()}</button>`;
}
```

-----

## The Dictionary

| Concept | React Hook | front.js Primitive | Key Difference |
| :--- | :--- | :--- | :--- |
| **State** | `useState` | **`val`** | Returns a getter/setter function, not an array. |
| **Side Effect** | `useEffect` | **`run`** | Auto-tracks dependencies. No dependency array `[]`. |
| **Derived State** | `useMemo` | **`calc`** | Read-only. Auto-updates when dependencies change. |
| **Ref** | `useRef` | *Just use a variable* | Since components run once, a simple `let` works effectively as a ref. |
| **Rendering** | JSX | **`html`** | Uses native Tagged Templates. Standard JS strings. |

-----

## 1\. State (`val`)

React uses a tuple `[value, setter]`. `front.js` uses a single accessor function.

**React:**

```javascript
const [count, setCount] = useState(0);
// Read: count
// Write: setCount(5)
// Update: setCount(c => c + 1)
```

**front.js:**

```javascript
const count = val(0);
// Read: count()
// Write: count(5)
// Update: count(count() + 1)
```

-----

## 2\. Side Effects (`run`)

React requires a manual dependency array. `front.js` tracks dependencies automatically.

**React:**

```javascript
useEffect(() => {
  console.log('Count changed:', count);
}, [count]); // ⚠️ Easy to forget deps
```

**front.js:**

```javascript
run(() => {
  // ✅ Auto-subscribes because we called count()
  console.log('Count changed:', count());
});
```

### Cleanup

Both frameworks use a return function for cleanup.

**front.js:**

```javascript
run(() => {
  const handler = e => console.log(e);
  window.addEventListener('resize', handler);
  
  // Cleanup function
  return () => window.removeEventListener('resize', handler);
});
```

-----

## 3\. Derived State (`calc`)

In React, `useMemo` is an optimization. In `front.js`, `calc` is a reactive primitive.

**React:**

```javascript
const double = useMemo(() => count * 2, [count]);
```

**front.js:**

```javascript
const double = calc(() => count() * 2);
```

-----

## 4\. Async Data Fetching

React's `useEffect` can be tricky with async data due to race conditions. `front.js` encourages a specific pattern to handle this safely within `run`.

**The "Active Flag" Pattern:**

```javascript
run(() => {
  const id = userId();
  let active = true; // 1. Track if this run is still valid

  (async () => {
    const res = await fetch(`/api/user/${id}`);
    const data = await res.json();
    
    // 2. Only update if we haven't been cancelled/cleaned up
    if (active) {
      userData(data);
    }
  })();

  // 3. Cleanup invalidates the flag
  return () => { active = false; };
});
```

-----

## 5\. Templating (Loops & Conditionals)

`front.js` uses `uhtml`, which looks like standard JavaScript.

**React (JSX):**

```jsx
{show && <span>Visible</span>}
<ul>
  {items.map(item => <li key={item.id}>{item.text}</li>)}
</ul>
```

**front.js (Template):**

```javascript
${show() ? html`<span>Visible</span>` : ''}
<ul>
  ${items().map(item => html`<li>${item.text}</li>`)}
</ul>
```

*Note: `key` props are handled automatically by `uhtml` diffing, though explicit keys are supported in advanced cases.*

-----

## Summary Checklist for React Developers

1.  Did you call your signals as functions? `count()` (Good) vs `count` (Bad).
2.  Did you remove the dependency array? `run(() => ...)` (Good) vs `run(..., [])` (Bad).
3.  Are you trying to pass functions from the server? Stop. Use `data-props` (JSON only).
4.  Are you putting `val()` inside the return function? Move it up to the "Setup" phase.

