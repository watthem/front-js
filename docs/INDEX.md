# Documentation Index

Complete guide to front.js documentation, organized by purpose.

---

## Getting Started

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](../README.md) | Quick start, installation, basic examples | New users |
| [examples/README.md](../examples/README.md) | Working examples with explanations | Learning by doing |

---

## Core Documentation

### Architecture & Design

| Document | Purpose | Audience |
|----------|---------|----------|
| [BLUEPRINT.md](./BLUEPRINT.md) | Detailed engineering architecture | Implementers |
| [ENGINE.md](./ENGINE.md) | Reactivity engine deep-dive | Contributors |
| [DESIGN.md](./DESIGN.md) | Design decisions and rationale | Architects |

### Constraints & Trade-offs

| Document | Purpose | Audience |
|----------|---------|----------|
| **[LIMITATIONS.md](./LIMITATIONS.md)** | Known limitations, edge cases, workarounds | All users |
| [ROADMAP.md](./ROADMAP.md) | Future improvements and priorities | Contributors |

---

## Wiki (Reference)

| Document | Purpose | Audience |
|----------|---------|----------|
| [API.md](../wiki/API.md) | Complete API reference | All users |
| [STANDARDS.md](../wiki/STANDARDS.md) | Architectural standards and principles | Contributors |
| [FAQ.md](../wiki/FAQ.md) | Frequently asked questions | New users |
| [PRD.md](../wiki/PRD.md) | Product requirements | Stakeholders |
| [TRANSLATIONS.md](../wiki/TRANSLATIONS.md) | Migration guide from React/Vue | Experienced developers |

---

## Community

| Document | Purpose | Audience |
|----------|---------|----------|
| [community/README.md](../community/README.md) | Community knowledge overview | Contributors |
| [community/LIMITATIONS-SUMMARY.md](../community/LIMITATIONS-SUMMARY.md) | Quick reference for limitations | All users |
| [community/FEEDBACK.md](../community/FEEDBACK.md) | User feedback and discoveries | Contributors |

---

## Contributing

| Document | Purpose | Audience |
|----------|---------|----------|
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Development guidelines | Contributors |
| [WARP.md](../WARP.md) | AI/Warp-specific guidance | AI assistants |

---

## Tests

| Test File | Purpose | Audience |
|-----------|---------|----------|
| [tests/limitations.test.js](../tests/limitations.test.js) | Executable documentation of constraints | Contributors |
| Other test files | Functional behavior verification | Contributors |

---

## Quick Navigation

### I want to...

**Learn front.js basics**
→ Start with [README.md](../README.md), then [examples/README.md](../examples/README.md)

**Understand limitations**
→ Read [LIMITATIONS.md](./LIMITATIONS.md) or [LIMITATIONS-SUMMARY.md](../community/LIMITATIONS-SUMMARY.md)

**Look up API syntax**
→ See [API.md](../wiki/API.md)

**Understand design philosophy**
→ Read [STANDARDS.md](../wiki/STANDARDS.md)

**Migrate from React**
→ See [TRANSLATIONS.md](../wiki/TRANSLATIONS.md)

**Contribute code**
→ Read [CONTRIBUTING.md](../CONTRIBUTING.md) and [BLUEPRINT.md](./BLUEPRINT.md)

**Report a limitation**
→ Check [LIMITATIONS.md](./LIMITATIONS.md) first, then open a GitHub issue

**Request a feature**
→ Check [ROADMAP.md](./ROADMAP.md) first, then start a GitHub discussion

**Troubleshoot issues**
→ Check [FAQ.md](../wiki/FAQ.md) and [LIMITATIONS.md](./LIMITATIONS.md)

---

## Documentation Philosophy

front.js documentation follows these principles:

1. **Honest about limitations** - We document constraints as features, not bugs to hide
2. **Executable when possible** - Tests document behavior (see [limitations.test.js](../tests/limitations.test.js))
3. **Organized by purpose** - Different docs for different use cases
4. **Examples over explanations** - Show, don't just tell
5. **Living documents** - Updated with user feedback and real-world usage

---

## Recent Additions (2025-12-06)

### New Documentation

- ✅ **[LIMITATIONS.md](./LIMITATIONS.md)** - Comprehensive limitations guide (560 lines)
- ✅ **[ROADMAP.md](./ROADMAP.md)** - Future improvements roadmap (395 lines)
- ✅ **[community/LIMITATIONS-SUMMARY.md](../community/LIMITATIONS-SUMMARY.md)** - Quick reference (138 lines)
- ✅ **[tests/limitations.test.js](../tests/limitations.test.js)** - Executable constraint documentation (429 lines)

### Updated Documentation

- ✅ [README.md](../README.md) - Added limitations section
- ✅ [wiki/FAQ.md](../wiki/FAQ.md) - Added "What are the limitations?" section
- ✅ [wiki/STANDARDS.md](../wiki/STANDARDS.md) - Added "Constraints as Features" standard
- ✅ [community/README.md](../community/README.md) - Added related documentation links
- ✅ [examples/README.md](../examples/README.md) - Added limitations note

### Test Coverage

- ✅ All 68 tests passing (including 17 new limitation tests)
- ✅ Limitations documented in executable form
- ✅ Edge cases explicitly tested

---

## Maintenance

**Review Schedule:**
- Monthly: Update LIMITATIONS.md with user-reported issues
- Quarterly: Review ROADMAP.md priorities
- Annually: Major documentation refresh

**Last Major Update:** 2025-12-06

---

## Contributing to Documentation

Found a typo? Want to clarify something? Documentation improvements are welcome!

1. Check if your issue is already addressed
2. Open an issue or PR with suggested changes
3. Follow the existing structure and tone
4. Keep examples concise and runnable

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full guidelines.
