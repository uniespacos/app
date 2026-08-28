# Sprint 5 — Aprovação de Urgência · Integração Backlog

**Objetivo:** Validar de ponta a ponta que a aprovação em regime de urgência (Fluxo A e Fluxo B) não constitui um vetor de abuso (R-09), não quebra a auto-aprovação (R-16), respeita o escopo espacial (R-01, R-18), e está adequadamente protegida contra enumeração e exploração.

**Prioridade:** Crítica — estes testes validam os riscos mais graves da migração v2.0.

**Dependências:** `backend/BACKLOG.md` (S5-BE-01 a S5-BE-12) e `frontend/BACKLOG.md` (S5-FE-01 a S5-FE-08) devem estar prontos antes.

**Nota:** Esta trilha é a **última do sprint** — validação integrada só ocorre quando backend e frontend já estão compilados e passando.

---

## S5-INT-01 — Teste de Autorização: Escopo Espacial, Exclusividade de Data e Ausência de Conflito

- **Objetivo:** Provar que a aprovação de urgência respeita 3 limites invioláveis: (1) Gestor de Espaço só aprova nos espaços que gerencia, (2) apenas horários de **hoje**, (3) sem conflito com horário já deferido.
- **Caso de uso:** UC-21 (Fluxo A), UC-22 (aprovação por urgência).
- **Atores envolvidos:** Gestor de Espaço (operador), Gestor de Reserva (titular da agenda).
- **Partes afetadas:**
  - `tests/Feature/Authorization/GestorEspacoReservaUrgenteAuthorizationTest.php` (NOVO)
  - Relatório de cobertura esperado em `test-report-s5-int-01.md` (observações/)
- **Depende de:** S5-BE-07 (Policy `ReservaPolicy::avaliarComUrgencia()`), S5-BE-09 (endpoint `PATCH /gestor-espaco/reservas-urgentes/{horario}`).
- **Riscos relacionados:** R-01 (escopo vazando entre unidades), R-18 (permissions sequenciadas corretamente).
- **Casos de teste obrigatórios:**
  - `test_gestores_espaco_podem_aprovar_no_seu_escopo` — Gestor A gerencia Espaço 1, cria reserva em Espaço 1 com horário hoje em análise, aprova com 200; sucesso esperado.
  - `test_gestores_espaco_recusam_fora_do_escopo` — Gestor A gerencia Espaço 1, tenta aprovar horário do Espaço 2 que não gerencia, 403.
  - `test_gestores_espaco_recusam_horario_data_futura` — horário agendado para amanhã, tentativa de aprovação hoje retorna 403 ou recusa.
  - `test_gestores_espaco_recusam_horario_data_passada` — horário de ontem, tentativa retorna 403.
  - `test_gestores_espaco_recusam_horario_com_conflito_deferida` — horário sobreposto com deferida existente, 403 ou erro específico de conflito.
  - `test_usuario_sem_permissao_recusa_urgencia` — Comum tenta aprovar, 403; Gestor de Reserva tenta, 403.
  - `test_gestor_unidade_recusa_urgencia` — Gestor de Unidade não tem permission, 403 (não devem ter `reservas.avaliar-urgencia`).
- **Critérios de aceite:**
  - [ ] Teste file criado em `tests/Feature/Authorization/GestorEspacoReservaUrgenteAuthorizationTest.php`.
  - [ ] Cada teste setup com DatabaseTransactions, sem migrate:fresh.
  - [ ] Testes usam 2+ Gestores de Espaço e 2+ Espaços, validando isolamento.
  - [ ] Confirmação de escopo via `getEspacosGeridosPorGestorEspaco()` (algoritmo de precedência, doc §3.1).
  - [ ] Hoje = `today()`, data futura = `today()->addDay()`, data passada = `today()->subDay()`.
  - [ ] Conflito validado com `ConflictDetectionService::temConflitoComDeferida()` (já existente, reusável).
  - [ ] Todos 7 testes passam em `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test tests/Feature/Authorization/GestorEspacoReservaUrgenteAuthorizationTest.php`.
  - [ ] Coverage ≥ 90% da policy method `avaliarComUrgencia()`.
  - [ ] Sem `.skip()`, sem `markTestIncomplete()`.

---

