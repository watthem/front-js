# front.js Security Model

**Version:** 1.0
**Last Updated:** 2025-12-08
**Status:** Alpha

---

## 1. Introduction & Scope

### Purpose

This document establishes a transparent security boundary contract between front.js framework, developers, and server infrastructure. It explicitly defines:

- What front.js **protects against**
- What front.js **does not protect against**
- Where responsibility lies in the security chain
- How to safely integrate front.js into your application

### Audience

- Security architects evaluating front.js
- Backend developers integrating with front.js
- DevSecOps teams reviewing the stack
- Frontend developers building components

### Core Principle

**Security by design, not by accident.**

front.js exists to make hydration boring, predictable, and safe — and refuses anything that makes it clever. We avoid entire classes of vulnerabilities by constraining what the framework can do.

---

## 2. Trust Boundary Architecture

### Trust Diagram

```
    Server                Framework            Client Browser
   (Trusted)            (Thin Layer)         (Untrusted Input)
       │                      │                     │
       │  Render HTML         │                     │
       ├─────────────────────►│                     │
       │  <div data-island    │                     │
       │    data-component=   │   Parse JSON Props  │
       │    data-props='...'>│◄────────────────────┤
       │                      │                     │
       │                      │   Hydrate DOM       │
       │                      ├─────────────────────►
       │                      │   uhtml Rendering   │
       │                      │                     │
       │◄─────front.js security boundary─────────►│
       │                                            │
       │◄────Server responsible beyond──────────────

```

### Key Boundaries

**Data Boundary:**
Only JSON via `data-props` attribute crosses the trust boundary. No functions, closures, or executable code.

**Execution Boundary:**
front.js operates **only on the client**. It has:

- No network access for props validation
- No server-side execution surface
- No RPC or Flight-style endpoints

**Server Responsibility:**
All authentication, authorization, CSRF protection, rate limiting, and business logic validation remain server responsibilities.

---

## 3. What front.js PROTECTS

### 3.1 XSS via Template Injection

**Risk:** User data in props containing `<script>`, event handlers, or HTML entities could execute malicious code.

**How front.js protects:**

- uhtml auto-escapes all interpolated values
- No `innerHTML` anywhere in core
- No raw HTML rendering from props

**Example:**

```javascript
// Malicious input in props
<div data-props='{"title":"<img onerror=alert(1)>"}'></div>

// uhtml renders as text, not HTML:
// &lt;img onerror=alert(1)&gt;
```

**Test Reference:** `packages/core/tests/security.test.js:26-35`

---

### 3.2 Component Name Injection

**Risk:** Attackers attempt path traversal or command injection via `data-component` attribute.

**How front.js protects:**

- Alphanumeric validation: `/^[a-zA-Z0-9_-]+$/`
- Rejects: `../etc/passwd`, `ComponentName<script>`, special characters
- Validation happens before registry lookup

**Example:**

```html
<!-- Rejected: -->
<div data-component="../malicious"></div>
<div data-component="Component<script>"></div>

<!-- Accepted: -->
<div data-component="TodoList"></div>
<div data-component="user-profile-2"></div>
```

**Design Rationale:** Component registry is explicit; no dynamic lookup possible.

**Test Reference:** `packages/core/tests/security.test.js:37-52`

---

### 3.3 JSON Deserialization Attacks

**Risk:** Malformed JSON, function injection, prototype pollution attempts.

**How front.js protects:**

- Only `JSON.parse()` used (never `eval` or `Function()`)
- Try-catch wrapping with graceful failure
- Non-JSON props cause island to be skipped (not rendered)
- Optional Standard Schema validation

**Example:**

```javascript
// Malicious attempts - all rejected:
data-props='{"fn": function(){}}'  // SyntaxError → island skipped
data-props='{"__proto__": {...}}'  // JSON.parse doesn't execute prototype tricks
```

**What front.js does NOT protect:**

