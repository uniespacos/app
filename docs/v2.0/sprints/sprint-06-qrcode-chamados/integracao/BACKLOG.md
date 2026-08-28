# Sprint 6 — Integração Backlog

## [S6-INT-01] Teste: Chamado é roteado corretamente aos Gestores de Espaço via `getGestoresDeEspaco()`

- **Objetivo:** Validar que um chamado criado num espaço é roteado (notificação + triagem policy) para EXATAMENTE os usuários retornados por `EspacoRepositoryInterface::getGestoresDeEspaco()`, cobrindo casos de override, padrão de módulo, e múltiplos gestores.
- **Caso de uso:** UC-19-C (triagem correta)
- **Atores envolvidos:** Gestor de Espaço, Sistema
- **Partes afetadas:** `tests/Feature/Chamados/ChamadoRoutingTest.php` (NOVO), fixtures de espaço/módulo/gestor
- **Depende de:** S6-BE-02 (Policy implementada), S6-BE-03 (Service implementado), S6-BE-04 (órfãos identificados)
- **Riscos relacionados:** R-S6-01 (roteamento divergente), R-02 (precedência incorreta)
- **Casos de teste obrigatórios:**
  1. Testa espaço com override direto — notificação vai APENAS aos override, não ao padrão do módulo
  2. Testa espaço com padrão de módulo (sem override) — notificação vai ao padrão
  3. Testa espaço com múltiplos gestores no padrão — todos são notificados
  4. Testa que permissão `chamados.triar` é checkada via Policy (apenas os gestores conseguem triagar)
  5. Testa que usuário sem vínculo recebe 403 ao tentar triagar (IDOR)
- **Critérios de aceite:**
  - [ ] Suite de testes cobre os 3 cenários de precedência (override, padrão, órfão)
  - [ ] Notificação é capturada/mockada corretamente (não envia e-mail real)
  - [ ] Policy Authorization é testada com 2 gestores em módulos distintos (IDOR)
  - [ ] Sem uso de `RefreshDatabase` — `DatabaseTransactions` apenas
  - [ ] Cobertura de código ≥ 90% para `ChamadoService::notificarGestores()`

---

## [S6-INT-02] Teste: Chamado órfão aparece corretamente em painéis do Gestor de Unidade e Institucional

- **Objetivo:** Validar que um chamado criado num espaço sem gestores (órfão) aparece **corretamente diferenciado** em dois contextos: (1) lista detalhada no Gestor de Unidade do seu campus, (2) agregado (contador) no painel do Institucional.
- **Caso de uso:** UC-20 (visão de órfãos)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:** `tests/Feature/Chamados/ChamadoOrfaoTest.php` (NOVO), fixtures de unidade/módulo/espaço, repos
- **Depende de:** S6-BE-04 (query de órfãos), S6-BE-08 (endpoints de painel), S6-FE-05 (página frontend)
- **Riscos relacionados:** R-S6-04 (órfão não alcança ninguém silenciosamente), R-01 (cross-campus IDOR)
- **Casos de teste obrigatórios:**
  1. Testa que chamado de espaço SEM gestores é identificado como órfão
  2. Testa que Gestor de Unidade A vê APENAS órfãos do Campus A
  3. Testa que Gestor de Unidade A NÃO consegue triagar chamados do Campus B
  4. Testa que Institucional vê agregado (endpoint retorna contadores, não lista)
  5. Testa que após atribuir gestor, chamado deixa de ser órfão
- **Critérios de aceite:**
  - [ ] Query `queryOrfaos()` e escopo `whereUnidade($id)` são testados isoladamente
  - [ ] Testes cruzam campi (IDOR — 2 unidades, 2 gestores)
  - [ ] Mudança de estado (gestor atribuído → chamado deixa órfão) é testada
  - [ ] Sem hardcoding de IDs — usar factories/seeders
  - [ ] Cobertura ≥ 85% para `ChamadoRepositoryEloquent`

---

## [S6-INT-03] Teste: Fluxo de tutorial — "Resolveu?" não cria chamado; "Não resolveu" cria

- **Objetivo:** Validar que o fluxo de tutorial funciona end-to-end: se usuário marcar "Resolveu?", nenhum chamado é criado; se marcar "Não resolveu", um chamado formal é aberto e roteado corretamente.
- **Caso de uso:** UC-19-B (tutorial assistido)
- **Atores envolvidos:** Comum (usuário reportador)
- **Partes afetadas:** `tests/Feature/Chamados/ChamadoTutorialFlowTest.php` (NOVO), fixtures de tipo/tutorial
- **Depende de:** S6-FE-01 (componente tutorial), S6-FE-02 (página pública), S6-BE-06 (endpoint)
- **Riscos relacionados:** Nenhum crítico — é fluxo feliz
- **Casos de teste obrigatórios:**
  1. Testa que GET `/reportar/{espaco:public_id}` retorna lista de tipos com `tutorial`
  2. Testa que clique em "Resolveu?" não dispara POST (client-side only ou verbo GET inócuo)
  3. Testa que clique em "Não resolveu" dispara criação de chamado
  4. Testa que chamado criado herda `tipo_chamado_id` correto
  5. Testa que notificação é disparada aos gestores (já testado em S6-INT-01, reforça)