## S5-INT-02 — Teste do Fluxo A: Rejeição de Reserva com Horário Fora de Hoje (P-17 — Defesa Crítica)

- **Objetivo:** Validar que a aprovação de urgência **recusa** uma reserva contendo **qualquer** horário de data diferente de hoje, forçando-a de volta ao fluxo normal do Gestor de Reserva. Este é um **controle crítico contra abuso** (R-09): impede um Gestor de Espaço de aproveitar-se da urgência para uma reserva semestral inteira.
- **Caso de uso:** UC-21 (Fluxo A), P-17 (regra de negócio fechada).
- **Atores envolvidos:** Gestor de Espaço (tentando aprovar), Gestor de Reserva (avaliador legítimo da reserva).
- **Partes afetadas:**
  - `tests/Feature/Urgencia/FluxoAMultiDiaTest.php` (NOVO — nome descritivo propositalmente)
  - Backend: `ReservaPolicy::avaliarComUrgencia()` (deve rejeitar).
- **Depende de:** S5-BE-04 (modelo Horario com campo `data`), S5-BE-07 (Policy), S5-BE-09 (endpoint).
- **Riscos relacionados:** R-09 (abuso de urgência — mitigado por esta validação), P-17 (decisão de negócio fechada).
- **Casos de teste obrigatórios:**
  - **CRÍTICO:** `test_fluxo_a_recusa_reserva_com_horario_fora_de_hoje` — Reserva com 3 horários: hoje, amanhã, hoje. Tenta-se aprovar o 1º horário (hoje) — **deve falhar** porque a reserva contém horário fora de hoje. Retorna 403/422 com mensagem clara.
  - `test_fluxo_a_recusa_reserva_totalmente_futura` — Reserva inteira marcada para amanhã, tentativa retorna 403.
  - `test_fluxo_a_recusa_reserva_totalmente_passada` — Reserva inteira de ontem, tentativa retorna 403.
  - `test_fluxo_a_aceita_reserva_exclusivamente_hoje` — Reserva com 4 horários, todos de hoje, aprovação sucede com 200.
  - `test_fluxo_a_rejeita_permanece_em_analise` — Após rejeição, horário volta para `em_analise` ou `solicitado`, não bloqueia (segue fluxo normal).
- **Critérios de aceite:**
  - [ ] Teste file criado `tests/Feature/Urgencia/FluxoAMultiDiaTest.php`.
  - [ ] Cada teste setup com DatabaseTransactions.
  - [ ] Teste principal (`test_fluxo_a_recusa_reserva_com_horario_fora_de_hoje`) é explicito e nomeado com propósito.
  - [ ] Validação ocorre no backend antes de qualquer alteração no banco (Policy + query defensiva).
  - [ ] Mensagem de erro clara: "Esta reserva contém horários fora de hoje. A aprovação por urgência só é permitida para reservas de um único dia."
  - [ ] Sem side effects: rejeitada não significa a reserva muda de situação, permanece `em_analise`.
  - [ ] Todos 5 testes passam.
  - [ ] Nenhuma surpresa de silência (erro 500 ou timeout) — se falhar, falha com message clara.

---

## S5-INT-03 — Teste de Integração com 3 Estados do Expediente do Setor (P-23, P-28, D-2, D-6)

- **Objetivo:** Validar que a validação de expediente integrada do backend funciona corretamente nos 3 estados documentados: `true` (bloqueia), `false` (libera), `null` (libera com aviso no frontend). Este teste replica em cenário de ponta a ponta a lógica mapeada em document 05 §11.
- **Caso de uso:** UC-21 (Fluxo A), P-23 (expediente de setor), D-2 (bloqueio quando em expediente), D-6 (preenchimento gradual).
- **Atores envolvidos:** Gestor de Espaço (aprovador), Gestor de Reserva (titular da agenda, seu setor configurado com expediente).
- **Partes afetadas:**
  - `tests/Feature/Urgencia/ExpedienteIntegrationTest.php` (NOVO)
  - Backend: `ExpedienteService::estaEmExpediente()` (S5-BE-06), `ReservaPolicy::avaliarComUrgencia()` (S5-BE-07).
  - Seeding: Setor com expediente configurado (horários, dias).
  - Seeding: Setor sem expediente (NULL).
