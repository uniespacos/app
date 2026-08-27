# Sprint 1 — Gestor de Unidade — Integração

> **Trilha:** Integração | **Escopo:** Testes que cruzam camadas, testes de autorização, seeds de cenário, validação de contrato backend↔frontend. **Esta trilha é a prova de mitigação do risco R-18 (sequenciamento de permissions).**

---

## S1-INT-01 — Criar seeds de cenário: 2 unidades, 2 gestores escopados, estrutura de módulos/setores/espaços

- **Objetivo:** Implementar factories e seeders que geram um cenário de teste com 2 Unidades distintas (representando 2 campi), cada uma com sua própria estrutura de Módulo → Andar → Setor → Espaço, e 2 usuários `gestor_unidade` distintos atribuídos a apenas 1 unidade cada (não compartilhado).
- **Caso de uso:** UC-15 (Gestor de Unidade)
- **Atores envolvidos:** Test runner, Gestor de Unidade (dois instâncias)
- **Partes afetadas:**
  - `database/factories/` — factory de `unidade_gestores` (pivot)
  - `database/factories/UnidadeFactory.php` — estender ou criar `withGestores()` method
  - `database/seeders/` — novo seeder `TestGestorUnidadeScenarioSeeder` ou similar
  - `tests/` — base class ou fixture reutilizável por S1-INT-02 a S1-INT-06
- **Depende de:** S1-BE-01 (role `gestor_unidade` criada), S1-BE-02 (tabela `unidade_gestores` criada)
- **Riscos relacionados:** R-18 (teste deve validar que o escopo está **realmente** aplicado)
- **Casos de teste obrigatórios:**
  - `test_seeder_cria_2_unidades_distintas` — ambas estão no banco
  - `test_seeder_cria_estrutura_modulo_andar_setor_espaco_para_cada_unidade` — graph de entidades correto
  - `test_seeder_cria_2_usuarios_gestor_unidade_distintos` — dois usuários com role
  - `test_seeder_atribui_gestor_1_apenas_a_unidade_1` — pivot criado corretamente
  - `test_seeder_atribui_gestor_2_apenas_a_unidade_2` — pivot isolado
  - `test_seeder_nao_compartilha_usuarios_entre_unidades` — garantia de isolamento
  - `test_fixture_esta_reutilizavel_por_outros_testes_de_integracao` — acessível em base class
- **Critérios de aceite:**
  - [ ] Seeder cria `Unidade::count() === 2`
  - [ ] `ModuloFactory` (ou similar) cria pelo menos 1 módulo por unidade
  - [ ] Cada módulo tem pelo menos 1 andar, 1 setor, 1 espaço (todos escopados à unidade)
  - [ ] `User::role('gestor_unidade')->count() === 2`
  - [ ] `unidade_gestores` pivot tem exatamente 2 registros (1:1 no teste)
  - [ ] `$testGestorUnidade1->unidades()->count() === 1` (relação correta)
  - [ ] Fixture disponível via `TestGestorUnidadeScenario::setup()` ou similar, reutilizável
  - [ ] `php artisan test` passa em todos os testes dessa task

---

## S1-INT-02 — Teste de autorização cross-campus: Gestor de Unidade A não consegue operar sobre Recurso de Campus B

- **Objetivo:** **Teste crítico de mitigação de R-18.** Validar que um `gestor_unidade` designado para a Unidade A (Campus A) não consegue listar, visualizar, atualizar ou deletar recursos (Módulo, Andar, Setor, Espaço) pertencentes à Unidade B (Campus B), independentemente de ele possuir a permission genérica `secao.gestao-modulos`. Cada combinação deve retornar 403/404.
- **Caso de uso:** UC-15 (P-22 — escopo escopado)
- **Atores envolvidos:** Gestor de Unidade (dois, um por campus)
- **Partes afetadas:**
  - `tests/Feature/Authorization/GestorUnidadeAuthorizationTest.php` (novo) — classe dedicada
  - Policies afetadas (já testadas pelo backend, mas validação de end-to-end aqui):
    - `app/Policies/ModuloPolicy.php`
    - `app/Policies/AndarPolicy.php` (via Módulo)
    - `app/Policies/SetorPolicy.php`
    - `app/Policies/EspacoPolicy.php`
  - Controllers afetados (validar comportamento end-to-end):
    - `app/Http/Controllers/Administrativo/InstitucionalModuloController.php`
    - `app/Http/Controllers/Administrativo/InstitucionalSetorController.php`
    - `app/Http/Controllers/Administrativo/InstitucionalEspacoController.php`