- **Critérios de aceite:**
  - [ ] Teste de browser (Cypress/Playwright) OU teste de API + mock de frontend
  - [ ] Casos de teste sem tutorial também funcionam (tipo sem `tutorial`—NULL)
  - [ ] Contagem de chamados no banco confirma: "resolveu" = 0, "não resolveu" = 1
  - [ ] DatabaseTransactions, sem limpar banco
  - [ ] Cobertura de endpoint público ≥ 80%

---

## [S6-INT-04] Teste: Sanitização de Markdown no tutorial — payload malicioso é bloqueado

- **Objetivo:** Validar que conteúdo Markdown do tutorial, mesmo se contiver tentativas de XSS (tags `<script>`, handlers inline, etc.), é renderizado com segurança total — nenhuma execução de código malicioso.
- **Caso de uso:** Segurança — UC-19-B (tutorial seguro)
- **Atores envolvidos:** Institucional (cria tutorial), Comum (vê tutorial)
- **Partes afetadas:** `tests/Feature/Chamados/TutorialSanitizationTest.php` (NOVO), accessor/cast de `TipoChamado.tutorial`
- **Depende de:** S6-BE-05 (campo com sanitização backend), S6-FE-01 (renderização frontend)
- **Riscos relacionados:** R-S6-03 (XSS via Markdown não sanitizado)
- **Casos de teste obrigatórios:**
  1. Testa que `<script>alert('xss')</script>` armazenado é renderizado como texto/escaped
  2. Testa que `onclick="alert('xss')"` é removido (não rende como atributo)
  3. Testa que `<iframe>` é blocked
  4. Testa que Markdown legítimo (bold, links, listas) continua funcionando
  5. Testa que caracteres Unicode/especiais são preservados (não quebrando nem escapando indevidamente)
- **Critérios de aceite:**
  - [ ] Teste de sanitização usa biblioteca consolidada (`parsedown-extra` ou equivalente)
  - [ ] Entrada maliciosa é testada com payloads reais da OWASP
  - [ ] Rendering output é validado (sem tags perigosas)
  - [ ] Teste é agnóstico de framework — valida saída HTML/texto
  - [ ] Documentação de biblioteca de sanitização está atualizada (se criada nova função)

---

## [S6-INT-05] Teste: Rota pública `/reportar/{espaco:public_id}` funciona sem autenticação

- **Objetivo:** Validar que a rota pública de reporte de problema é de fato acessível sem login, sem cookies de sessão, e sem credenciais.
- **Caso de uso:** UC-19-A (reporte público)
- **Atores envolvidos:** Comum (deslogado)
- **Partes afetadas:** `tests/Feature/Chamados/PublicReportingTest.php` (NOVO), rota config
- **Depende de:** S6-BE-06 (endpoint criado), S6-FE-02 (página pública)
- **Riscos relacionados:** R-S6-02 (rota pública é superfície de abuso — apenas validar que funciona sem auth, rate limiting é infraestrutura)
- **Casos de teste obrigatórios:**
  1. Testa que GET `/reportar/{public_id}` retorna 200 SEM token CSRF (ou que CSRF é skip para rota pública)
  2. Testa que POST para criar chamado público é aceito SEM autenticação
  3. Testa que `public_id` inválido retorna 404
  4. Testa que `public_id` de espaço deletado retorna erro apropriado
  5. Testa que dados do espaço (nome, módulo) são expostos (necessário para UX)
- **Critérios de aceite:**
  - [ ] Testes usam `withoutMiddleware(['auth'])` OU confirmam que rota não tem middleware
  - [ ] Sem cookies de sessão esperados (`XSRF-TOKEN`, etc.) — rota ignora ou skip
  - [ ] Validação de `public_id` é rigorosa (não expõe IDs internos em erro)
  - [ ] POST retorna status esperado (201 Created ou 422 Unprocessable Entity com mensagens de erro)
  - [ ] Cobertura de rota pública ≥ 85%

---

## Notas Gerais — Integração Sprint 6

- **Acesso a Banco:** Todas as suítes usam `DatabaseTransactions` (laravel padrão em `TestCase.php`), **nunca** `RefreshDatabase`.
- **Fixtures:** Usar `UserFactory`, `EspacoFactory`, etc., com estado completo (vínculo aos pivots já pronto).
- **Notificações:** Mock via `Notification::fake()` para não disparar e-mails reais.
- **Rate Limiting:** Não é testado neste sprint (infraestrutura). Apenas valida que endpoint público existe e funciona.
- **Cross-Campus IDOR:** Sempre testar com 2 unidades, 2 gestores distintos, confirmando que A não acessa B.
- **Ordem:** Execute backend completo (S6-BE-01..09) → Frontend (S6-FE-01..05) → Integração (S6-INT-01..05).