- **Depende de:** S5-BE-03 (migration de `setor_excecoes_expediente`), S5-BE-06 (serviço de expediente), S5-BE-07 (política integrada).
- **Riscos relacionados:** R-20 (expediente vazio no deploy — mitigado por liberar com aviso quando `null`).
- **Casos de teste obrigatórios:**
  - `test_expediente_true_bloqueia_urgencia` — Setor do Gestor de Reserva marcado como em expediente agora → tentativa de urgência retorna 403 com mensagem "Gestor disponível, fluxo normal recomendado".
  - `test_expediente_false_libera_urgencia` — Setor fora de expediente (ex.: domingo, ou fora do horário) → urgência liberada, 200.
  - `test_expediente_null_libera_com_aviso` — Setor sem horário cadastrado → urgência liberada, mas resposta inclui flag `aviso_expediente_indeterminado: true`, que o frontend exibe como `AvisoExpedienteIndeterminado.tsx`.
  - `test_expediente_consulta_momento_aprovacao` — Aprovação marcada para `now()`, não para o horário da reserva (semântica temporal, §7.7.2).
  - `test_excecao_expediente_intervalo_funciona` — Período de recesso (ex.: 20-30 de janeiro) como `fechado=true`, tentativa de urgência durante esse período retorna bloqueada.
  - `test_excecao_expediente_especial_permite_fora_horario` — Período com `fechado=false` e `horario_abertura/fechamento` especial, aprova se dentro desse intervalo.
- **Critérios de aceite:**
  - [ ] Teste file `tests/Feature/Urgencia/ExpedienteIntegrationTest.php` criado.
  - [ ] Setup com DatabaseTransactions, seeding de Setores + exceções.
  - [ ] Cada estado (`true`, `false`, `null`) testado isoladamente.
  - [ ] Mock de `now()` para validar "momento da aprovação" (ex.: use `Carbon::setTestNow()`).
  - [ ] Resposta `false` do backend: "Gestor de Reserva em expediente — fluxo normal recomendado" ou similar.
  - [ ] Resposta `null` do backend: `aviso_expediente_indeterminado: true` retornado no payload, **sem bloquear**.
  - [ ] Todos 6 testes passam.
  - [ ] Integração com `ExpedienteService` confirmada (não é mock).

---

## S5-INT-04 — Teste de Que `institucional` NUNCA Recebe `reservas.avaliar-urgencia` (P-34 — 3ª Exclusão Crítica)

- **Objetivo:** Provar que a sincronização automática do `RoleSeeder` **exclui explicitamente** `reservas.avaliar-urgencia` do role `institucional`, junto com `reservas.deletar` e `reservas.atualizar` (P-34, decisão fechada). Isto previne que um `institucional` contorne a separação de papéis aprovando reservas por urgência.
- **Caso de uso:** P-34 (regra de exclusão), divisão de papéis.
- **Atores envolvidos:** Institucional (nunca deve ter permission).
- **Partes afetados:**
  - `tests/Unit/Seeders/RoleSeederTest.php` (NOVO ou extensão)
  - Backend: `RoleSeeder::run()` (S5-BE-12, verificar 3ª exclusão).
- **Depende de:** S5-BE-12 (RoleSeeder com 3 exclusões).
- **Riscos relacionados:** R-18 (permissions sequenciadas — se institucional tiver a permission, o risco reabre).
- **Casos de teste obrigatórios:**
  - `test_role_seeder_exclui_reservas_avaliar_urgencia_de_institucional` — Roda seeder, carrega `institucional` role, afirma que ele não tem permission `reservas.avaliar-urgencia`.
  - `test_role_seeder_exclui_reservas_deletar_de_institucional` — Confirma 2ª exclusão.
  - `test_role_seeder_exclui_reservas_atualizar_de_institucional` — Confirma 1ª exclusão.
  - `test_gestor_espaco_tem_reservas_avaliar_urgencia` — Roda seeder, role `gestor_espaco` **tem** a permission.
  - `test_gestor_reserva_nao_tem_reservas_avaliar_urgencia` — Confirma que Gestor de Reserva não recebe (essa é exclusiva de Gestor de Espaço).
  - `test_role_seeder_nao_cria_permission_duplicada` — Rodar seeder 2x não duplica nenhuma permission.