- **Depende de:** S1-INT-01 (fixture com 2 campi), S1-BE-04 a S1-BE-09 (Policies escopadas)
- **Riscos relacionados:** **R-18 (crítico)** — se falharem, o escopo está vazando; R-01 (IDOR genérico)
- **Casos de teste obrigatórios — casos negativos (Gestor A tentando operar em Campus B):**
  1. `test_gestor_unidade_campus_a_nao_lista_modulos_do_campus_b` — GET `/administrativo/modulos` retorna 200 mas lista é vazia ou filtrada
  2. `test_gestor_unidade_campus_a_nao_visualiza_modulo_especifico_do_campus_b` — GET `/administrativo/modulos/{modulo_b}` retorna 404
  3. `test_gestor_unidade_campus_a_nao_atualiza_modulo_do_campus_b` — PATCH `/administrativo/modulos/{modulo_b}` retorna 403
  4. `test_gestor_unidade_campus_a_nao_deleta_modulo_do_campus_b` — DELETE `/administrativo/modulos/{modulo_b}` retorna 403
  5. `test_gestor_unidade_campus_a_nao_lista_setores_do_campus_b` — GET `/administrativo/setores` filtro correto
  6. `test_gestor_unidade_campus_a_nao_visualiza_setor_especifico_do_campus_b` — GET `/administrativo/setores/{setor_b}` retorna 404
  7. `test_gestor_unidade_campus_a_nao_atualiza_setor_do_campus_b` — PATCH `/administrativo/setores/{setor_b}` retorna 403
  8. `test_gestor_unidade_campus_a_nao_deleta_setor_do_campus_b` — DELETE `/administrativo/setores/{setor_b}` retorna 403
  9. `test_gestor_unidade_campus_a_nao_lista_espacos_do_campus_b` — GET `/administrativo/espacos` retorna lista vazia para outro campus
  10. `test_gestor_unidade_campus_a_nao_visualiza_espaco_especifico_do_campus_b` — GET `/administrativo/espacos/{espaco_b}` retorna 404
  11. `test_gestor_unidade_campus_a_nao_atualiza_espaco_do_campus_b` — PATCH `/administrativo/espacos/{espaco_b}` retorna 403
  12. `test_gestor_unidade_campus_a_nao_deleta_espaco_do_campus_b` — DELETE `/administrativo/espacos/{espaco_b}` retorna 403
  13. `test_gestor_unidade_campus_a_nao_visualiza_andar_do_modulo_campus_b` — GET `/administrativo/modulos/{modulo_b}/andares/{andar_b}` retorna 404 ou via índice do módulo
  14. `test_gestor_unidade_campus_a_nao_atualiza_andar_do_modulo_campus_b` — PATCH no andar retorna 403 (via transitividade de ModuloPolicy)

- **Casos de teste obrigatórios — casos positivos (validar que escopo próprio funciona):**
  15. `test_gestor_unidade_campus_a_lista_apenas_modulos_do_campus_a` — GET `/administrativo/modulos` retorna módulos de A, não de B
  16. `test_gestor_unidade_campus_a_visualiza_modulo_proprio` — GET `/administrativo/modulos/{modulo_a}` retorna 200 com dados
  17. `test_gestor_unidade_campus_a_atualiza_modulo_proprio` — PATCH `/administrativo/modulos/{modulo_a}` muda nome, retorna 200
  18. `test_gestor_unidade_campus_a_deleta_modulo_proprio_se_sem_andares` — DELETE `/administrativo/modulos/{modulo_a_vazio}` retorna 200 ou apropriado
  19. `test_gestor_unidade_campus_a_lista_apenas_setores_do_campus_a` — GET `/administrativo/setores` filtrado
  20. `test_gestor_unidade_campus_a_visualiza_setor_proprio` — GET `/administrativo/setores/{setor_a}` retorna 200
  21. `test_gestor_unidade_campus_a_atualiza_setor_proprio` — PATCH `/administrativo/setores/{setor_a}` funciona
  22. `test_gestor_unidade_campus_a_lista_apenas_espacos_do_campus_a` — GET `/administrativo/espacos` filtrado
  23. `test_gestor_unidade_campus_a_visualiza_espaco_proprio` — GET `/administrativo/espacos/{espaco_a}` retorna 200
  24. `test_gestor_unidade_campus_a_atualiza_espaco_proprio` — PATCH `/administrativo/espacos/{espaco_a}` funciona

