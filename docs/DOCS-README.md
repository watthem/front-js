# Documentation Organization Guide

This guide explains where different types of documentation should be placed in this repository.

## Quick Reference

### Maintainer Documentation → `/docs/`

**Architecture & Design:**

- `/docs/architecture/` - System architecture, design decisions, technical specs
- `/docs/design/` - UI/UX design systems and guidelines

**Contributing:**

- `/docs/contributing/` - How to contribute, development workflow, monorepo structure

**Strategy & Vision:**

- `/docs/strategy/` - Project vision, roadmap, product requirements, philosophy

### User-Facing Documentation → `/website/docs/`

**API Documentation:**

- `/website/docs/api/` - **AUTO-GENERATED** from JSDoc (do not edit manually)

**Guides & Tutorials:**

- `/website/docs/guides/` - How-to guides, integration tutorials, best practices

**Reference:**

- `/website/docs/reference/` - Limitations, when to use, feature comparison

**FAQ:**

- `/website/docs/FAQ.md` - Frequently asked questions

### Root-Level Documentation

**GitHub Community Files (root level only):**

- `/README.md` - Project overview and quick start
- `/CONTRIBUTING.md` - How to contribute
- `/CODE-OF-CONDUCT.md` - Community standards
- `/LICENSE` - License information

### Special Directories

**Examples & Demos:**

- `/examples/` - Runnable code examples
- `/KB/` - Knowledge Base demo app

**Community Feedback:**

- `/community/` - User feedback, feature requests, discussions

**Personal Notes:**

- `/notes/` - Developer notes, checklists, temporary research

**AI Agent Logs:**

- `/.agents/` - **GITIGNORED** - AI conversation logs, agent output, temp files

## Rules for AI Agents & LLMs

### ✅ DO

1. **Check existing structure first** before creating new docs
2. **Use existing directories** that match your content type
3. **Update existing docs** when information changes
4. **Generate API docs** using `npm run docs:api` (don't write manually)
5. **Place conversation logs** in `.agents/` directory
6. **Use descriptive filenames** in kebab-case (e.g., `security-model.md`)

### ❌ DON'T

1. **Don't create markdown files in root** (except GitHub community files)
2. **Don't manually edit** `/website/docs/api/` (auto-generated)
3. **Don't mix maintainer and user docs** in the same directory
4. **Don't create new top-level directories** without discussion
5. **Don't commit agent conversation logs** to git (use `.agents/`)

## Decision Tree: Where Does This Doc Go?

```
Is it a conversation log or agent output?
├─ YES → /.agents/ (gitignored)
└─ NO ↓

Is it API documentation?
├─ YES → Run `npm run docs:api` (auto-generated in /website/docs/api/)
└─ NO ↓

Is it for end users of the library?
├─ YES → /website/docs/
│   ├─ How-to guide? → /website/docs/guides/
│   ├─ Reference material? → /website/docs/reference/
│   └─ FAQ? → /website/docs/FAQ.md
└─ NO ↓

Is it for maintainers/contributors?
├─ YES → /docs/
│   ├─ Architecture/design? → /docs/architecture/
│   ├─ Contributing guide? → /docs/contributing/
│   ├─ Strategy/vision? → /docs/strategy/
│   └─ Design system? → /docs/design/
└─ NO ↓

Is it a GitHub community file?
├─ YES → / (root level: README.md, CONTRIBUTING.md, etc.)
└─ NO ↓

Is it a temporary note or checklist?
├─ YES → /notes/
└─ NO → Ask for clarification!
```

## Common Mistakes & Fixes

### Mistake: Created `Security.md` in root

**Fix:** Move to `/website/docs/guides/security.md`

```bash
git mv Security.md website/docs/guides/security.md
```

### Mistake: Created `ARCHITECTURE.md` in root

**Fix:** Move to `/docs/architecture/`

```bash
git mv ARCHITECTURE.md docs/architecture/ARCHITECTURE.md
```

### Mistake: Manually created API docs

**Fix:** Delete and regenerate

```bash
rm website/docs/api/core/val.md
npm run docs:api
```

### Mistake: Committed conversation log

**Fix:** Move to `.agents/` and remove from git

```bash
git rm notes/conversation-with-claude.md
mv notes/conversation-with-claude.md .agents/
```

## Automated Enforcement

This repository uses **git hooks** to validate markdown placement:

- **Pre-commit hook** checks for misplaced `.md` files
- Warns if files are in unexpected locations
- Suggests correct locations based on content

### Bypassing Hooks (Emergency Only)

```bash
git commit --no-verify
```

⚠️ **Warning:** Only use `--no-verify` if you're certain the placement is correct!

## Regenerating Documentation

```bash
# Regenerate API docs from JSDoc
npm run docs:api

# Regenerate TypeScript definitions
npm run types:generate

# Format all documentation
npm run format
```

## CI/CD

GitHub Actions automatically:

- Regenerates API docs on push to `main` or `dev`
- Regenerates TypeScript definitions
- Commits updated docs back to repository

See `.github/workflows/docs.yml` for details.

## Questions?

If you're unsure where to place documentation:

1. Check this guide first
2. Look at existing similar documents
3. Ask in an issue or discussion
4. Default to `/notes/` for temporary files