- **Critérios de aceite:**
  - [ ] Teste file criado/estendido em `tests/Unit/Seeders/RoleSeederTest.php`.
  - [ ] Cada teste roda `php artisan db:seed --class=RoleSeeder` ou `Artisan::call('db:seed', ['--class' => 'RoleSeeder'])`.
  - [ ] Assertions usam `$this->assertFalse($role->hasPermissionTo('reservas.avaliar-urgencia'))` ou similar.
  - [ ] Testes executáveis com DatabaseTransactions (não precisa de migrate:fresh).
  - [ ] Seeder verificado ter **exatamente 3** exclusões: `reservas.deletar`, `reservas.atualizar`, `reservas.avaliar-urgencia`.
  - [ ] Todos 6 testes passam.
  - [ ] Nenhuma surpresa: se seeder mudar acidentalmente de `->where('name', '!=', ...)` para `->whereNotIn(...)`, testes pegam a diferença.

---

## S5-INT-05 — Teste do Fluxo B de Ponta a Ponta: Criação Já Deferida, Notificação ao Gestor de Reserva

- **Objetivo:** Validar que o Fluxo B (criação de reserva em nome de terceiro) gera uma reserva já `deferida`, com `origem_avaliacao = 'urgencia_gestor_espaco'`, cujo `Horario.user_id` aponta para o Gestor de Espaço que operou, e que o Gestor de Reserva titular **recebe a notificação** (com `ShouldQueue` obrigatório).
- **Caso de uso:** UC-21 (Fluxo B), UC-22 (criação e aprovação síncrona).
- **Atores envolvidos:** Gestor de Espaço (criador), solicitante (terceiro, na reserva), Gestor de Reserva (titular da agenda, notificado).
- **Partes afetadas:**
  - `tests/Feature/Urgencia/FluxoBWalkinIntegrationTest.php` (NOVO)
  - Backend: `ReservaService::criarComUrgencia()` (S5-BE-11), `UrgencyReservationApprovedNotification` (S5-BE-07).
  - Fila/dispatcher de notificações (`Queue::fake()` para validação).
- **Depende de:** S5-BE-10 (endpoint POST de criação), S5-BE-11 (serviço síncrono de criação), S5-BE-07 (notificação obrigatória).
- **Riscos relacionados:** R-16 (auto-aprovação — não dispara, criação é direta com aprovação já no banco).
- **Casos de teste obrigatórios:**
  - `test_fluxo_b_cria_reserva_ja_deferida` — POST `/gestor-espaco/reservas-urgentes` com dados válidos retorna 201, Reserva criada tem `situacao = 'deferida'`.
  - `test_fluxo_b_define_origem_urgencia_gestor_espaco` — Horarios da reserva criada têm `origem_avaliacao = 'urgencia_gestor_espaco'`.
  - `test_fluxo_b_horario_user_id_aponta_para_gestor_espaco` — `Horario.user_id` é o ID do Gestor de Espaço que criou, não do solicitante.
  - `test_fluxo_b_dispara_notificacao_gestor_reserva_titular` — Após criação, `UrgencyReservationApprovedNotification` é enfileirada para o Gestor de Reserva (`Agenda.user`), com `ShouldQueue` ativo.
  - `test_fluxo_b_notificacao_apos_commit` — Notificação só é enfileirada **após** transação ser committed (não com rollback de test).
  - `test_fluxo_b_cria_sem_passar_por_auto_aprovacao` — ProcessarCriacaoReserva **não** é disparado para essa reserva — ela nasce já aprovada, sem job intermediário.
  - `test_fluxo_b_solicitante_nao_autoregistrado_recusa` — Solicitante com `id` inexistente ou fora do banco retorna 422/404.
- **Critérios de aceite:**
  - [ ] Teste file criado `tests/Feature/Urgencia/FluxoBWalkinIntegrationTest.php`.
  - [ ] Setup com DatabaseTransactions, seeding de Gestor de Espaço + Agenda + Gestor de Reserva.
  - [ ] Dados de entrada (`usuario_id`, `espaco_ids`, `horarios`) compatíveis com backend (S5-BE-10).
  - [ ] Resposta 201 inclui Reserva criada em payload (`{ id, user_id, situacao, horarios: [...] }`).
  - [ ] Cada `Horario` tem `origem_avaliacao = 'urgencia_gestor_espaco'` e `user_id` do Gestor de Espaço.
  - [ ] Notificação validada via `Queue::fake()` e `Notification::assertSent()` ou dispatcher direto (conforme configuração).
  - [ ] `ShouldQueue` implementado: notification tem `implements ShouldQueue` e `Queueable`.
  - [ ] Todos 7 testes passam.
  - [ ] Sem `.skip()` ou `markTestIncomplete()`.