- **Critérios de aceite:**
  - [ ] Testes negativos: **todos** os 14 testes de operação cross-campus retornam 403 ou 404 (nunca 200)
  - [ ] Testes positivos: todos os 10 testes de operação no escopo próprio retornam 200 com mutação correta
  - [ ] Contagem exata é validada — não apenas "retorna 200", mas "lista tem tamanho 1" vs "lista vazia"
  - [ ] Nenhum teste usa `.skip()` ou `markTestIncomplete()` — todos executam
  - [ ] Arquivo `/tests/Feature/Authorization/GestorUnidadeAuthorizationTest.php` tem **exatamente 24 métodos de teste** (14 negativos + 10 positivos)
  - [ ] Todos os testes passam com `php artisan test`
  - [ ] Teste não usa mock — autentica como usuário real, faz request real

---

## S1-INT-03 — Teste de listagem escopada: índice de Módulo/Setor/Espaço retorna APENAS recursos da unidade do gestor

- **Objetivo:** Validar que quando um `gestor_unidade` faz GET `/administrativo/modulos` (ou `/setores`, `/espacos`), o resultado contém **exclusivamente** os recursos da(s) sua(s) unidade(s), nunca de outro campus. Não é suficiente "não quebra" — precisa validar a **contagem exata**.
- **Caso de uso:** UC-15 (P-22 — escopo)
- **Atores envolvidos:** Gestor de Unidade
- **Partes afetadas:**
  - `tests/Feature/GestorUnidadeListagemTest.php` (novo)
  - Controllers de listagem:
    - `InstitucionalModuloController::index()`
    - `InstitucionalSetorController::index()`
    - `InstitucionalEspacoController::index()`
  - Repositories afetadas (aplicarEscopo):
    - `ModuloRepositoryEloquent::getAll()`
    - `SetorRepositoryEloquent::getAll()`
    - `EspacoRepositoryEloquent::getAll()`
- **Depende de:** S1-INT-01 (fixture), S1-BE-05, S1-BE-06, S1-BE-09 (scoping implementado)
- **Riscos relacionados:** R-01 (IDOR), R-18
- **Casos de teste obrigatórios:**
  - `test_gestor_unidade_index_modulos_retorna_apenas_modulos_sua_unidade_contagem_exata` — conta módulos; fixture tem 1 em A, 1 em B; Gestor A vê 1
  - `test_gestor_unidade_index_modulos_vazio_se_unidade_nao_tem_modulos` — Gestor de Unidade vazia retorna 200 com array vazio
  - `test_gestor_unidade_index_setores_retorna_apenas_setores_sua_unidade` — mesmo pattern, setores
  - `test_gestor_unidade_index_setores_contagem_exata_com_modulo_compartilhado_falso` — confirma que setor de B não aparece
  - `test_gestor_unidade_index_espacos_retorna_apenas_espacos_sua_unidade` — mesmo pattern, espaços
  - `test_gestor_unidade_index_espacos_respeitam_precedencia_gestor_espaco_sobre_gestor_modulo` — se há override de Espaço, ainda responde a escopo de Unidade (S1-INT-02 ✓ antes)
  - `test_institucional_index_modulos_retorna_todos_modulos_de_todas_unidades` — Institucional não está filtrado
- **Critérios de aceite:**
  - [ ] Cada teste valida `count()` exato, não apenas presença
  - [ ] Fixture setup garante 2+ recursos em A, 2+ em B (antes de começar o teste)
  - [ ] Resposta JSON contém campo que identifica `unidade_id` (ou pode ser validado via ID mínimo/máximo de recurso)
  - [ ] Query builder não usa `first()` quando deveria usar `get()` — listagem é completa
  - [ ] Testes passam com `php artisan test`

---

## S1-INT-04 — Teste de bootstrap: Institucional cria Unidade e estrutura sem nenhum Gestor de Unidade designado

- **Objetivo:** Validar que o bootstrap (criação inicial de uma Unidade nova) é possível **sem** que um Gestor de Unidade já exista. O Institucional cria Unidade → Módulo → Setor → Espaço em sequence, confirmando que P-22 ("Institucional mantém capacidade") permite ao Institucional continuar operando mesmo após os novos roles nasceram.
- **Caso de uso:** UC-15-B (bootstrap), P-22 (Institucional mantém capacidade)
- **Atores envolvidos:** Institucional
- **Partes afetadas:**
  - `tests/Feature/GestorUnidadeBootstrapTest.php` (novo)
  - Controllers de criação:
    - `InstitucionalUnidadeController::store()`
    - `InstitucionalModuloController::store()`
    - `InstitucionalSetorController::store()`
    - `InstitucionalEspacoController::store()`
