# Repomix Configuration

This directory contains tailored [repomix](https://github.com/yamadashy/repomix) configurations for generating repository context for different audiences.

## Available Contexts

### 🧑‍💻 Developer Context
```bash
npm run repomix:dev
```
**Includes:** Source code, tests, examples, technical docs, configs  
**Excludes:** Wiki, community feedback, AI instructions  
**Use case:** Code reviews, debugging, implementation work

### 📋 Product Manager Context
```bash
npm run repomix:pm
```
**Includes:** README, PRD, FAQ, API overview, BLUEPRINT, feedback  
**Excludes:** Source code, tests, configs  
**Use case:** Feature planning, roadmap discussions, stakeholder updates

### 📣 Marketing Context
```bash
npm run repomix:marketing
```
**Includes:** README, examples, FAQ, API reference, translations guide  
**Excludes:** Source code, tests, technical docs, community feedback  
**Use case:** Blog posts, landing pages, feature announcements

### 📚 Documentation Context
```bash
npm run repomix:docs
```
**Includes:** All markdown docs (technical + wiki)  
**Excludes:** Source code, examples, community feedback  
**Use case:** Documentation reviews, consistency checks

### 🤖 AI Agent Context
```bash
npm run repomix:ai
```
**Includes:** Everything (full repository, XML format)  
**Excludes:** Only community feedback and editor configs  
**Use case:** Claude, GPT, or other AI analysis

### 🎯 Default Context
```bash
npm run repomix
```
Uses the base `repomix.config.json` for a balanced view.

## Customization

Each config file specifies:
- **Output format**: markdown or xml
- **Include patterns**: What files to pack
- **Ignore patterns**: What to exclude (in addition to .gitignore)
- **Comment handling**: Whether to strip comments
- **Line numbers**: Whether to include them

Edit the config files in this directory to adjust what each context includes.

## Adding a New Context

1. Create a new config file: `.repomix/your-context.config.json`
2. Add a script to `package.json`:
   ```json
   "repomix:your-context": "repomix --config .repomix/your-context.config.json"
   ```
3. Document it in this README

## Output Files

All output files are `.gitignore`d by default:
- `*.repomix.txt`
- `*.repomix.xml`
- `repomix-output.*`

This prevents accidentally committing large context files to the repository.
