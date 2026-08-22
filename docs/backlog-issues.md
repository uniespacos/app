# Fila de Issues — Acompanhamento

A partir da auditoria em [`auditoria-issues-2026-08-20.md`](./auditoria-issues-2026-08-20.md).
Atualizado a cada entrega.

**Última atualização:** 2026-08-22 · develop em `ee79eb4` (release rc.22) · #108 mergeada (PR #266) · #119/#222/#101/#105/#111 fechadas no GitHub · **#108 ainda OPEN no GitHub — falta fechar na mão**

---

## ✅ Concluídas

- [x] **#119 — IDOR em detalhes/edição de reserva** `P0`
  Branch `fix/idor-reserva-authorization` → PR #253 → merged `4a59670`
  Regressão de um fix anterior (`725d76f` corrigiu, `214c437` removeu no refactor). Achados extras: vazamento de PII (email/telefone) e escalada de privilégio no `GestorReservaController::update`. Inclui página de erro Inertia (fatia da #112).
  *9 testes de regressão · baseline 6 falhas → 9 passando*

- [x] **#222 — Link de notificação abre semana errada** `P1`
  Branch `fix/222-semana-reserva-notificacao` → PR #256 → merged `3b62a3e`
  Corrigido no `show()` e não nas Notifications, porque a URL fica gravada na tabela `notifications` — assim o histórico já enviado também é consertado. Helper `resolveDataAncora` unificou o padrão em 3 pontos.
  *8 testes · baseline 5 falhas → 8 passando*

- [x] **#101 — Ordem dos gestores por turno no admin** `P1`
  Branch `fix/101-ordem-gestores-turno` → PR #258 → merged `4374bcd`
  Espelhou o padrão do `GerenciarGestoresDialog` (enumerar turnos fixos) em vez de só ordenar, atendendo ao "mesmo que o turno esteja vazio". Extraiu `TURNOS_ORDENADOS`/`TURNO_LABEL` eliminando 3 cópias da ordem.
  *6 testes de componente · baseline 5 falhas → 6 passando*

- [x] **#105 — Exibir espaço e módulo na lista de reservas** `P2`
  Branch `fix/105-modulo-lista-reservas` → PR #261 → merged `4cd67ea` · issue fechada
  Cadeia `andar.modulo` adicionada ao eager loading dos dois repositórios. No `getPaginatedForGestor`, que usa selects por coluna, foi preciso incluir `andar_id`/`modulo_id` — sem as chaves estrangeiras a relação aninhada volta `null` sem erro. Extraído o componente `LocalReserva`.
  *3 testes de payload + 4 de componente · baseline 3 falhas → 7 passando*

- [x] **#112 — Tratamento de erros e logging padronizados** `P2`
  Branch `fix/112-tratamento-erros-api` → PR #263 → merged `a504887` · ⚠️ **issue ainda OPEN no GitHub**
  A premissa da issue não batia com o código: não existe `routes/api.php`, e os únicos endpoints JSON vivos são os 4 de relatórios. Envelope feito **aditivo** (`error_code`/`details` ao lado de `message`/`errors`), porque `use-gerar-relatorio.ts` lê `data.message` na raiz e o `useForm` do Inertia depende do bag `errors` — mover qualquer um dos dois quebraria em silêncio.
  Decisão de segurança: a issue pedia "request data" no log, mas o app trafega senha em texto plano (`ConfirmPasswordRequest`, no cancelamento de reserva). O payload ficou **fora** do contexto, travado por teste.
  Achado de bug: `phpunit.xml` definia `APP_ENV=testing` sem `force="true"`, então o `.env` do container de dev vencia e **a suíte nunca rodou em env `testing`** — o bypass da página de erro da #119 nunca foi exercitado como documentado.
  O GitGuardian barrou o PR por causa dos literais `'password' => 'senha-super-secreta'` no teste novo; trocados por canários de runtime (`347ca67`). Falso positivo — nenhuma credencial real vazou.
  *26 chamadas de log padronizadas · 13 testes novos · 95 → 115 testes passando*

- [x] **#108 — Filtro/arquivamento (soft delete) de reservas** `P1`
  Branch `fix/108-filtro-arquivamento-reservas` → PR #266 → merged `8f180f0` (+ ajuste visual `ed85116`) · ⚠️ **issue ainda OPEN no GitHub**
  O requisito 1 da issue (soft delete) **já estava pronto** — `cancel()` marca `inativa` em transação e não existe delete permanente. A issue descrevia um risco inexistente.
  O bug real era outro: `getPaginatedForUser` aplicava `where('situacao', '!=', 'inativa')` incondicionalmente e logo depois oferecia filtro por situação, então filtrar por arquivadas produzia `situacao != 'inativa' AND situacao = 'inativa'` — **contradição lógica, lista sempre vazia**. O gestor tinha a versão correta do mesmo código; a assimetria era a raiz.
  Achado extra: **"Todas" mentia para os dois papéis** — mandava `''`, o parâmetro sumia, e ambos caíam no default que esconde arquivadas.
  Solução: separar os eixos. `situacao` fica só com resultado de avaliação; novo `arquivo` (`ativas`/`arquivadas`/`todas`) via `scopeArquivo` no model, usado pelos dois repositórios. URL legada `?situacao=inativa` é traduzida para não passar a devolver vazio. Entrou também uma guarda de idempotência no cancelamento (recancelar reserva arquivada não dispara mais notificação repetida).
  *12 testes de feature + 6 de componente · baseline 8 falhas → 12 passando · 115 → 127 testes PHP*

---

## 🔨 Em andamento

- [ ] **#265 — Avaliar uma reserva arquivada a ressuscita** `P1` · `effort: small`
  Isolada de propósito: `AvaliarReservaJob::updateReservaOverallStatus` (linha ~255) recalcula `situacao` a partir da contagem de horários e o `match` não trata `inativa` — toda avaliação em uma reserva arquivada a ressuscita para `em_analise`/`deferida`/etc. Branch a partir de `develop` (que já tem a #108).

---

## 📋 Fila

**Bugs críticos (do core-workflow-report.md)**

- [ ] **GAP-03 — Escopo `recurring` em AvaliarReservaJob excede agendas do gestor** `P1` · `effort: small`
  No `AvaliarReservaJob` com `scope=recurring`, a propagação não restringe às agendas que o gestor gerencia — pode exceder responsabilidade. Validar por agenda_id.

- [ ] **#255 — `data_inicial`/`data_final` dessincronizam na edição single** `P2` · `effort: medium`
  Com `edit_scope='single'`, período reescrito com limites da semana. Bloqueia navegação. Requer migração de dados.

**Melhorias de dados (do core-workflow-report.md)**

- [ ] **GAP-02 — UpdateReservaJob não regenera conflitos** `P1` · `effort: medium`
  Após edição, `conflict_cache` fica obsoleto. Despachar `ValidateReservationConflictsJob` ao final do job.

- [ ] **GAP-06 — ReservaPolicy.update muito restritiva** `P2` · `effort: small`
  Bloqueia qualquer edição se 1+ horário foi avaliado. Permitir granularmente (só dos não-avaliados).

- [ ] **#260 — Edição admin não registra log nem notifica dono** `P3` · `effort: medium`
  Permission `reservas.atualizar` já permite edições, mas falta auditoria e notificação ao dono.

**UX em tempo real (do core-workflow-report.md)**

- [ ] **GAP-01 — AvaliarReservaPage não auto-reload após ValidateJob terminar** `P0` · `effort: medium`
  Gestor vê loading indefinidamente. Implementar evento Reverb `ReservationValidatedBroadcast` ao fim do job.

- [ ] **GAP-07 — Falta feedback de progresso para solicitante na criação** `P2` · `effort: medium`
  Flash genérico "sendo processado". Adicionar dashboard com barra de progresso via Reverb.

**Escalabilidade e UX (do core-workflow-report.md)**

- [ ] **GAP-05 — ReservasGestorPage sem filtro de período** `P2` · `effort: medium`
  Lista traz todas as reservas sem data filter — lento em produção. Adicionar período + índice.

- [ ] **GAP-04 — Notificações de e-mail sem template HTML** `P2` · `effort: small`
  `BaseNotification.toMail()` usa texto puro. Usar template Blade customizado.

**Outros GitHub issues**

- [ ] **#104 — Templates de horário configuráveis pelo gestor** `P0 de negócio` · `effort: large`
  Nenhuma base no código. Exige migration, revisão da lógica de conflito e do calendário. **Precisa de design antes da execução.**

- [ ] **#102 — Ordenação na "Gerenciar Reservas"** `P3` · `effort: large`

- [ ] **#48 — Filtro/busca no dashboard do gestor** `P3`
  Parcial: busca na aba "Favoritos" sem debounce. Falta na aba "Espaços que gerencio" e filtro de pavilhão.

- [ ] **#98 — Versão de build no footer admin via CI/CD** `P3`

- [ ] **#106 — Dia da semana nos grupos de turno** `P4`
  ⚠️ **Validar antes de investir:** o header sticky já entrega o essencial.

- [ ] **#107 — Alerta de solicitações pendentes sobrepostas** `P4` · `effort: large`

- [ ] **#46 — Edição administrativa de reserva** `P4`
  Escopo maior: exige audit log, notificação ao dono, habilitar permission `reservas.atualizar`.

- [ ] **#49 — Navegação rápida entre salas do pavilhão** `P4`

**Futuro (requer design)**

- [ ] **GAP-08 — Dashboard com métricas de ocupação** `P3` · `effort: large`
  `HomeController`/`HomeService` existem mas não consolidam ocupação. Gráficos e tendências.

- [ ] **GAP-09 — Aprovação parcial granular** `P3` · `effort: medium`
  Status `parcialmente_deferida` sem caminho claro. Notificar solicitante com opções.

- [ ] **GAP-10 — Histórico e audit trail de avaliações** `P3` · `effort: medium`
  Falta rastreabilidade além de `user_id` no `Horario`. Tabela de log ou eventos de domínio.

- [ ] **GAP-11 — Reverb completo (auto-reload em ReservasPage, etc.)** `P3` · `effort: large`
  Eventos só notificam novas notificações. Estruturar canais (ex.: `reservas.{user_id}`) para recarregar dados.

---

## 🚫 Fora da fila

- [x] **#111 — Alerta de exclusão mal posicionado** → **fechada em 2026-08-20**
  Já estava corrigida no código antes da auditoria (`Dialog` do Radix em `delete-item.tsx:54-100`), aparentemente por refatoração que não referenciou a issue. Verificada e fechada. A label `P0` estava obsoleta.

- [ ] **#41 — Refresh manual (F5)** → manter `wontfix`
  Decisão já tomada pelo time.

---

## Pendências de gestão (não são código)

- [x] Fechar a **#111** — feita em 2026-08-20
- [x] Fechar **#119**, **#222**, **#101** com comentário do que foi corrigido — feitas em 2026-08-20
- [ ] Fechar **#112** e **#108** no GitHub com comentário — mergeadas (PR #263 e #266) mas seguem OPEN, mesmo problema do `Closes #NNN` não disparar auto-close em merge para `develop`
- [ ] Repriorizar a **#119** de `P2` → `P0` no GitHub (registro histórico; a issue já está fechada)
- [ ] Decidir se `institucional` sem agendas **deveria** avaliar reservas (efeito colateral documentado na #119)
- [ ] Decidir o escopo pretendido de `reservas.atualizar` — ver as três opções na **#260**
- [ ] Validar a **#106** com o time antes de investir

> A ressalva sobre o corpo da #119 (`ReservaPolicy::view()` desatualizada) ficou registrada no comentário de fechamento, então não é mais necessário editar o corpo da issue.

---

## Placar

| | |
|---|---|
| Concluídas e mergeadas | **6** (#119, #222, #101, #105, #112, #108) |
| Fechadas no GitHub | **6** (#119, #222, #101, #105, #111, #112) — **#108 falta fechar** |
| Em andamento | **1** (#265) |
| Na fila | **23** (9 GitHub issues + 11 GAPs + futuro) |
| Wontfix | **1** (#41) |

> ⚠️ **Fechar issues manualmente após o merge.** O `Closes #NNN` no commit **não** dispara o auto-close quando o merge é para `develop` — o GitHub só fecha automaticamente em merges para o branch default (`main`).
