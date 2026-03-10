# Modernize Clone

Guia rapido para manutencao do layout (icones, menu, topbar e componentes reutilizaveis).

## Como adicionar um novo icone

1) Adicione o SVG em `src/assets/icons/`.
2) Registre o nome do icone e o caminho em `src/app/core/ui/icon/icon.types.ts`.
3) Use o componente:

```html
<app-icon name="nome-do-icone" [size]="20"></app-icon>
```

Notas:
- Os SVGs usam `currentColor` para stroke/fill, entao a cor segue o texto do container.
- Os assets ja estao publicados no build via `angular.json`.

## Como adicionar um novo item no menu (sidebar)

1) Inclua o item em `src/app/core/layout/sidebar/sidebar.component.ts`, dentro de `groups`.
2) Se for navegavel, adicione `route` e garanta a rota em `src/app/app.routes.ts`.

Exemplo:

```ts
{
  title: 'Analytics',
  items: [
    { label: 'Sales', icon: 'chart', route: '/analytics/sales' },
  ],
}
```

## Como adicionar um novo item no topbar

1) Edite `src/app/core/layout/topbar/topbar.component.html`.
2) Adicione um botao, link ou componente, usando `app-icon` se precisar.

Exemplo:

```html
<button class="btn btn-link text-white p-0" type="button">
  <app-icon name="refresh" [size]="20"></app-icon>
</button>
```

## Componentes reutilizaveis

Todos ficam em `src/app/core/ui/` e sao standalone.

### Card
- Arquivos: `src/app/core/ui/card/card.component.ts`, `src/app/core/ui/card/card.component.html`
- Uso:

```html
<app-card padding="p-4">
  Conteudo
</app-card>
```

### Icon
- Arquivos: `src/app/core/ui/icon/icon.component.ts`, `src/app/core/ui/icon/icon.types.ts`
- Uso:

```html
<app-icon name="bell" [size]="20"></app-icon>
```

### Badge
- Arquivo: `src/app/core/ui/badge/badge.component.ts`
- Tons: `primary`, `success`, `warning`, `danger`, `neutral`

```html
<app-badge tone="success">Ativo</app-badge>
```

### Progress
- Arquivo: `src/app/core/ui/progress/progress.component.ts`
- Tons: `primary`, `success`, `warning`, `danger`

```html
<app-progress [value]="65" tone="primary"></app-progress>
```

## Table (reutilizavel)

Componente generico que recebe linhas, colunas e acoes do componente pai.

Arquivos:
- `src/app/features/dashboard/components/table/table.component.ts`
- `src/app/features/dashboard/components/table/table.component.html`
- `src/app/features/dashboard/components/table/table.component.scss`
- `src/app/features/dashboard/components/table/table.types.ts`

### Tipos

```ts
import type { TableColumn, RowAction, TableState } from 'src/app/features/dashboard/components/table/table.types';
```

- `TableColumn<T>`: define as colunas. Use `cell(row)` para HTML customizado ou `prop` para leitura direta.
- `RowAction<T>`: define acoes por linha (menu kebab). `icon` deve ser um `AppIconName`.
- `TableState`: pagina atual, pageSize e total.

### Exemplo de uso

```ts
columns: TableColumn<ProductListItem>[] = [
  { key: 'name', header: 'Product', cell: (row) => this.renderProduct(row) },
  { key: 'date', header: 'Date', cell: (row) => this.formatDate(row.date) },
  { key: 'status', header: 'Status', cell: (row) => this.renderStatus(row.status) },
  { key: 'price', header: 'Price', align: 'end', cell: (row) => this.formatCurrency(row.price) },
];

actions: RowAction<ProductListItem>[] = [
  { id: 'view', label: 'View', icon: 'eye', action: (row) => this.view(row) },
  { id: 'edit', label: 'Edit', icon: 'edit', action: (row) => this.edit(row) },
  { id: 'delete', label: 'Delete', icon: 'trash', variant: 'danger', action: (row) => this.remove(row) },
];

state: TableState = { page: 1, pageSize: 5, total: 0 };
```

```html
<app-table
  [rows]="pagedProducts()"
  [columns]="columns"
  [actions]="actions"
  [rowId]="rowId"
  [state]="state()"
  (stateChange)="onStateChange($event)"
  (selectionChange)="onSelectionChange($event)"
></app-table>
```

### Notas
- `rowId` e obrigatorio para selecao.
- `selectable` pode ser desativado com `[selectable]="false"`.
- `cell(row)` retorna HTML (string) e e renderizado via `innerHTML`. Use apenas conteudo gerado no codigo.

## Tema (dark/light)

O tema usa variaveis CSS. O modo padrao e `dark` e a alternancia e feita pelo botao no topbar.

### Classes e tokens usados
- `app-card`: usa `--surface-1`, `--border`, `--shadow-sm`, `--card-radius`.
- `app-muted`: usa `--text-2`.
- `app-border`: usa `--border`.
- `app-surface-2`: usa `--surface-2`.
- `app-divider`: usa `--border`.
- `icon-badge` + `.accent-*`: usam `--primary`, `--success`, `--warning`, `--danger` e `--on-accent`.
- `app-table`: ajusta variaveis `--bs-table-*` com `--text-1` e `--border`.
- `app-input`: usa `--text-1` e `--text-2` no placeholder.
- `app-icon-btn`: usa `--surface-2`, `--border`, `--text-1` e foco com `--primary`.
- `app-btn-outline`: mapeia o `btn-outline-light` para tokens (`--text-1`, `--surface-2`, `--border`).
- `topbar .btn-link`: herda `--text-1` para icones simples (ex.: bell).

### Regra para icones
`app-icon` usa `currentColor`. Nao aplique `text-white` ou cores fixas nos botoes/containers, senao o tema nao altera a cor do icone. Para botoes do topbar que usam `btn-link`, a cor e definida no CSS do topbar com `--text-1`.

## Desenvolvimento

```bash
ng serve
```
