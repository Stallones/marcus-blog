---
name: this-pro
description: Local project cache — provides component hierarchy, route chain, technical patterns, and cross-component impact matrix for this specific blog project. Use when: (1) working on any .vue or .ts file in this project, (2) the parent skill (diagnose/grill-me/improve-architecture) needs project context, (3) modifying shared components where side effects matter.
---

# This Project Cache

## Purpose

Pre-computed map of this blog project's architecture. **Load before modifying any component** to understand upstream/downstream impact without re-scanning the entire project.

## Cache Files (read as needed)

| File | What it tells you |
|------|------------------|
| [ROUTE-HIERARCHY.md](ROUTE-HIERARCHY.md) | Route → component resolution chain, full component tree, shared component annotations |
| [TECHNICAL-INDEX.md](TECHNICAL-INDEX.md) | vue-best-practices technical patterns → which project files implement/could benefit |
| [IMPACT-MATRIX.md](IMPACT-MATRIX.md) | Cross-component dependency graph (who uses what, what depends on me) |
| [STYLE-CASCADE.md](STYLE-CASCADE.md) | CSS variable system, scoped styles, z-index layers, responsive breakpoints |
| [element-hierarchy.md](element-hierarchy.md) | Detailed DOM element tree with position/z-index annotations |

## How to Use

**When parent skill triggers (diagnose/grill-me/improve-architecture):**

1. Read `IMPACT-MATRIX.md` first — identify which shared components are involved
2. Read `ROUTE-HIERARCHY.md` → trace route → layout → parent components to understand the full ancestry chain
3. Read `STYLE-CASCADE.md` → check scoped style inheritance, z-index conflicts
4. Read `TECHNICAL-INDEX.md` → verify project follows recommended patterns for the area being modified

**Key mental model for style modifications** (especially Nav/Header):

> When modifying a shared component (e.g. Nav), **first go up** to see all parents that render it (HomeHeader, PageHeader), **then go sideways** to see sibling components that share the same parent's CSS context. Only then go down to the target component's internals. This prevents styles from breaking other pages.