- Server sending malicious JSON (server's responsibility to sanitize)
- Prototype pollution in server-constructed objects (mitigated by JSON format constraint)

**Test Reference:** `packages/core/tests/security.test.js:54-70`

---

### 3.4 Function/Closure Injection

**Risk:** Serialized functions in props leading to remote code execution.

**How front.js protects:**

- JSON format strictly disallows functions
- `JSON.parse('{"fn": function(){}}')` → SyntaxError (caught, logged, island skipped)
- Props are plain objects only
- No eval of prop values or keys

**Why This Matters:**
Avoids React Server Components-style deserialization vulnerabilities (CVE-2025-55182). front.js never serializes executable intent.

**Reference:** See section 9 for comparison to RSC vulnerability.

---

### 3.5 Event Handler Injection

**Risk:** XSS via event handler attributes in user input.

**How front.js protects:**

- Event handlers are native JavaScript functions (not strings)
- Template syntax prevents string-to-handler conversion
- `onclick=${fn}` is safe; never `onclick="${userInput}"`

**Example:**

```javascript
// Safe: function reference
<button onclick=${() => count(count() + 1)}>+</button>

// Not possible with uhtml tagged templates:
// <button onclick="${userInput}">X</button>  // Would be escaped as text
```

---

## 4. What front.js DOES NOT PROTECT

### 4.1 CSRF (Cross-Site Request Forgery)

**Responsibility:** Server

**Why front.js can't help:**
CSRF tokens, SameSite cookies, and origin checking are HTTP concerns outside the scope of a client-side hydration framework.

**Guidance:**

- Server must issue CSRF tokens in form data or headers
- Client must include tokens in fetch/form submissions
- Server must validate origin/referer headers

**Integration Example:**

```javascript
// Client component handles CSRF token
async function submitForm(formData) {
  const token = document.querySelector('input[name="csrf_token"]').value;
  return fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ ...formData, _token: token }),
    headers: { 'X-CSRF-Token': token },
  });
}
```

---

### 4.2 Authentication & Authorization

**Responsibility:** Server

**Why front.js can't help:**
Session management, JWT validation, permission checks are server concerns. Client-side checks are UX only, not security.

**Guidance:**

- Server renders different HTML based on user role
- Client-side checks are for user experience only
- All API endpoints must validate auth independently
- **Never trust `data-props` for permission flags**

**Anti-Pattern:**

```javascript
// BAD: Never do this
<div data-props='{"isAdmin": true}'></div>
// Attacker can modify this in DevTools
```

**Good Pattern:**

```javascript
// Server validates session, renders appropriate HTML
if (user.isAdmin) {
  render('<div data-component="AdminPanel"></div>');
} else {
  render('<div data-component="UserDashboard"></div>');
}
```

---

### 4.3 Content Security Policy (CSP)

**Responsibility:** Server

**Why front.js can't help:**
CSP is HTTP header enforcement, not application logic.

**Guidance:**

- Server must set strict CSP headers
- Recommended: `Content-Security-Policy: default-src 'self'; script-src 'self'`
- Import maps require `script-src 'self'` or nonce

**Example Header:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://esm.sh;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:
```

---

### 4.4 Business Logic Validation

**Responsibility:** Server

**Why front.js can't help:**
No access to databases, permissions, or business rules.

**Guidance:**

- All state changes must validate on server
- Client-side validation is UX only (form hints, early feedback)
- Never trust client-submitted data

**Pattern:**

```javascript
// Client component
const submitTodo = async (text) => {
  // Client validates for UX
  if (!text.trim()) return;

  // Server validates for security
  const response = await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

  // Server might reject if text is too long, already exists, etc.
  if (!response.ok) {
    // Handle rejection
  }
};
```

---

### 4.5 Rate Limiting & DDoS Protection

**Responsibility:** Server/infrastructure

**Why front.js can't help:**
Requires request counting, throttling at HTTP layer.

**Guidance:**

- Use server middleware (Express, Django, etc.)
- Implement at reverse proxy/CDN level (Nginx, Cloudflare)
- Track by IP, session, or user ID

---

### 4.6 Data Encryption in Transit

**Responsibility:** Server/infrastructure

**Why front.js can't help:**
TLS/HTTPS is HTTP protocol layer.

**Guidance:**

- Always use HTTPS in production
- Enable HSTS headers
- Use secure cookies (SameSite, Secure, HttpOnly flags)

**Example Secure Cookie:**

```
Set-Cookie: sessionid=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
```

---

### 4.7 Data Persistence Security

**Responsibility:** Server

**Why front.js can't help:**
Database encryption, access controls, backups are server concerns.

**Guidance:**

- Encrypt sensitive data at rest
- Implement role-based access control (RBAC)
- Audit data access logs
- Regular security backups

---

## 5. Attack Surface Analysis

### 5.1 Props Injection Attack Surface

| Attack Vector                  | Entry Point         | Mitigation                     | Residual Risk               |
| ------------------------------ | ------------------- | ------------------------------ | --------------------------- |
| Malicious JSON in data-props   | HTML attribute      | JSON.parse + schema validation | Server sends malicious data |
| Code execution in props        | Component execution | JSON forbids functions         | Prototype pollution (rare)  |
| XSS via template interpolation | Render phase        | uhtml auto-escaping            | Unsafe custom renderers     |

### 5.2 Component Registry Attack Surface

| Attack Vector                    | Entry Point              | Mitigation              | Residual Risk              |
| -------------------------------- | ------------------------ | ----------------------- | -------------------------- |
| Path traversal in component name | data-component attribute | Alphanumeric validation | None (regex is exhaustive) |
| Unregistered component loading   | Missing from registry    | Fail-safe (logs, skips) | User typos in production   |
| Component name collision         | Registry conflict        | First-registered wins   | Depends on app design      |

### 5.3 DOM Mutation Attack Surface

| Attack Vector                         | Entry Point            | Mitigation                                | Residual Risk                                    |
| ------------------------------------- | ---------------------- | ----------------------------------------- | ------------------------------------------------ |
| Modifying data-island after hydration | DevTools/attacker JS   | Attribute removed after hydration         | No re-hydration attempted                        |
| Injecting new islands                 | Dynamically added HTML | Islands must be present at hydrate() time | Dynamic content isn't hydrated                   |
| Modifying data-props before hydration | Browser attacker       | Props validated at parse time             | Client-side values trusted (explicit constraint) |

### 5.4 Dependency Attack Surface

**Dependency Risk:** uhtml peer dependency could have XSS vulnerability

- **Mitigation:** Verify uhtml version; pin in package-lock.json
- **Responsibility:** Depends on uhtml maintenance and security
- **Zero Runtime Dependencies** in core: front.js has no npm dependencies (uhtml is peer)

---

## 6. Developer Responsibility Checklist

### 6.1 Component Development

- [ ] Validate all props at component entry (use schema validators)
- [ ] Never assume props are safe (even though uhtml escapes them)
- [ ] Use event handlers as functions, never as strings
- [ ] Avoid `eval()` or `Function()` anywhere in components
- [ ] Test components with adversarial props (see examples below)

### 6.2 Server Integration

- [ ] Always render data-props with `JSON.stringify()` (never manual string concat)
- [ ] Validate and sanitize all data on server before sending to client
- [ ] Use HTTPS and secure headers (see section 4.3)
- [ ] Implement CSRF tokens for state-changing requests
- [ ] Validate all mutations on server (never trust client)

### 6.3 Application Patterns

- [ ] Use explicit component registration (no auto-imports)
- [ ] Hydrate only once per page (idempotent hydrate() call)
- [ ] Clean up components when removing islands (manual via dispose or library support)
- [ ] Never hardcode secrets in HTML (auth tokens, API keys)
- [ ] Use CORS headers appropriately if exposing APIs

### 6.4 Testing for Security

- [ ] Test XSS vectors: `<script>`, `onerror=`, `onclick=`, HTML entities
- [ ] Test injection: `"`, `'`, `\`, null bytes
- [ ] Test component names: `../etc/passwd`, `<ComponentName>`, special chars
- [ ] Test malformed JSON: `undefined`, functions, symbols
- [ ] Test missing props: empty string, null, undefined
- [ ] Test large payloads: memory exhaustion attempts

**Example Test Pattern:**

```javascript
describe('Component Security', () => {
  it('escapes XSS in props', async () => {
    const maliciousProps = {
      text: '<img src=x onerror=alert(1)>',
      html: '<script>alert(2)</script>',
    };
    // Render and verify escaped output
  });

  it('rejects malformed JSON props', async () => {
    // Attempt: data-props='{"fn": function(){}}'
    // Expected: console.error, island skipped, page intact
  });
});
```

---

## 7. Integration Guidelines

### 7.1 Safe Server Rendering

**Pattern: Server-side template**

```html
<!-- Server renders with template engine (Jinja, ERB, etc.) -->
<div
  data-island
  data-component="TodoList"
  data-props="<%= JSON.stringify({ items: todos, userName: user.name }) %>"
></div>
```

**Security Checks:**

- [ ] Use `JSON.stringify()` to safely escape quotes
- [ ] Never concatenate strings into data-props
- [ ] Validate todos array on server (size, type, content)
- [ ] Sanitize user.name if it's user-provided

---

### 7.2 Safe Props Validation (Standard Schema)

```javascript
import { object, string, array } from 'valibot';
import { register, hydrate } from '@frontjs/core';

const TodoListSchema = object({
  items: array(string()), // Only strings allowed
  userName: string(),
});

register('TodoList', TodoListComponent, {
  schema: TodoListSchema,
});

await hydrate();
```

**Benefits:**

- Type safety (runtime validation)
- Fails closed (invalid props reject island)
- Transforms data if needed (e.g., string → Date)

---

### 7.3 Safe Fetch Integration

```javascript
// Component fetches data after hydration (not in props)
function TodoList(props) {
  const todos = val([]);
  const loading = val(true);
  const error = val(null);

  run(() => {
    (async () => {
      try {
        const response = await fetch('/api/todos');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        todos(data); // Server data, validated on server
      } catch (e) {
        error(e.message);
      } finally {
        loading(false);
      }
    })();
  });

  return () => html`...`;
}
```

**Security:** API response still needs server validation (front.js doesn't validate fetch responses).

---

### 7.4 Preventing Secret Leakage

**Bad Pattern** (exposes secrets):

```html
<div data-island data-component="Admin" data-props='{"apiKey":"sk_live_..."}'></div>
```

**Good Pattern** (server validates, client fetches):

```html
<div data-island data-component="Admin" data-props='{"userId":"123"}'></div>
```

```javascript
// Component fetches admin data with server-issued session
async function AdminPanel(props) {
  const data = await fetch(`/api/admin/${props.userId}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  // ...
}
```

---

### 7.5 HTMX Integration (Graceful Cleanup)

```javascript
// When HTMX replaces islands, manually dispose
document.addEventListener('htmx:afterSwap', (event) => {
  // Find dispose functions on replaced elements
  event.detail.target.querySelectorAll('[data-island]').forEach((el) => {
    if (el._front_dispose) {
      el._front_dispose(); // Clean up subscriptions
    }
  });
});
```

---

## 8. Known Limitations (Security Implications)

### 8.1 Server Data Trust

**Limitation:** front.js trusts server-rendered HTML

**Implication:** If server is compromised, so is the app

**Mitigation:** Secure the server (auth, database, backups)

---

### 8.2 Props Immutability

**Limitation:** Props are passed once at hydration (not reactive)

**Implication:** Server changes to HTML aren't reflected

**Mitigation:** Use fetch for dynamic data, not re-rendered props

---

### 8.3 No Built-in Rate Limiting

**Limitation:** Client-side rate limiting is impossible

**Implication:** Malicious clients can flood server

**Mitigation:** Implement on server or CDN

---

### 8.4 localStorage/sessionStorage Trust

**Limitation:** Client storage is accessible to attacker scripts

**Implication:** Never store secrets (API keys, tokens) in localStorage

**Mitigation:** Use HttpOnly cookies for session tokens

---

## 9. Comparing front.js to Other Models

| Framework           | Serialization      | Deserialization  | Attack Surface                      |
| ------------------- | ------------------ | ---------------- | ----------------------------------- |
| **front.js**        | Plain JSON only    | `JSON.parse()`   | Minimal (no function serialization) |
| **React RSC**       | Functions + values | Complex protocol | Larger (function deserialization)   |
| **HTMX**            | Not applicable     | Not applicable   | Minimal (server-driven)             |
| **htmx + front.js** | Plain JSON         | `JSON.parse()`   | Minimal (hybrid)                    |

### React2Shell Vulnerability (CVE-2025-55182)

**What happened:**
React Server Components serialized executable intent (functions, closures) across the client-server boundary. A vulnerability allowed attackers to inject malicious code that would execute on the server.

**How front.js avoids this:**

1. **JSON-only props:** No functions, closures, or executable code allowed
2. **No server-side execution:** front.js has no RPC surface
3. **Explicit constraints:** Framework refuses to serialize intent
4. **Fail-safe design:** Invalid props are logged and skipped, not executed

**Reference:** [React Blog: Critical Security Vulnerability](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) (hypothetical link for example)

---

## 10. Incident Response

### 10.1 If You Find a Security Issue

1. **Do NOT open a public issue** (responsible disclosure)
2. **Email maintainers** with proof-of-concept
3. **Include:** affected version, reproduction steps, impact assessment
4. **Do NOT publish exploit code** until patch is released

**Contact:** security@frontjs.dev (create this if publishing)

---

### 10.2 If Your App Is Compromised

1. **Check server logs** (front.js doesn't log everything client-side)
2. **Audit data-props in HTML** (grep for sensitive data)
3. **Review network requests** (fetch calls might reveal compromises)
4. **Restart server** (if injected through running app)
5. **Rotate secrets** (API keys, database passwords, session tokens)

---

### 10.3 If You Discover a Bug

- **Security bug:** Send to maintainers privately
- **Non-security bug:** Open GitHub issue at [https://github.com/frontjs/core/issues](https://github.com/frontjs/core/issues)

---

## 11. Reference Material

### 11.1 Related Documents

- [`/docs/LIMITATIONS.md`](./LIMITATIONS.md) - Full constraints and trade-offs
- [`/docs/WHEN-NOT-TO-USE-REACT.md`](./WHEN-NOT-TO-USE-REACT.md) - Why front.js avoids serialization
- [`/wiki/STANDARDS.md`](../wiki/STANDARDS.md) - Architectural principles (Zero-Trust Hydration)
- [`/docs/REQUIREMENTS.md`](./REQUIREMENTS.md) - Security boundary requirements

### 11.2 External References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Standard Schema Specification](https://standardschema.dev)
- [uhtml Security](https://github.com/WebReflection/uhtml#security) (escaping details)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 12. Security Model Version History

| Version | Date       | Changes                         |
| ------- | ---------- | ------------------------------- |
| 1.0     | 2025-12-08 | Initial security model document |

---

**Summary:** front.js protects against client-side hydration attacks (XSS, injection, deserialization). It does NOT protect against server-side concerns (CSRF, auth, CSP, business logic). Security is a shared responsibility between front.js (client hydration), developers (safe integration), and servers (validation, auth, infrastructure).
