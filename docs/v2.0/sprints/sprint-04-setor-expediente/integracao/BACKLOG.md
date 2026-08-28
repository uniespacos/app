# Integração Backlog — Sprint 4: Setor Expandido

---

### [S4-INT-01] Teste: Algoritmo de 3 Estados de `estaEmExpediente()`

- **Objetivo:** Validar que `ExpedienteService::estaEmExpediente()` retorna os 3 estados esperados (`true`/`false`/`null`) em cenários representativos.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Sistema (testes)
- **Partes afetadas:**
  - `tests/Feature/Services/ExpedienteServiceTest.php` (NOVO)
- **Depende de:** S4-BE-04 (serviço)
- **Riscos relacionados:** R-20 (expediente vazio)
- **Casos de teste obrigatórios:**
  - **Estado `true` — Dentro do expediente:** Setor com `horario_abertura = 08:00`, `horario_fechamento = 17:00`, `dias_funcionamento = [1,2,3,4,5]`. Testando às 10:00 de uma terça-feira (dia ISO 2) → retorna `true`
  - **Estado `false` — Fora do horário:** Mesmo setor, testando às 18:00 (depois do fechamento) → retorna `false`
  - **Estado `false` — Dia não operacional:** Mesmo setor, testando às 10:00 de um sábado (dia ISO 6, não em `dias_funcionamento`) → retorna `false`
  - **Estado `null` — Sem configuração base:** Setor com `horario_abertura = NULL` → retorna `null` (indeterminado), independentemente do horário/dia
  - **Exceção com `fechado = true` sobrepõe regra:** Setor com expediente normal seg-sex 08:00-17:00. Exceção: `data_inicio = data_fim = 2026-08-28` (quinta), `fechado = true`. Testando às 10:00 de 2026-08-28 → retorna `false` (exceção vence)
  - **Exceção com `fechado = false` e horários especiais:** Mesmo cenário. Exceção: `fechado = false`, `horario_abertura = 10:00`, `horario_fechamento = 12:00` (expediente reduzido). Testando às 11:00 de 2026-08-28 → retorna `true` (entre 10:00 e 12:00). Testando às 09:00 → retorna `false` (antes do horário especial)
- **Critérios de aceite:**
  - [ ] Teste unitário de `ExpedienteService` (sem DB, com Setor mockado) ou teste feature com cenários reais
  - [ ] Cada um dos 5 cenários é um `test_*` método separado, nomeado descritivamente
  - [ ] Uso de Carbon/Now para criar timestamps testáveis (ex.: `Carbon::parse('2026-08-28 10:00')`)
  - [ ] Assertions claras: `$this->assertTrue()`, `$this->assertFalse()`, `$this->assertNull()`
  - [ ] Sem dependência de `now()` — passar `$quando` explicitamente

---

### [S4-INT-02] Teste: Exceção por Intervalo Sem Duplicação de Linhas

- **Objetivo:** Validar que uma exceção com intervalo (ex.: recesso de 15 dias) é representada por 1 única linha e cobre corretamente todas as datas do intervalo, sem necessidade de 15 linhas separadas.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Sistema (testes)
- **Partes afetadas:**
  - `tests/Feature/Services/ExpedienteServiceTest.php` (expandir de S4-INT-01)
- **Depende de:** S4-BE-04, S4-INT-01
- **Riscos relacionados:** Nenhum específico
- **Casos de teste obrigatórios:**
  - Criar exceção com `data_inicio = 2026-12-15`, `data_fim = 2026-12-29` (15 dias), `fechado = true`, `motivo = "Recesso de fim de ano"`
  - Verificar que exatamente **1 linha** existe em `setor_excecoes_expediente`
  - Chamar `estaEmExpediente()` para cada data de 2026-12-15 a 2026-12-29 (15 testes) — todas devem retornar `false`
  - Chamar `estaEmExpediente()` para 2026-12-14 (dia anterior) → retorna o valor da regra semanal (não afetado pela exceção)
  - Chamar `estaEmExpediente()` para 2026-12-30 (dia posterior) → retorna o valor da regra semanal