---

## S5-INT-06 — Teste de Defesa em Profundidade: Query de Aprovação Rejeita Tentativa de Update Direto Fora do Escopo

- **Objetivo:** Validar que a lógica de update de aprovação de urgência **filtra fisicamente no banco** o `horario_id` pela propriedade `agenda.espaco_id`, em adição à checagem da Policy (defesa em profundidade). Isto impede que uma falha na Policy seja explorada por update direto do banco.
- **Caso de uso:** UC-21 (Fluxo A), segurança operacional.
- **Atores envolvidos:** Gestor de Espaço (tentando explorar).
- **Partes afetadas:**
  - `tests/Feature/Security/GestorEspacoUpdateDefenseTest.php` (NOVO)
  - Backend: `AvaliarReservaJob::handle()` ou equivalente que faz update (S5-BE-09, verificar implementação).
- **Depende de:** S5-BE-09 (endpoint com query defensiva).
- **Riscos relacionados:** R-09 (abuso — mitigado pela double-check), R-18 (escopo), padrão já existente em `AvaliarReservaJob`.
- **Casos de teste obrigatórios:**
  - `test_update_horario_rejeitado_se_espaco_fora_do_escopo_mesmo_com_policy_bypass` — Simula situação onde um Gestor de Espaço consegue bypassar a Policy (impossível em prática, mas teste prova que a query ainda protege): tenta fazer `Horario::where('id', $id)->update(...)` fora de sua query defensiva. Query deve retornar 0 rows affected, nunca atualizando.
  - `test_update_horario_aceito_dentro_do_escopo` — Horário do espaço gerenciado é atualizado normalmente.
  - `test_query_filtra_por_agenda_espaco_id` — Code inspection: query inclui `->whereIn('agenda_id', $agendasDoGestorIds)` ou equivalente com `espaco_id`.
- **Critérios de aceite:**
  - [ ] Teste file criado `tests/Feature/Security/GestorEspacoUpdateDefenseTest.php`.
  - [ ] Documentação de "defesa em profundidade" no método (comentário no código de backend confirmando padrão).
  - [ ] Query examinada inclui filtro de posse **além** da policy check (ex.: `Horario::where('id', $id)->whereIn('agenda.espaco_id', $espacoIds)`).
  - [ ] Testes passam — update fora de escopo retorna 0 ou false (nenhuma row atualizada).
  - [ ] Sem `.skip()`.

---

## S5-INT-07 — Teste de Rate Limiting no Endpoint de Busca de Usuário por E-mail (D-3, Defesa Contra Enumeração)

