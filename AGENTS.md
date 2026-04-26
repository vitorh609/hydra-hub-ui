# Hydra Hub UI

Projeto Angular com foco em componentes standalone, reaproveitamento de UI e consistencia visual entre dashboard, sidebar, topbar e paginas internas.

## Contexto Sempre Ativo

- Stack principal: Angular, componentes standalone, formularios reativos tipados e `signals` onde fizer sentido.
- Reutilize componentes existentes antes de criar novos, especialmente em `src/app/core/ui/`.
- Preserve o sistema de tema via tokens CSS. Evite cores hardcoded quando houver token equivalente.
- `app-icon` usa `currentColor`. Nao aplique cores fixas em containers se isso puder quebrar dark/light.
- Mudancas de navegacao normalmente exigem revisar rota, sidebar e eventualmente topbar.
- Para listas e grades, priorize o componente reutilizavel de tabela ja existente antes de criar outra implementacao.
- Evite duplicar padroes de layout, estado e estilos que ja existam em features do dashboard.

## Como Trabalhar Com Este Repo

- Antes de propor alteracao estrutural ou implementar codigo, leia este arquivo por completo.
- Antes de implementar feature de dashboard, leia `README.md`.
- Se a tarefa envolver `documents`, leia `src/app/features/dashboard/pages/documents-page/README.md`.
- Se a tarefa envolver `notes`, leia `src/app/features/dashboard/components/notes/README.md`.
- Se a tarefa envolver tabela, lista ou grade reutilizavel do dashboard, leia `src/app/features/dashboard/components/table/README.md` e use o skill repo-local `dashboard-table` quando disponivel.
- Ao alterar UI, valide responsividade e compatibilidade com tema dark/light.
- Ao criar componente novo, mantenha tipagem estrita e siga os padroes de standalone component do projeto.

## Checklist Obrigatorio Antes De Codar

Siga esta ordem antes de editar arquivos:

1. Ler `AGENTS.md`.
2. Ler `README.md`.
3. Identificar a area impactada pela tarefa.
4. Se existir README especifico da area impactada, ler esse README antes de alterar codigo.
5. Reutilizar padroes e componentes existentes antes de criar novas estruturas.

Se a tarefa nao tocar `documents` nem `notes`, nao carregue esses READMEs sem necessidade.

Se a tarefa for pequena e localizada, mantenha o contexto minimo. Se for ampla, carregue apenas os READMEs das areas realmente afetadas.

## Objetivo Deste Arquivo

Este arquivo deve permanecer curto. Use-o para regras globais e estaveis. Detalhes maiores devem ficar nos READMEs das features ou em skills de contexto sob demanda, para reduzir tokens e custo de processamento em tarefas simples.