- **Critérios de aceite:**
  - [ ] Teste cria 1 exceção com intervalo de 15 dias
  - [ ] Banco contém exatamente 1 linha em `setor_excecoes_expediente` para aquele setor
  - [ ] Loop de 15 iterações verifica `estaEmExpediente()` para cada data — todas retornam `false`
  - [ ] Teste não é O(15) na quantidade de linhas do banco; é O(1) linha + O(15) query por data (eficiente em modelagem)
  - [ ] Documentação no teste deixa claro que "recesso de 15 dias = 1 linha, não 15"

---

### [S4-INT-03] Teste: Delimitação de Campo — Coordenador Tenta Alterar Campos Proibidos

- **Objetivo:** Validar que o coordenador designado **nunca** consegue alterar `unidade_id`, `nome`, `sigla` ou `coordenador_id`, mesmo se enviados no payload da requisição.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Coordenador do Setor
- **Partes afetadas:**
  - `tests/Feature/Http/Controllers/SetorControllerTest.php` ou novo teste de integração
- **Depende de:** S4-BE-06, S4-BE-09 (validação)
- **Riscos relacionados:** R-21 (escalonamento via edição de setor)
- **Casos de teste obrigatórios:**
  - Setup: Criar setor do Campus A com coordenador = user A
  - Requisição como user A para `PATCH /setores/{setor}/expediente` com payload: `{ horario_abertura: "09:00", unidade_id: {campus_b_unidade_id} }`
  - Resposta: requisição é aceita ou rejeitada?
    - **Caso A (ignorar silenciosamente):** requisição sucede (200), mas `setor.unidade_id` continua apontando para Campus A
    - **Caso B (rejeitar):** requisição falha com erro 422, campo `unidade_id` inválido
  - **Teste documentar qual das duas estratégias é a implementada** (a task S4-BE-06 e S4-BE-09 devem decidir)
  - Repetir para `nome`, `sigla`, `coordenador_id`
  - Verificação final: setor não foi movido, nome/sigla não mudaram, coordenador continua o mesmo
  - Verificação: `horario_abertura` **foi** atualizado normalmente (coordenador conseguiu editar campo válido)
- **Critérios de aceite:**
  - [ ] Teste autenticado como coordenador designado
  - [ ] Requisição `PATCH /setores/{setor}/expediente` com múltiplos campos, alguns válidos e alguns proibidos
  - [ ] Comportamento é consistente (todos os campos proibidos são tratados da mesma forma)
  - [ ] Banco é consultado antes e depois para verificar que campos proibidos **não** foram alterados
  - [ ] Campos válidos **foram** alterados normalmente
  - [ ] Teste documenta a estratégia em um comentário

---

### [S4-INT-04] Teste: Escopo Geográfico — Gestor de Unidade Não Consegue Alterar Setor de Outro Campus

- **Objetivo:** Validar que um Gestor de Unidade do Campus A não consegue designar coordenador nem alterar expediente de um Setor do Campus B (risco R-01/IDOR).
- **Caso de uso:** UC-18
- **Atores envolvidos:** Gestor de Unidade (de dois campi diferentes)
- **Partes afetadas:**
  - `tests/Feature/Http/Controllers/SetorControllerTest.php` ou teste de autorização
  - `tests/Feature/Policies/SetorPolicyTest.php` (teste de policy)
- **Depende de:** S4-BE-05 (policy escopada), S4-BE-06 (endpoint)
- **Riscos relacionados:** R-01 (IDOR), R-07 (escala de escopo)
- **Casos de teste obrigatórios:**
  - Setup: 
    - Instituição com 2 Unidades: Campus A e Campus B
    - User gestorA designado como `gestor_unidade` de Campus A
    - User gestorB designado como `gestor_unidade` de Campus B
    - Setor do Campus B existente
  - Teste 1: gestorA tenta fazer `PATCH /setores/{setor_do_campus_b}/expediente` → retorna 403 Forbidden
  - Teste 2: gestorA tenta fazer `PUT /setores/{setor_do_campus_b}` para alterar `coordenador_id` → retorna 403
  - Teste 3: gestorB consegue fazer a mesma requisição com sucesso (controle positivo)
  - Teste 4: Institucional consegue fazer ambas as requisições (super-role)
