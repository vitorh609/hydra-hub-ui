# App Table

Use `app-table` para listas, grades e tabelas do dashboard antes de criar uma nova
implementacao. O componente centraliza layout, selecao, menu de acoes, paginacao visual e
compatibilidade com tema dark/light.

Arquivos principais:
- `table.component.ts`
- `table.component.html`
- `table.component.scss`
- `table.types.ts`

## Quando Usar

- Use para listagens tabulares com colunas configuraveis pelo componente pai.
- Use para tabelas com acoes por linha, como editar, visualizar ou excluir.
- Use para listas sem selecao passando `[selectable]="false"`.
- Use sem paginacao omitindo `[state]`.
- Evite criar outra tabela/lista se o caso puder ser expresso com `rows`, `columns` e `actions`.

## API

Imports:

```ts
import { TableComponent } from '../../components/table/table.component';
import type { RowAction, TableColumn, TableState } from '../../components/table/table.types';
```

Ajuste o caminho relativo conforme a pasta do componente que esta consumindo a tabela.

Inputs:
- `rows: T[]`: linhas ja filtradas/paginadas pelo componente pai.
- `columns: TableColumn<T>[]`: definicao das colunas.
- `actions?: RowAction<T>[]`: acoes exibidas no menu kebab da linha.
- `rowId: (row: T) => string`: obrigatorio para track, selecao e menu de acoes.
- `selectable = true`: controla checkbox por linha e selecao geral.
- `framed = true`: quando `false`, remove borda/background do wrapper.
- `state?: TableState`: habilita footer de paginacao se informado.
- `loading = false`: input existente, ainda sem estado visual dedicado.

Outputs:
- `stateChange: TableState`: emitido ao trocar pagina ou page size.
- `selectionChange: string[]`: IDs selecionados quando `selectable` esta ativo.

Tipos:

```ts
export interface TableColumn<T> {
  key: string;
  header: string;
  prop?: keyof T;
  width?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  cell?: (row: T) => string;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon: AppIconName;
  variant?: 'default' | 'danger';
  visible?: (row: T) => boolean;
  action: (row: T) => void;
}

export interface TableState {
  page: number;
  pageSize: number;
  total: number;
}
```

## Padroes De Uso

Tabela com paginacao, selecao e acoes:

```ts
readonly state = signal<TableState>({ page: 1, pageSize: 5, total: 0 });

readonly columns: TableColumn<ProductListItem>[] = [
  { key: 'name', header: 'Product', cell: (row) => this.renderProductCell(row) },
  { key: 'date', header: 'Date', cell: (row) => this.formatDate(row.date) },
  { key: 'status', header: 'Status', align: 'center', cell: (row) => this.renderStatusCell(row.status) },
  { key: 'price', header: 'Price', align: 'end', cell: (row) => this.formatCurrency(row.price) },
];

readonly actions: RowAction<ProductListItem>[] = [
  { id: 'view', label: 'View', icon: 'eye', action: (row) => this.view(row) },
  { id: 'edit', label: 'Edit', icon: 'edit', action: (row) => this.edit(row) },
  { id: 'delete', label: 'Delete', icon: 'trash', variant: 'danger', action: (row) => this.remove(row) },
];

rowId = (row: ProductListItem): string => row.id;

onStateChange(state: TableState): void {
  this.state.set({ ...state, total: this.filteredProducts().length });
}
```

```html
<app-table
  [rows]="pagedProducts()"
  [columns]="columns"
  [actions]="actions"
  [rowId]="rowId"
  [state]="state()"
  [framed]="false"
  (stateChange)="onStateChange($event)"
  (selectionChange)="onSelectionChange($event)"
></app-table>
```

Tabela simples, sem selecao e sem paginacao:

```html
<app-table
  [rows]="tickets()"
  [columns]="ticketTableColumns"
  [actions]="ticketTableActions"
  [rowId]="rowId"
  [selectable]="false"
></app-table>
```

Tabela somente leitura:

```html
<app-table
  [rows]="store.tasks()"
  [columns]="taskColumns"
  [rowId]="rowId"
  [selectable]="false"
></app-table>
```

## Celulas Customizadas

`cell(row)` retorna `string` e o componente renderiza com `innerHTML`.

Regras:
- Use `cell(row)` para badges, avatares, subtitulos e formato visual simples.
- Nao coloque bindings Angular, componentes, `(click)` ou diretivas dentro da string.
- Para interacao, prefira `actions` ou evolua o `app-table` com uma API propria.
- Escape conteudo dinamico vindo de usuario/API antes de montar HTML.
- Se nao precisar de HTML, use `prop` ou retorne texto formatado.

Exemplo de badge:

```ts
private renderStatusCell(status: TicketStatus): string {
  const meta = this.statusMeta(status);
  return `<span class="ticket-table-status ${meta.className}">${meta.label}</span>`;
}
```

Se a celula usa classes criadas no componente pai, lembre que o HTML esta dentro do
`app-table`. Use uma estrategia compativel com encapsulamento, como estilos globais ja
existentes ou seletor do host com `::ng-deep` quando for realmente necessario.

## Paginacao

- O componente nao pagina os dados sozinho.
- O pai calcula `pagedRows` e passa em `[rows]`.
- O pai mantem `TableState` e atualiza `total` com o total filtrado.
- Ao receber `stateChange`, sincronize `page`, `pageSize` e `total`.
- Omita `[state]` quando a lista deve exibir todas as linhas.

## Acoes E Selecao

- `actions` aparecem no menu kebab da linha.
- Use `variant: 'danger'` para acoes destrutivas.
- Use `visible(row)` quando uma acao depende do estado da linha.
- Se a tabela nao precisa de selecao, passe `[selectable]="false"`.
- `rowId` deve ser estavel e unico, normalmente `row.id`.

## Tema E Layout

- Preserve tokens CSS (`--surface-*`, `--border`, `--text-*`, `--primary`, `--success`,
  `--warning`, `--danger`) em estilos associados a tabela.
- `app-table` ja usa `table-responsive`; evite wrappers que quebrem scroll horizontal.
- Use `framed=false` quando a tabela ja esta dentro de um `app-card` ou container com borda.
- Nao use cores fixas para icones ou acoes; `app-icon` herda `currentColor`.