- **Depende de:** S1-BE-02, S1-BE-04, S1-BE-05, S1-BE-06, S1-BE-09 (Policies implementadas)
- **Riscos relacionados:** R-18 (bootstrap precisa ser independente de atribuição de gestor)
- **Casos de teste obrigatórios:**
  - `test_institucional_cria_unidade_nova_sem_gestores_atribuidos` — POST `/administrativo/unidades`, status 201, `unidade.id` retornado
  - `test_institucional_cria_modulo_em_unidade_nova_sem_gestor` — POST `/administrativo/unidades/{new_unidade}/modulos`, status 201
  - `test_institucional_cria_andar_dentro_modulo_novo` — andar vem via `dados[andares]` no módulo, status 201
  - `test_institucional_cria_setor_em_unidade_nova` — POST `/administrativo/setores`, status 201
  - `test_institucional_cria_espaco_em_modulo_novo` — POST `/administrativo/espacos`, status 201
  - `test_institucional_atualiza_unidade_criada_sem_gestor` — PATCH `/administrativo/unidades/{new_unidade}`, mudança é aplicada
  - `test_integridade_referencial_apos_bootstrap_sem_gestor` — FK's apontam para registro correto
- **Critérios de aceite:**
  - [ ] Cada teste cria entidades "do zero", sem fixture de Unidade pré-existente
  - [ ] Status HTTP correto (201 para POST, 200 para PATCH)
  - [ ] `unidade_gestores` está vazio para a Unidade nova (nenhum Gestor designado)
  - [ ] Sem erro "gestor obrigatório" ou similar
  - [ ] Testes passam com `php artisan test`

---

## S1-INT-05 — Teste de fronteira: Gestor de Unidade NUNCA consegue criar ou excluir a própria Unidade

- **Objetivo:** Garantir que a autorização em `UnidadePolicy` bloqueia criação (`create()`) e exclusão (`delete()`) de Unidade, mesmo para um `gestor_unidade` dentro do seu escopo. O Gestor de Unidade edita, mas não funda nem destrói o campus.
- **Caso de uso:** UC-15 (P-22, P-33 — Institucional mantém bootstrap + create/delete)
- **Atores envolvidos:** Gestor de Unidade
- **Partes afetadas:**
  - `tests/Feature/GestorUnidadeUnidadePolicyTest.php` (novo)
  - `app/Policies/UnidadePolicy.php` — métodos `create()` e `delete()`
  - `InstitucionalUnidadeController::store()` e `destroy()`
- **Depende de:** S1-BE-02, S1-BE-04 (Policy com checks corretos)
- **Riscos relacionados:** P-22 (confirmação de que é "capacidade mantida", não "ato livre")
- **Casos de teste obrigatórios:**
  - `test_gestor_unidade_nao_consegue_criar_unidade_nova` — POST `/administrativo/unidades` com Gestor A retorna 403
  - `test_gestor_unidade_nao_consegue_deletar_sua_propia_unidade` — DELETE `/administrativo/unidades/{unidade_sua}` retorna 403
  - `test_gestor_unidade_nao_consegue_deletar_unidade_alheia` — DELETE `/administrativo/unidades/{unidade_alheia}` retorna 403
  - `test_institucional_consegue_criar_unidade` — POST `/administrativo/unidades` com Institucional retorna 201 (controle positivo)
  - `test_institucional_consegue_deletar_unidade` — DELETE `/administrativo/unidades/{unidade}` com Institucional retorna 200 (controle positivo)
- **Critérios de aceite:**
  - [ ] Testes negativos (Gestor) retornam 403 em **ambos** create e delete
  - [ ] Testes positivos (Institucional) retornam status de sucesso
  - [ ] Nenhum teste usa `.skip()`
  - [ ] Testes passam com `php artisan test`

---

## S1-INT-06 — Teste de endpoint estreito `PATCH /unidades/{unidade}/label-gestor`: Gestor de Unidade só altera `label_gestor`, rejeita tentativa de alterar nome/sigla

- **Objetivo:** Validar que o endpoint dedicado `PATCH /unidades/{unidade}/label-gestor` (S1-BE-11) permite ao `gestor_unidade` alterar apenas o rótulo do cargo (`label_gestor`), e que qualquer tentativa de alterar `nome`, `sigla` ou outro campo é rejeitada, mesmo que o payload direto tente passar esses campos (D-8 — delimitação de escopo).
- **Caso de uso:** UC-15 (P-33, P-13 — rótulo customizável; D-8 — restrição de campos)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `tests/Feature/GestorUnidadeLabelGestorTest.php` (novo)
  - `app/Http/Requests/AlterarLabelGestorUnidadeRequest.php` (novo) — validação estreita
  - `app/Http/Controllers/GestorUnidadeController::alterarLabelGestor()` ou similar (S1-BE-11)
  - `app/Policies/UnidadePolicy::alterarLabelGestor()` (novo)
