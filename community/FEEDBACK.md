# GM Board - Customer Discovery Feedback

**Date**: 2025-12-05
**Component**: GM Board (examples/gm-board.js)
**Purpose**: Real-world test of front.js to discover strengths, limitations, and missing features

---

## What I Built

A "good morning" presence board with:

- Mock authentication (username login)
- "Say GM" functionality (adds/updates user on board)
- Live/offline status (based on timestamp - last 5 mins)
- Kudos system (one kudos per user per person)
- Auto-updating status via `setInterval`

**Complexity**: ~150 lines of code, testing:

- Forms and input handling
- Complex nested state (kudos map tracking giver->receiver)
- Computed values (live status, kudos count)
- Timers and forced re-renders
- Conditional rendering (login vs board view)
- List rendering with multiple calc properties

---

## ✅ What Worked Smoothly

### 1. Signal-Based State Management

**Experience**: Intuitive and powerful. Creating state felt natural:

```javascript
const currentUser = val(null);
const gmEntries = val([]);
const kudosMap = val({});
```

**Why it's good**:

- No boilerplate (no reducers, actions, dispatch)
- Reading state is just `val()`
- Updating is just `val(newValue)`
- Auto-tracking "just works"

**Rating**: ⭐⭐⭐⭐⭐ (5/5)

---

### 2. Event Handlers

**Experience**: Dead simple. Native functions work perfectly:

```javascript
onclick=${() => giveKudos(entry.username)}
disabled=${isSelf || alreadyGaveKudos}
```

**Why it's good**:

- No synthetic events to learn
- Just JavaScript functions
- Can pass data easily via closures
- Type safety would work great here (TypeScript)

**Rating**: ⭐⭐⭐⭐⭐ (5/5)

---

### 3. Nested Object Updates in Signals

**Experience**: Worked perfectly. I was worried about this:

```javascript
kudosMap({
  ...kudosMap(),
  [key]: true,
});
```

**Why it's good**:

- Immutable update pattern is explicit
- No hidden mutation bugs
- Signal detects the change correctly (new object reference)

**Rating**: ⭐⭐⭐⭐⭐ (5/5)

---

### 4. Conditional Rendering

**Experience**: Clean and readable:

```javascript
${user ? html`<div>Board</div>` : html`<div>Login</div>`}
```

**Why it's good**:

- Just JavaScript ternaries
- No special syntax to learn
- Easy to nest and compose

**Rating**: ⭐⭐⭐⭐⭐ (5/5)

---

### 5. List Rendering with .map()

**Experience**: Natural and performant:

```javascript
${entries.map(entry => html`<div>${entry.username}</div>`)}
```

**Why it's good**:

- Standard JavaScript array methods
- uhtml handles diffing automatically
- No keys needed (uhtml is smart)

**Rating**: ⭐⭐⭐⭐⭐ (5/5)

---

## ⚠️ What Was Awkward But Possible

### 1. No Lifecycle Hooks (Critical Gap)

**Problem**: I needed to set up `setInterval` for live status updates, but can't clean it up.

**What I wrote**:

```javascript
const interval = setInterval(() => {
  forceUpdate(forceUpdate() + 1); // Hacky
}, 30000);

// TODO: No way to clearInterval when component unmounts!
```

**Why it's awkward**:

- Memory leak potential (interval keeps running)
- No `onMount` or `onCleanup` hooks
- Have to rely on workarounds

**What I wish existed**:

```javascript
function GMBoard(props) {
  const state = val(0);

  onMount(() => {
    const interval = setInterval(() => state(state() + 1), 1000);
    return () => clearInterval(interval); // cleanup
  });

  return () => html`...`;
}
```

**Impact**: High - this is needed for:

- Timers
- Event listeners
- WebSocket connections
- Subscriptions

**Rating**: ⭐⭐ (2/5) - Major limitation

---

### 2. Forced Re-renders from External Sources

**Problem**: `setInterval` can't read vals and trigger re-renders. Had to create a dummy val:

```javascript
const forceUpdate = val(0);

setInterval(() => {
  forceUpdate(forceUpdate() + 1); // Just to trigger re-render
}, 30000);

return () => {
  forceUpdate(); // Read it to create dependency
  // ... rest of render
};
```

**Why it's awkward**:

- Feels hacky
- Not obvious to newcomers
- Couples timer to render function

**What I wish existed**:
Maybe `run()` that doesn't run immediately, or a `watch()` API:

```javascript
const checkStatus = watch(() => {
  // Re-run this periodically
});
```

**Impact**: Medium - workaround exists but feels wrong

**Rating**: ⭐⭐⭐ (3/5)

---

### 3. Computed Values vs Helper Functions

**Problem**: I wasn't sure when to use `calc()` vs plain functions.

**What I did**:

```javascript
// Used plain functions
const isUserLive = (timestamp) => {
  return (Date.now() - timestamp) < (5 * 60 * 1000);
};

// Called in render
${isUserLive(entry.timestamp) ? '🟢' : '⚫'}
```

**Why it's confusing**:

- Should I make `isUserLive` a calc val?
- When do I use calc vs just computing inline?
- No clear guidance in docs

**What I wish existed**:
Clear patterns in docs:

- "Use `calc()` for expensive calculations with val deps"
- "Use plain functions for pure transformations"

**Impact**: Low - doesn't break anything, just unclear

**Rating**: ⭐⭐⭐⭐ (4/5) - Works fine, just needs docs

