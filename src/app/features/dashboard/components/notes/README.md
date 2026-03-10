# Notes - Componentes

Este diretório implementa a área de notas do dashboard. A interface é composta por um painel com lista de notas e um editor, com estado centralizado em um store baseado em `signals`.

**Objetivo**
Exibir, filtrar, selecionar, editar, criar e remover notas com persistência local e sincronização de edição com backend.

**Estrutura**
- `notes-board/`: container da página de notas (layout e composição).
- `notes-list/`: lista, busca e seleção de notas.
- `note-item/`: item visual de uma nota na lista.
- `notes-editor/`: editor da nota selecionada e troca de cor.
- `notes.store.ts`: estado e regras de negócio (fonte de verdade).
- `src/app/services/notes/notes.service.ts`: acesso HTTP para CRUD de notas.

**Componentes**

`NotesBoardComponent` (`notes-board/notes-board.component.ts`)
- Componente de composição. Renderiza o cabeçalho e a área principal.
- Importa `NotesListComponent` e `NotesEditorComponent`.
- Não possui lógica de estado.

`NotesListComponent` (`notes-list/notes-list.component.ts`)
- Exibe busca e lista de notas.
- Lê `filteredNotes` e `selectedId` do `NotesStore`.
- Emite ações de seleção e remoção para o store.
- Atualiza o termo de busca com debounce e mantém o input sincronizado com o estado.

`NoteItemComponent` (`note-item/note-item.component.ts`)
- Item visual de uma nota.
- Recebe `note` e `selected` como `@Input`.
- Emite `select` e `remove` como `@Output`.
- Formata `updatedAt` para exibição.

`NotesEditorComponent` (`notes-editor/notes-editor.component.ts`)
- Exibe e edita a nota selecionada.
- Sincroniza o formulário reativo com `selectedNote`.
- Salva alterações com `debounce` de inatividade, flush em troca de nota/rota e `dirty check`.
- Permite criar nota e mudar cor.

Métodos principais criados no `NotesEditorComponent`:
- `setupSelectedNoteSync()`
  - O que faz: observa `selectedNote()`, tenta persistir o rascunho da nota anterior, troca contexto da nota atual e sincroniza o formulário.
  - Por que foi criado: isolar a regra de troca de nota para evitar perda de alterações ao navegar entre notas.
- `setupDraftStateSync()`
  - O que faz: mantém o estado local (`store.updateDraft`) atualizado a cada mudança de formulário.
  - Por que foi criado: garantir UI responsiva (lista/preview) sem depender de request HTTP.
- `setupInactivityAutoSave()`
  - O que faz: aplica `debounceTime(10000)` e dispara persistência após 10s sem interação.
  - Por que foi criado: reduzir volume de requests no backend sem perder auto-save.
- `setupRouteChangeFlush()`
  - O que faz: escuta `NavigationStart` e força flush antes de sair da rota.
  - Por que foi criado: evitar perda de dados ao mudar de página.
- `rememberPersistedDraft(noteId, draft)`
  - O que faz: registra o último estado persistido por nota.
  - Por que foi criado: base para `dirty check`.
- `getCurrentDraft(noteId)`
  - O que faz: monta payload atual de persistência (`title`, `content`, `color`) com base no form + estado atual da nota.
  - Por que foi criado: centralizar o formato de dados enviados ao backend.
- `isDraftDirty(noteId, currentDraft)`
  - O que faz: compara o draft atual com o último draft persistido da mesma nota.
  - Por que foi criado: evitar chamadas HTTP desnecessárias quando não houve mudança real.
- `areDraftsEqual(left, right)`
  - O que faz: comparação de igualdade entre drafts.
  - Por que foi criado: reutilização da regra de comparação no fluxo de debounce e no dirty check.
- `flushCurrentDraft(noteId?)`
  - O que faz: persiste o draft no backend quando necessário, com controle de concorrência (`isPersisting`/`shouldPersistAgain`).
  - Por que foi criado: concentrar toda lógica de persistência em um único método reutilizável (inatividade, troca de nota, troca de rota, destroy).

`NotesStore` (`notes.store.ts`)
- Fonte de verdade para notas, seleção e busca.
- Usa `signal`, `computed` e `effect`.
- Carrega do backend e persiste cache em `localStorage`.
- Fornece operações: criar, selecionar, editar, salvar local, persistir draft, remover, mudar cor e filtrar.

Método criado no `NotesStore`:
- `persistNoteDraft(noteId, draft)`
  - O que faz: envia `PATCH` para API (`NotesService.update`) com os campos editáveis da nota e sincroniza o signal `notes` com o retorno.
  - Por que foi criado: manter a integração HTTP encapsulada no store e preservar o componente focado em fluxo de UI.

**Interação entre componentes**
Fluxo principal:
1. `NotesBoardComponent` compõe `NotesListComponent` + `NotesEditorComponent`.
2. `NotesListComponent` mostra `filteredNotes()` e informa `selectNote`/`deleteNote`.
3. `NotesEditorComponent` observa `selectedNote()` e edita título/conteúdo/cor.
4. `NotesStore` atualiza estado e persiste no `localStorage`.

**Fluxo de dados**
- Entrada: ações do usuário na lista e no editor.
- Estado: `NotesStore` mantém `notes`, `selectedId` e `query`.
- Saída: UI reativa através de `signals` (`computed` e `effect`).

**Persistência**
- `NotesStore` carrega notas do backend (`loadNotes`) e mantém cache de `notes` + `selectedId` em `localStorage`.
- O editor usa persistência dinâmica com:
  - `debounce` de 10 segundos de inatividade;
  - flush ao trocar nota;
  - flush ao trocar rota e no destroy;
  - `dirty check` para evitar requests sem mudança.

**Pontos de extensão**
- Adicionar campos à nota (ex: `tags`, `pinned`) no model e no `NotesStore`.
- Incluir ordenação ou filtros avançados em `filteredNotes`.
- Integrar API substituindo persistência local.
