---
name: dashboard-table
description: Use when working on Hydra Hub UI dashboard tables, app-table usage, reusable list or grid views, table pagination, row actions, selection, custom cells, status badges, or replacing feature-specific tables with the shared dashboard table component.
---

# Dashboard Table

Use this skill when a task involves dashboard list, grid or table UI and may use
`src/app/features/dashboard/components/table`.

## Required Context

Before implementing table changes, read:

- `AGENTS.md`
- `README.md`
- `src/app/features/dashboard/components/table/README.md`

If the table belongs to a feature with its own README, read that feature README too.

## Working Rules

- Prefer `app-table` before creating a new table/list implementation.
- Import `TableComponent` in the standalone component that renders the table.
- Type columns with `TableColumn<T>` and actions with `RowAction<T>`.
- Always provide a stable `rowId`, normally `(row) => row.id`.
- Decide explicitly whether selection is needed; pass `[selectable]="false"` when it is not.
- Use `[state]` only when the parent owns pagination; otherwise omit it.
- Keep filtering, sorting and pagination data decisions in the parent component.
- Use `actions` for edit/view/delete-style row commands.
- Use `variant: 'danger'` for destructive row actions.
- Preserve theme tokens and avoid hardcoded colors.

## Custom Cell Rules

- `cell(row)` returns an HTML string rendered with `innerHTML`.
- Do not put Angular bindings, components, directives or click handlers inside `cell(row)` HTML.
- Escape user/API content before interpolating it into custom HTML.
- Use custom cell HTML for display-only badges, titles, avatars and metadata.
- If a cell needs real interactivity, prefer row actions or extend `app-table` with a typed API.

## Validation

- Compare examples against `table.component.ts` and `table.types.ts`.
- Check responsive behavior when table content can overflow.
- Run `git diff --check` after documentation or table changes.
- For code changes, run the project build/typecheck with a Node version supported by Angular.