---

## ❌ What I Couldn't Do

### 1. Share State Between Islands

**Problem**: If I had multiple GMBoard islands, they can't share the same `gmEntries` val.

**Why it's a limitation**:

- Each component creates its own local vals
- No global store pattern
- Can't have "synced" islands

**Example use case**:

- Multiple charts showing the same data
- Shared shopping cart across page
- Global notification count

**What I wish existed**:

```javascript
// In shared-state.js
export const globalStore = createStore({
  user: null,
  notifications: [],
});

// In component
import { globalStore } from './shared-state.js';

function MyComponent() {
  const user = globalStore.user; // Same val everywhere
}
```

**Workaround**: Create vals outside component and import them (but this feels wrong)

**Impact**: Medium-High for multi-island apps

---

### 2. Lifecycle Cleanup

**Problem**: Already mentioned above - can't clean up intervals, listeners, subscriptions.

**Impact**: High - causes memory leaks

---

### 3. Dev Tools / Debugging

**Problem**: No way to visualize the val graph or see what's subscribed to what.

**What I wish existed**:

- Browser extension showing val dependency tree
- Time-travel debugging (undo/redo val changes)
- Component inspector

**Impact**: Medium - makes debugging harder

---

## 💡 Feature Requests (Priority Order)

### 1. Lifecycle Hooks (CRITICAL)

**Priority**: P0 (Blocker for real apps)

**API Proposal**:

```javascript
export function onMount(fn) {
  // Run after component first renders
  // fn() can return cleanup function
}

export function onCleanup(fn) {
  // Run when component unmounts
}
```

**Use cases**:

- Set up/tear down timers
- Add/remove event listeners
- WebSocket connect/disconnect
- Subscriptions

---

### 2. Shared State / Store Pattern (HIGH)

**Priority**: P1 (Needed for multi-island apps)

**API Proposal**:

```javascript
export const store = createStore({
  user: val(null),
  todos: val([]),
});

// Components can import and share
```

**Use cases**:

- Shopping cart across page
- User auth state
- Global notification system

---

### 3. Batched Updates (MEDIUM)

**Priority**: P2 (Performance optimization)

**Problem**: Multiple val updates trigger multiple re-renders:

```javascript
name('Alice'); // re-render
age(30); // re-render
city('NYC'); // re-render
```

**API Proposal**:

```javascript
batch(() => {
  name('Alice');
  age(30);
  city('NYC');
}); // Single re-render
```

---

### 4. Dev Tools (MEDIUM)

**Priority**: P2 (Developer experience)

Features:

- Signal dependency graph visualization
- Component tree inspector
- Time-travel debugging

---

### 5. Better Error Messages (LOW)

**Priority**: P3 (Nice to have)

Current: Generic console.error
Desired: Helpful messages like:

- "Signal 'count' was read outside of run. Did you forget to wrap in run()?"
- "Component 'Todo' must return a function, got undefined"

---

## 🎯 Overall Assessment

### What front.js Does Exceptionally Well

1. **Simplicity**: Signal API is dead simple
2. **Performance**: uhtml diffing is fast
3. **Security**: No eval, auto-escaping works great
4. **Size**: Stays small even with complex state
5. **Learning curve**: I "got it" in minutes

### What Needs Work

1. **Lifecycle hooks** - Critical gap
2. **Shared state pattern** - Needed for real apps
3. **Documentation** - Needs more patterns and examples
4. **Dev tools** - Hard to debug complex val graphs

### Can I Build Real Apps with This?

**Yes, but with caveats**:

✅ **Perfect for**:

- Static sites with interactive widgets
- Internal dashboards
- Embedded components (chat widgets, etc.)
- Prototypes and MVPs

⚠️ **Challenging for**:

- SPAs (no router, but could add one)
- Apps with many interconnected components
- Apps needing complex lifecycle management

❌ **Not suitable for**:

- Large teams (no ecosystem, job market)
- Apps needing extensive third-party components

---

## 🔥 The Killer Use Case

After building this, I see the **killer use case** clearly:

**"Enhance traditional server-rendered sites with islands of interactivity"**

Example:

- WordPress blog with front.js for comments, likes, notifications
- Marketing site with front.js for interactive demos
- Django admin with front.js for live-updating dashboards

This is what front.js **excels at** that React/Vue don't:

- No build step
- Tiny size
- Drop in via script tag
- Doesn't take over the page

---

## 📊 Final Score

As a **learning project**: ⭐⭐⭐⭐⭐ (5/5)
As a **production framework** (current state): ⭐⭐⭐ (3/5)
As a **production framework** (with lifecycle hooks): ⭐⭐⭐⭐ (4/5)

**Recommendation**: Add lifecycle hooks, then this is genuinely useful for real projects.

---

## 🚀 Next Steps

If I were to continue using front.js, I'd want:

1. **Immediate**: Add `onMount`/`onCleanup` hooks (blocking)
2. **Short-term**: Document patterns (store, routing, forms)
3. **Medium-term**: Build example apps (dashboard, chat, etc.)
4. **Long-term**: Dev tools browser extension

---

## Code Quality Notes

Building the GM Board was smooth. The code I wrote is:

- ~150 lines (readable, not too dense)
- No hacks (except forceUpdate workaround)
- Easy to reason about
- Would be easy to test

**Developer Experience**: 8/10
(Would be 9/10 with lifecycle hooks)
