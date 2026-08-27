# Progresso da Geração da Documentação v2.0

> **Arquivo temporário de controle.** Serve para retomar a geração desta documentação caso a sessão seja
> encerrada ou o contexto compactado. **Deve ser removido quando a geração estiver 100% concluída.**

## Decisões de Formato (já acordadas com o usuário)

1. **Urgência fica no Sprint 5** (opção A) — depois do expediente do Setor, para nascer com bloqueio automático.
2. **Backlog detalhado** (opção A) — casos de teste nomeados um a um, arquivos afetados listados individualmente.
3. **Branch `docs/v2-0-documentacao-preparatoria`** a partir de `develop`, commitada. **O usuário abre a PR.**

## Fontes de Verdade

Todo o conteúdo deriva de `docs/auditoria-gestores-unidade-espaco/` (8 documentos, não versionada — é material de
trabalho, está no `.gitignore`). Consolidado de 5 rodadas: **43 decisões fechadas** (P-01..P-34, D-1..D-9),
**24 casos de uso** (UC-01..UC-24), **23 riscos** (R-01..R-23).

## Manifesto de Arquivos

### Núcleo

| Arquivo | Status |
|---|---|
| `README.md` (documento base norteador) | ✅ |
| `_PROGRESSO-GERACAO.md` (este arquivo) | ✅ |
| `00-visao-geral/01-escopo-e-objetivos.md` | ⬜ |
| `00-visao-geral/02-atores-e-papeis.md` | ⬜ |
| `00-visao-geral/03-decisoes-consolidadas.md` | ⬜ |
| `00-visao-geral/04-regras-invioaveis.md` | ⬜ |
| `00-visao-geral/05-glossario.md` | ⬜ |
| `01-casos-de-uso/README.md` | ⬜ |
| `01-casos-de-uso/01-casos-existentes.md` | ⬜ |
| `01-casos-de-uso/02-casos-novos.md` | ⬜ |
| `02-fluxos-e-diagramas/01-fluxos-por-ator.md` | ⬜ |
| `02-fluxos-e-diagramas/02-fluxos-de-tela.md` | ⬜ |
| `02-fluxos-e-diagramas/03-diagramas-de-sequencia.md` | ⬜ |
| `02-fluxos-e-diagramas/04-modelo-de-dados.md` | ⬜ |
| `03-arquitetura/01-backend.md` | ⬜ |
| `03-arquitetura/02-frontend.md` | ⬜ |
| `03-arquitetura/03-matriz-de-permissions.md` | ⬜ |
| `03-arquitetura/04-migrations.md` | ⬜ |
| `04-roadmap/README.md` | ⬜ |
| `04-roadmap/matriz-rastreabilidade.md` | ⬜ |
| `observacoes/README.md` | ⬜ |
| `observacoes/PROBLEMAS-IDENTIFICADOS.md` | ⬜ |
| `observacoes/DESVIOS-E-DECISOES.md` | ⬜ |
| `observacoes/REVISAO-PERIODICA.md` | ⬜ |

### Sprints (cada um: `README.md` + `backend/BACKLOG.md` + `frontend/BACKLOG.md` + `integracao/BACKLOG.md`)

| Sprint | Entrega | Status |
|---|---|---|
| `sprint-00-preparacao` | Dívida técnica: bug R-12, permissions órfãs de Andar | ⬜ |
| `sprint-01-gestor-unidade` | ⚠️ **bloco atômico R-18** — role, pivot, policies escopadas, CRUD, atribuição | ⬜ |
| `sprint-02-gestor-espaco` | Pivots módulo/espaço, precedência, atribuição, painel de órfãos | ⬜ |
| `sprint-03-dashboard-composto` | `HomeController`/`HomeService` de cascata → aditivo | ⬜ |
| `sprint-04-setor-expediente` | Responsável, expediente, exceções, auditoria | ⬜ |
| `sprint-05-aprovacao-urgencia` | `tipo_vinculo`, Fluxos A e B, busca por e-mail | ⬜ |
| `sprint-06-qrcode-chamados` | Reconciliação com PR #397, tutorial | ⬜ |
| `sprint-07-consolidacao-retroativa` | Rename `/institucional/` → `/administrativo/` | ⬜ |

## Plano de Tasks (esboço já definido, a detalhar nos BACKLOGs)

### Sprint 0 — Preparação
- **BE:** corrigir NPE `Auth::user()->setor->unidade` (R-12, 5 controllers + `UserService`); remover permissions
  órfãs `andares.criar`/`andares.atualizar` (P-32); extrair helper de resolução de escopo.
- **FE:** remover rótulos das permissions órfãs em `permission-labels.ts`.
- **INT:** regressão — usuário sem `setor_id` acessa telas administrativas sem erro 500.

### Sprint 1 — Gestor de Unidade (atômico)
- **BE:** migration `unidade_gestores`; role + permissions; relations; `getUnidadesGeridasPor()`; Policies
  escopadas (Modulo/Setor/Espaco/Unidade); escopo nas queries de listagem; endpoint de atribuição; notifications;
  `unidades.label_gestor` + endpoint estreito (D-8).