- **Objetivo:** Validar que o endpoint de busca de usuário por e-mail (D-3) implementa rate limiting para evitar enumeração de e-mails válidos do sistema. Múltiplas tentativas em sequência (ex.: 6+ em 1 minuto) devem ser bloqueadas com 429 Too Many Requests.
- **Caso de uso:** UC-21 (Fluxo B), segurança.
- **Atores envolvidos:** Gestor de Espaço (operador legítimo), atacante (tentativa de enumeração).
- **Partes afetadas:**
  - `tests/Feature/Security/UsuarioBuscaRateLimitTest.php` (NOVO)
  - Backend: `ChamadoPublicoController::buscarUsuarioPorEmail()` ou equivalente (S5-BE-09).
  - Middleware ou rate limiter (ex.: Laravel's `RateLimiter`).
- **Depende de:** S5-BE-09 (endpoint implementado com rate limiting).
- **Riscos relacionados:** D-3 (enumeração — mitigada por rate limiting), R-09 (abuso — rate limiting reduz superfície).
- **Casos de teste obrigatórios:**
  - `test_busca_usuario_primeira_tentativa_200` — Primeira requisição retorna 200 (sucesso ou 404 se não encontrado).
  - `test_busca_usuario_6_tentativas_rapidas_retorna_429` — 6 requisições em sequência rápida (ex.: sem sleep) retorna 429 Too Many Requests na 6ª.
  - `test_busca_usuario_rate_limit_por_usuario` — Rate limiting é **por usuário autenticado** (não global), dois usuários diferentes podem buscar em paralelo.
  - `test_busca_usuario_nunca_retorna_mais_de_1_registro` — Response body tem no máximo 1 resultado (mesmo se múltiplos match no banco — improvável com busca por e-mail exato).
  - `test_busca_usuario_campos_minimos_apenas` — Response inclui apenas `id` e `nome`, **nunca** e-mail, telefone ou dados sensíveis.
  - `test_busca_usuario_rate_limit_reset_apos_intervalo` — Após aguardar intervalo (ex.: 60s), novo ciclo de requisições é permitido.
- **Critérios de aceite:**
  - [ ] Teste file criado `tests/Feature/Security/UsuarioBuscaRateLimitTest.php`.
  - [ ] Rate limiting implementado no backend (middleware ou throttle).
  - [ ] Limite: máximo 5 requisições por minuto **por usuário autenticado** (ou semelhante, conforme decisão de UX).
  - [ ] 6ª requisição dentro do mesmo minuto retorna 429 com `Retry-After` header.
  - [ ] Response campos validados: presente `id`, `nome`; ausente `email`, `phone`, `password_hash`, etc.
  - [ ] Testes incluem `$this->travelTo()` ou sleep para validar reset de limite.
  - [ ] Todos 6 testes passam.
  - [ ] Sem `.skip()`.

---

## Ordem de Execução Sugerida

1. **S5-INT-01** — Autorização básica (sem dependências de serviço complexo).
2. **S5-INT-02** — Fluxo A multi-dia (crítico para evitar abuso).
3. **S5-INT-03** — Expediente (depende de S5-BE-06, mas uma vez pronto, valida toda a integração).
4. **S5-INT-04** — Role Seeder (unitário, rápido).
5. **S5-INT-05** — Fluxo B (ponta a ponta, mais complexo, com notificação).
6. **S5-INT-06** — Defesa em profundidade (validação complementar de #1).
7. **S5-INT-07** — Rate limiting (segurança adicional, pode rodar em paralelo).

---

## Definição de Pronto (DDP) — Integração

Cada task desta trilha está pronta quando:

- [ ] Arquivo de teste criado e nomeclado com propósito explícito (ex.: `FluxoAMultiDiaTest.php` claramente fala "Fluxo A, multi-dia").
- [ ] Todos os casos de teste listados **implementados e passando** em `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test`.
- [ ] Testes usam `DatabaseTransactions`, **nunca** `RefreshDatabase`.
- [ ] Nenhum `.skip()`, `markTestIncomplete()`, ou mock que engole erro.
- [ ] Asserts são específicas e claras (ex.: `$this->assertEquals('deferida', $reserva->situacao)`, não `$this->assertTrue($result)`).
- [ ] Coverage ≥ 85% das camadas tocadas (Policy, Service, Controller, Notification).
- [ ] Ordem de execução testada (ex.: S5-INT-02 precisa de S5-BE-04, S5-BE-07, S5-BE-09 prontos).
- [ ] Documentação de qualquer achado ou desvio registrada em `observacoes/DESVIOS-E-DECISOES.md` no momento do descobrimento.
- [ ] `docker exec uniespacos-workspace-1 vendor/bin/pint` aplicado (PHP lint).

---

## Validação Final (Fim do Sprint 5)

Todos os 7 testes de integração devem passar **simultaneamente**:

```bash
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test \
  tests/Feature/Authorization/GestorEspacoReservaUrgenteAuthorizationTest.php \
  tests/Feature/Urgencia/FluxoAMultiDiaTest.php \
  tests/Feature/Urgencia/ExpedienteIntegrationTest.php \
  tests/Unit/Seeders/RoleSeederTest.php \
  tests/Feature/Urgencia/FluxoBWalkinIntegrationTest.php \
  tests/Feature/Security/GestorEspacoUpdateDefenseTest.php \
  tests/Feature/Security/UsuarioBuscaRateLimitTest.php
```

**Expected output:**
```
Tests: 35+
Passed: 35+ ✓
Failed: 0
Duration: < 30s (com DatabaseTransactions)
```

Se algum teste falhar, a investigação é **prioritária** — nenhum merge sem todos verdes.
