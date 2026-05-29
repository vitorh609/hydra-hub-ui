# Whiteboard

Tela de quadro branco em Angular usando Konva.js. A rota e carregada de forma lazy em
`/apps/whiteboard` para manter o bundle inicial do dashboard menor.

## Arquivos principais

- `whiteboard.component.ts`: orquestra ferramentas, eventos do Konva, selecao, zoom, pan,
  historico, renderizacao e exportacao.
- `whiteboard.component.html`: toolbar, painel de propriedades e editor de texto flutuante.
- `whiteboard.component.scss`: layout full-viewport, grid visual e estados dos controles.
- `whiteboard-state.service.ts`: leitura/escrita do documento no `localStorage` e normalizacao
  defensiva dos dados salvos.
- `whiteboard.types.ts`: modelo serializavel dos elementos do quadro.

## Modelo de dados

O componente nao salva o JSON interno do Konva. O estado persistido usa `WhiteboardDocument`,
com `version`, `elements` e `viewport`.

Cada elemento tem um `id`, `type`, coordenadas e propriedades visuais comuns. Formas especificas
adicionam seus proprios campos:

- `rectangle`: `width` e `height`.
- `ellipse`: `radiusX` e `radiusY`.
- `line`, `arrow`, `freehand`: `points`.
- `text`: `text` e `width`.

Essa separacao deixa o armazenamento mais estavel caso a API do Konva mude.

## Fluxo de edicao

1. `setTool` troca a ferramenta ativa e limpa selecao quando necessario.
2. `handlePointerDown`, `handlePointerMove` e `handlePointerUp` convertem eventos do stage em
   operacoes no modelo.
3. `recordHistory` salva snapshots antes de mutacoes que devem entrar em undo/redo.
4. `renderDocument` recria os nodes Konva a partir de `WhiteboardDocument`.
5. `updateElementFromNode` converte drag/resize de volta para o modelo serializavel.
6. `saveDocument` persiste no `localStorage` usando a chave `hydra.whiteboard.document.v1`.

## Ferramentas

- `select`: seleciona, move e redimensiona elementos com `Konva.Transformer`.
- `pan`: move o viewport do stage.
- `rectangle`, `ellipse`, `line`, `arrow`: criam formas por arrasto.
- `freehand`: adiciona pontos ao arrastar.
- `text`: abre um `textarea` sobre o canvas e cria texto ao confirmar.
- `eraser`: remove o elemento clicado.

## Manutencao e melhorias

- Para adicionar uma nova ferramenta, atualize `WhiteboardTool`, `WhiteboardElementType`, a lista
  `tools`, `createElement`, `updateDraft`, `renderElement` e, se necessario,
  `updateElementFromNode`.
- Para novas propriedades visuais, atualize `WhiteboardStyle`, `DEFAULT_STYLE`, o painel no HTML,
  `updateStyle` e a aplicacao da propriedade em `renderElement`.
- Se mudar o formato salvo, crie uma nova versao em `WhiteboardDocument` e trate migracao ou
  fallback em `WhiteboardStateService.normalizeDocument`.
- Ao mexer em zoom/pan, mantenha `getBoardPointer`, `boardToScreen`, `pushViewportToStage` e
  `updateGrid` coerentes. Eles precisam usar a mesma escala e posicao do viewport.
- Evite guardar referencias Konva no estado Angular. Use Konva apenas como camada de renderizacao
  e interacao.
- Mantenha a rota lazy-loaded. Importar o componente diretamente em `app.routes.ts` aumenta o
  bundle inicial por causa do Konva.

## Verificacao recomendada

Depois de alterar a feature, rode:

```bash
npm run build
```

Depois teste manualmente:

- desenhar todos os tipos de elemento;
- selecionar, mover e redimensionar;
- alterar propriedades de elementos selecionados e de novos elementos;
- usar zoom e pan;
- desfazer/refazer;
- exportar PNG;
- recarregar a pagina e conferir restauracao do `localStorage`;
- alternar tema claro/escuro;
- validar desktop e tablet.
