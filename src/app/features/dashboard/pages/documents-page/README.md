# Documents - Página e Componentes

Este diretório documenta a implementação da nova página **Documents** do dashboard, com editor rico (HTML simples) e preview em formato de folha.

## Objetivo
- Criar a rota `/documents`.
- Exibir editor e preview lado a lado (desktop) e empilhados (mobile).
- Permitir formatação básica de conteúdo (bold, italic, underline, listas, headings, links, alinhamento).
- Reutilizar componentes standalone, tipados e compatíveis com tema dark/light via tokens.

## O que foi implementado

### 1) Rota e menu
Arquivos alterados:
- `src/app/app.routes.ts`
- `src/app/core/layout/sidebar/sidebar.component.ts`

Mudanças:
- Rota adicionada:
  - `path: 'documents'`
  - `component: DocumentsPageComponent`
- Item de menu adicionado no grupo **Pages**:
  - label: `Documents`
  - icon: `file-text`
  - route: `/documents`
- Active state já segue prefix match (`exact: false`) no sidebar existente.

### 2) Página Documents
Arquivos criados:
- `src/app/features/dashboard/pages/documents-page/documents-page.component.ts`
- `src/app/features/dashboard/pages/documents-page/documents-page.component.html`
- `src/app/features/dashboard/pages/documents-page/documents-page.component.scss`

Estrutura:
- `PageContainer` com:
  - título: `Documents`
  - breadcrumb: `Dashboard • Documents`
- Hero visual com ilustração SVG placeholder.
- Card principal com grid 2 colunas:
  - esquerda: `RichHtmlEditorComponent`
  - direita: `DocumentPreviewCardComponent`
- Ações no topo do card:
  - `Clear`: limpa conteúdo do editor
  - `Export HTML`: gera e baixa arquivo `.html` via `Blob`

Formulário reativo:
- `FormGroup` tipado:
  - `content: FormControl<string>`
- Valor inicial:
  - `<p>Type here...</p>`
- Preview ligado ao valor atual do control (tempo real).

### 3) Componente reutilizável: RichHtmlEditorComponent
Arquivos criados:
- `src/app/features/dashboard/components/rich-html-editor/rich-html-editor.component.ts`
- `src/app/features/dashboard/components/rich-html-editor/rich-html-editor.component.html`
- `src/app/features/dashboard/components/rich-html-editor/rich-html-editor.component.scss`

Características:
- Standalone.
- Implementa `ControlValueAccessor`.
- Valor do control: `string` (HTML).
- Inputs:
  - `label?: string`
  - `placeholder?: string`
  - `minHeight?: number` (default `320`)
  - `toolbarVariant?: 'full' | 'basic'` (default `'full'`)
- Área editável com `contenteditable`.
- Toolbar usando `document.execCommand` para:
  - `bold`, `italic`, `underline`
  - `insertOrderedList`, `insertUnorderedList`
  - heading (`p`, `h1`, `h2`, `h3`)
  - `createLink`
  - `justifyLeft`, `justifyCenter`, `justifyRight`
  - `removeFormat`

Decisões de implementação:
- Toolbar evita perda de foco no editor com `mousedown.preventDefault()`.
- Componente usa `ViewEncapsulation.None` para garantir estilo no conteúdo dinâmico.
- Placeholder visual aparece quando conteúdo está vazio.

### 4) Componente reutilizável: DocumentPreviewCardComponent
Arquivos criados:
- `src/app/features/dashboard/components/document-preview-card/document-preview-card.component.ts`
- `src/app/features/dashboard/components/document-preview-card/document-preview-card.component.html`
- `src/app/features/dashboard/components/document-preview-card/document-preview-card.component.scss`

Características:
- Standalone.
- Inputs:
  - `html: string` (obrigatório)
  - `title?: string`
- Renderiza preview em card com aspecto de folha:
  - `max-width: 700px`
  - `min-height: 860px`
- Render com `[innerHTML]` após sanitização leve.
- Stylesheet local de documento:
  - `h1/h2/h3`, `p`, `ul/ol`, `a`, `blockquote`, `hr`.

Sanitização aplicada:
- Remove tags perigosas:
  - `script`, `iframe`, `object`, `embed`, `link`, `meta`
- Remove atributos perigosos:
  - `on*` (event handlers)
  - `href/src` iniciando com `javascript:`
- Preserva alinhamento (`left/center/right/justify`) convertendo para classes seguras:
  - `doc-align-left`
  - `doc-align-center`
  - `doc-align-right`
  - `doc-align-justify`

## Tema e estilo
- UI implementada com tokens do projeto:
  - `--surface-1`, `--surface-2`, `--text-1`, `--text-2`, `--border`, `--primary`, `--shadow-sm`.
- Sem hex hardcoded na UI dos componentes da feature.
- Responsividade:
  - `col-12 col-lg-6` no grid da página.
  - Em telas menores, editor e preview empilham automaticamente.

## Boas práticas atendidas
- Standalone components.
- `@if` e `@for` nos templates.
- Sem `any`.
- Formulário reativo tipado.
- `inject()` utilizado no projeto onde apropriado; nesta feature não foi necessário para todos os componentes.

## Validação
Comando executado:
- `CI=1 npm run build`

Resultado:
- Build concluído com sucesso.
- Warning existente de budget inicial acima do limite do projeto (não relacionado apenas a esta feature).

## Próximos passos sugeridos (opcional)
- Adicionar botão de cópia direta para clipboard do HTML.
- Incluir modo `toolbarVariant='basic'` com layout visual dedicado.
- Criar testes unitários para CVA do editor e sanitização do preview.