- **FE:** `roles.contract.ts` + constantes + labels; organism `GestoresUnidade`; campo `label_gestor`.
- **INT:** autorização cross-campus (R-01/R-18); seeds com 2 campi.

### Sprint 2 — Gestor de Espaço
- **BE:** migrations dos 2 pivots; role + permissions; relations; `getGestoresDeEspaco()` (precedência);
  `getEspacosGeridosPorGestorEspaco()` (com exclusão de override); `queryOrfaosDeGestorEspaco()`; endpoints de
  atribuição; notifications; painel de órfãos (detalhado GU / analítico Institucional — P-10).
- **FE:** contratos + labels; `GestoresEspacoInfraestrutura`; override no espaço + badge de origem; tela de órfãos.
- **INT:** precedência (override vence módulo); dashboard não mostra espaço com override alheio.

### Sprint 3 — Dashboard Composto
- **BE:** `HomeService` agregação aditiva; `HomeController` render único; blocos por permission.
- **FE:** `DashboardPage` única; widgets por papel; remoção das 3 páginas antigas.
- **INT:** multi-papel vê todos os blocos; verificação de N+1/performance (R-17).

### Sprint 4 — Setor Expandido
- **BE:** migration coordenador + expediente; migration `setor_excecoes_expediente`;
  `ExpedienteService::estaEmExpediente()` (3 estados); endpoint `PATCH /setores/{setor}/expediente`;
  `SetorPolicy::atualizarExpediente()` com delimitação por campo (R-21); trilha de auditoria (R-22).
- **FE:** `SetorExpedienteForm`; designação de responsável; indicador de setores sem expediente no dashboard.
- **INT:** os 3 estados; responsável não consegue alterar `unidade_id`.

### Sprint 5 — Aprovação de Urgência
- **BE:** migration `users.tipo_vinculo`; `TipoVinculoEnum` + prioridade derivada; migration
  `horarios.origem_avaliacao`; permission `reservas.avaliar-urgencia` + exclusão do institucional (P-34);
  `ReservaPolicy::avaliarComUrgencia()`; endpoint Fluxo A; `ReservaService::criarComUrgencia()` (Fluxo B);
  endpoint de busca por e-mail exato + rate limit (D-3); `UrgencyReservationApprovedNotification`.
- **FE:** contratos `tipo-vinculo` e `origem-avaliacao`; campo no cadastro/perfil; `WidgetAprovacaoUrgencia`;
  Fluxo B (busca + criação assistida); badge de origem + aviso de expediente indeterminado.
- **INT:** autorização da urgência (escopo, dia, conflito); Fluxo A recusa reserva multi-dia; integração com os 3
  estados do expediente.

### Sprint 6 — QR Code e Chamados
- Reconciliação com a PR #397 (`feat/tickets-module`); `tipos_chamado.tutorial` (Markdown sanitizado);
  rota pública `/reportar/{espaco:public_id}`; triagem via `getGestoresDeEspaco()`.

### Sprint 7 — Consolidação Retroativa
- Rename `/institucional/` → `/administrativo/` (URL **e** nome de rota, atômico; 51 referências em
  `resources/js` + Ziggy); páginas compartilhadas remanescentes.

## Achados de Código a Preservar (da auditoria)

| Achado | Onde |
|---|---|
| `HomeController` usa `match(true)` e `HomeService` usa `if/elseif` — cascata exclusiva esconde dados de multi-papel | `app/Http/Controllers/HomeController.php`, `app/Services/HomeService.php` |
| `Auth::user()->setor->unidade->instituicao_id` quebra com `setor_id` nulo (nullable em `StoreRegisterRequest`) | 5 controllers `Institucional/*` + `app/Services/UserService.php:45` |
| `RoleSeeder` exclui **duas** permissions do institucional: `reservas.deletar` e `reservas.atualizar` | `database/seeders/Production/RoleSeeder.php` |
| `andares.criar`/`andares.atualizar` existem no seeder e em `permission-labels.ts`, mas nunca são verificadas | `database/seeders/Production/PermissionSeeder.php` |
| `Role::booted()` lança `RuntimeException` ao renomear role com `is_system = true` | `app/Models/Role.php` |
| `Andar` não tem Policy/Controller — vive dentro de `ModuloService` | `app/Services/ModuloService.php` |
| `/gestor/` já existe como prefixo (2 grupos) — por isso o rename usa `/administrativo/`, não `/gestao/` | `routes/web.php` |
| Ziggy 2.5.2; 51 ocorrências de `'institucional.*'` em `resources/js` | `composer.json`, `resources/js` |
| `ReservaService::create($data, Auth::user())` — solicitante é sempre o autenticado (Fluxo B precisa mudar isso) | `app/Http/Controllers/ReservaController.php:44` |
| `ProcessarCriacaoReserva` já recebe `$solicitante` no construtor (plumbing pronto para Fluxo B) | `app/Jobs/ProcessarCriacaoReserva.php:48` |