- **Critérios de aceite:**
  - [ ] Teste setup com dados de 2 campi completos
  - [ ] 3 usuários: gestorA, gestorB, institucional
  - [ ] Requisições autenticadas como cada um deles
  - [ ] Policy `atualizarExpediente()` verifica escopo por `getUnidadesGeridasPor()` (reutiliza Sprint 1)
  - [ ] Assertions: gestorA recebe 403, gestorB recebe 200, institucional recebe 200
  - [ ] Teste documenta que **não há IDOR** — a política bloqueia cross-campus

---

### [S4-INT-05] Teste: Trilha de Auditoria — Alterações Registram Autor e Valores Anteriores

- **Objetivo:** Validar que toda alteração de expediente gera um registro de auditoria com autor correto e valores anteriores/novos corretos, permitindo rastreamento histórico.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Gestor de Unidade, Coordenador do Setor, Sistema (logs)
- **Partes afetadas:**
  - `tests/Feature/Services/SetorServiceTest.php` ou teste de auditoria dedicado
  - Modelo de auditoria (conforme arquitetura do projeto)
- **Depende de:** S4-BE-08 (auditoria implementada)
- **Riscos relacionados:** R-22 (controle indireto do portão da urgência)
- **Casos de teste obrigatórios:**
  - Setup: Setor com expediente inicial `horario_abertura = 08:00`
  - Alterar para `horario_abertura = 09:00` como user A
  - Verificar que registro de auditoria foi criado:
    - `setor_id` correto
    - `user_id = user_a.id`
    - `valores_anteriores.horario_abertura = "08:00"`
    - `valores_novos.horario_abertura = "09:00"`
    - `timestamp` está razoável (entre antes e depois da alteração)
  - Alterar novamente para `horario_abertura = 08:30` como user B
  - Verificar que **novo** registro foi criado com user_id = user_b.id
  - Verificar que histórico completo de 2 alterações está presente (não foi sobrescrito, foi adicionado)
  - Teste com mudança de `dias_funcionamento`: array anterior vs. novo é registrado corretamente
- **Critérios de aceite:**
  - [ ] Teste executa `PATCH /setores/{setor}/expediente` e verifica criação de log
  - [ ] Log table/model tem campos: `setor_id`, `user_id`, `valores_anteriores`, `valores_novos`, `timestamp`, e opcionalmente `acao` (update/create)
  - [ ] Múltiplas alterações sucessivas geram múltiplas linhas de log (não sobrescrita)
  - [ ] Valores anteriores refletem o estado **real** antes da alteração, não um valor assumed
  - [ ] Se auditoria usa solução genérica do projeto (ex.: `ActivityLog`), teste confirma que é adequada; senão, tabela/modelo dedicado
  - [ ] Teste SoftDelete: se setor for soft-deletado, logs anteriores permanecem acessíveis (não são apagados em cascata)

---

## Resumo de Dependências Entre Tasks

```
S4-BE-04 (ExpedienteService)
└── S4-INT-01 (3 Estados)
    ├── S4-INT-02 (Intervalo)
    └── S4-INT-03 (Delimitação)

S4-BE-05 + S4-BE-06
└── S4-INT-04 (Escopo Geográfico)

S4-BE-08
└── S4-INT-05 (Auditoria)
```

**Ordem recomendada de execução:** S4-INT-01 → S4-INT-02 → S4-INT-03 → S4-INT-04 → S4-INT-05

(S4-INT-03, S4-INT-04 e S4-INT-05 podem rodar em paralelo uma vez que S4-BE-04, S4-BE-05/06, e S4-BE-08 estejam prontos respectivamente.)

---

## Notas sobre Estratégia de Teste

- **Fixtures:** Reusar dados de teste de Sprint 1 (Unidades, Gestores de Unidade) onde aplicável
- **Mocks:** Sem mock de `ExpedienteService` em testes de integração — usar dados reais de DB (com `DatabaseTransactions` para limpeza)
- **Assertions:** Sempre verificar estado do DB, não só da resposta HTTP
- **Coverage:** Esperar cobertura ≥ 80% nas classes testadas (`ExpedienteService`, `SetorPolicy`, `SetorController::updateExpediente()`)