- **Depende de:** S1-BE-07 (migration de `label_gestor`), S1-BE-11 (endpoint implementado)
- **Riscos relacionados:** D-8 (escopo restritivo), R-21 (escalonamento)
- **Casos de teste obrigatórios:**
  - `test_gestor_unidade_consegue_alterar_label_gestor_via_endpoint_estreito` — PATCH `/unidades/{sua_unidade}/label-gestor`, body `{"label_gestor": "Novo Rótulo"}`, retorna 200
  - `test_gestor_unidade_vê_label_alterado_em_proxima_requisicao` — GET `/administrativo/unidades/{unidade}` reflete a mudança
  - `test_gestor_unidade_nao_consegue_alterar_nome_via_endpoint_estreito` — PATCH com `{"nome": "Novo Nome"}` retorna 422 ou 403
  - `test_gestor_unidade_nao_consegue_alterar_sigla_via_endpoint_estreito` — PATCH com `{"sigla": "NN"}` retorna 422 ou 403
  - `test_gestor_unidade_nao_consegue_alterar_nome_sigla_mesmo_payload_dual` — PATCH com `{"label_gestor": "...", "nome": "..."}` rejeita ou ignora nome
  - `test_gestor_unidade_de_outra_unidade_nao_consegue_alterar_label_alheia` — Gestor A tenta PATCH em Unidade B, retorna 403
  - `test_institucional_consegue_alterar_label_gestor` — Institucional consegue via endpoint (ou via PUT geral, conforme desenho)
  - `test_endpoint_retorna_validacao_label_comprimento_maximo` — label > 100 caracteres retorna 422
- **Critérios de aceite:**
  - [ ] Request class valida `label_gestor` mas **rejeita** presença de `nome`, `sigla` ou outros campos (ou ignora)
  - [ ] Policy verifica `$user->id` está em `unidade_gestores` da Unidade
  - [ ] Resposta bem-sucedida (200) retorna objeto Unidade com `label_gestor` atualizado
  - [ ] Erro de validação (422) lista campo rejeitado
  - [ ] Teste negativo (403) ocorre para Gestor de outra Unidade
  - [ ] Testes passam com `php artisan test`

---

## Definição de Pronto para Trilha Integração

Todas as 6 tasks de integração devem estar 100% completas e **provando a mitigação de R-18**:

- [ ] S1-INT-01: Seeder cria fixture com 2 unidades, 2 gestores escopados, estrutura completa
- [ ] S1-INT-02: **24 testes nomeados** (14 negativos cross-campus, 10 positivos próprio escopo) **todos passando** — CRÍTICO
- [ ] S1-INT-03: Testes de listagem confirmam contagem exata (não apenas "funciona")
- [ ] S1-INT-04: Bootstrap sem Gestor designado funciona — Institucional continua operando
- [ ] S1-INT-05: Gestor de Unidade **nunca** consegue create/delete Unidade
- [ ] S1-INT-06: Endpoint estreito `label_gestor` valida escopo de campos e acesso por usuário
- [ ] `php artisan test` — 100% verde (nenhum `.skip()` ou `markTestIncomplete()`)
- [ ] Não há mocks que escondem erro — testes autênticos
- [ ] Nenhuma regra de `docs/v2.0/00-visao-geral/04-regras-invioaveis.md` violada
- [ ] `RefreshDatabase` foi **evitado** — usa `DatabaseTransactions` (padrão em `tests/TestCase.php`)

> **Bloco Atômico (Risco R-18):** Esta trilha **valida que o escopo está de fato aplicado**. Sem S1-INT-02 passando com 24 testes, não há prova de que a permission foi respeitada. Merge junto com backend (S1-BE-01 a S1-BE-13) e frontend (S1-FE-01 a S1-FE-08).

---

## Registros de Execução

(Preenchido durante a implementação — ver `docs/v2.0/observacoes/`.)

- [ ] Data de início: _________________
- [ ] Data de conclusão: _________________
- [ ] Problemas encontrados: (link para `PROBLEMAS-IDENTIFICADOS.md`)
- [ ] Desvios do backlog: (link para `DESVIOS-E-DECISOES.md`)
