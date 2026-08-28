# Backend Backlog — Sprint 4: Setor Expandido

---

### [S4-BE-01] Migration: adicionar coordenador e expediente a `setors`

- **Objetivo:** Estender a tabela `setors` com colunas para horário de funcionamento e referência ao usuário responsável pelo setor.
- **Caso de uso:** UC-18, UC-21-A (preparação)
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:** 
  - `database/migrations/YYYY_MM_DD_add_coordenador_e_expediente_to_setors_table.php`
  - `app/Models/Setor.php` (casts, acessors)
- **Depende de:** Nenhuma
- **Riscos relacionados:** R-19 (transversalidade), R-20 (expediente vazio)
- **Casos de teste obrigatórios:**
  - Migration aplica-se sem erros e reverter remove as colunas
  - Coluna `coordenador_id` admite `NULL` sem causar constraint violation
  - Valor default de `horario_abertura` é `NULL` (não configurado)
  - Valor default de `dias_funcionamento` é `NULL` (não configurado)
  - Coluna `dias_funcionamento` é do tipo JSON/array e aceita `[1,2,3,4,5]` (ISO-8601)
- **Critérios de aceite:**
  - [ ] Schema exato conforme documento 03, §9.2: `coordenador_id` (FK `users.id`, `ON DELETE SET NULL`), `horario_abertura` (TIME NULL), `horario_fechamento` (TIME NULL), `dias_funcionamento` (JSON NULL)
  - [ ] `ON DELETE SET NULL` confirmado em constraint — se o usuário for removido, o setor perde o coordenador mas continua existindo
  - [ ] Cast Eloquent de `dias_funcionamento` é `'array'` (precedente: `Andar.tipo_acesso`)
  - [ ] Migration `up()` e `down()` são reversíveis
  - [ ] Nenhuma seed ou backfill — colunas começam nulas

---

### [S4-BE-02] Migration: criar tabela `setor_excecoes_expediente`

- **Objetivo:** Armazenar exceções ao expediente padrão (feriados, recesso, expediente reduzido).
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade, Coordenador do Setor
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_create_setor_excecoes_expediente_table.php`
- **Depende de:** S4-BE-01
- **Riscos relacionados:** R-19
- **Casos de teste obrigatórios:**
  - Migration aplica-se sem erros
  - Índice `idx_excecoes_setor_periodo` é criado sobre `(setor_id, data_inicio, data_fim)`
  - Relationship com `Setor` via FK `setor_id` com cascata em delete
  - Exceção de um único dia: `data_inicio === data_fim`
  - Exceção de intervalo (recesso 15 dias): 1 única linha cobre `data_inicio` a `data_fim` (sem 15 linhas)
- **Critérios de aceite:**
  - [ ] Schema exato conforme documento 03, §9.3:
    - `id` BIGINT PRIMARY KEY
    - `setor_id` BIGINT NOT NULL REFERENCES `setors(id)` ON DELETE CASCADE
    - `data_inicio` DATE NOT NULL
    - `data_fim` DATE NOT NULL
    - `fechado` BOOLEAN NOT NULL DEFAULT true
    - `horario_abertura` TIME NULL (usado apenas quando `fechado = false`)
    - `horario_fechamento` TIME NULL
    - `motivo` VARCHAR(255) NULL
    - `created_at`, `updated_at` TIMESTAMP
  - [ ] Índice composto `idx_excecoes_setor_periodo` criado
  - [ ] `ON DELETE CASCADE` confirmado — se setor for excluído, as exceções vão com ele
  - [ ] Migration é reversível

---

### [S4-BE-03] Relações Eloquent: `Setor::coordenador()` e `Setor::excecoesExpediente()`

- **Objetivo:** Modelar as relações entre `Setor`, `User` (coordenador) e `SectorExcecaoExpediente`.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade, Coordenador do Setor
- **Partes afetadas:**
  - `app/Models/Setor.php`
  - `app/Models/SectorExcecaoExpediente.php` (modelo novo)
  - `app/Models/User.php` (se houver relacionamento bidirecional)
- **Depende de:** S4-BE-01, S4-BE-02
- **Riscos relacionados:** R-19 (nunca incluir nas props globais do Inertia)
- **Casos de teste obrigatórios:**
  - Chamar `$setor->coordenador` retorna `User|null`
  - Chamar `$setor->excecoesExpediente` retorna Collection de `SectorExcecaoExpediente`
  - Eager loading funciona: `Setor::with('coordenador', 'excecoesExpediente')->find($id)`
  - Soft delete não altera relacionamentos (se `Setor` usar soft-delete, a restrição `ON DELETE CASCADE` ainda vale ao hard delete)
- **Critérios de aceite:**
  - [ ] `Setor::coordenador()` = `BelongsTo User`
  - [ ] `Setor::excecoesExpediente()` = `HasMany SectorExcecaoExpediente`
  - [ ] `SectorExcecaoExpediente` modelo criado com `timestamps` e `fillable` apropriados
  - [ ] **Nenhuma relação adicionada ao eager loading global em `HandleInertiaRequests`** — carregar apenas sob demanda (risco R-19)
  - [ ] Testes confirmam que relação é acessível, não quebra serialização para JSON/Inertia

---

### [S4-BE-04] Serviço: `ExpedienteService::estaEmExpediente(Setor $setor, CarbonInterface $quando): ?bool`

- **Objetivo:** Implementar o algoritmo de decisão sobre se um setor está em expediente em um determinado momento, retornando 3 estados (`true`/`false`/`null`).
- **Caso de uso:** UC-18, UC-21-A (preparação)
- **Atores envolvidos:** Sistema (lógica pura)
- **Partes afetadas:**
  - `app/Services/ExpedienteService.php` (NOVO)
- **Depende de:** S4-BE-03
- **Riscos relacionados:** R-20 (expediente vazio), R-23 (premissa semântica)
- **Casos de teste obrigatórios:**
  - Estado `true`: horário dentro da faixa semanal configurada e dentro do intervalo de horário (`horario_abertura` ≤ `$quando` ≤ `horario_fechamento`), dia da semana em `dias_funcionamento`
  - Estado `false`: fora da faixa horária configurada, ou dia da semana não em `dias_funcionamento`
  - Estado `null`: `horario_abertura` é NULL OU `dias_funcionamento` é NULL (não configurado)
  - Exceção com `fechado = true` sempre retorna `false`, sobrepondo regra semanal
  - Exceção com `fechado = false` + horários especiais retorna resultado da faixa especial
  - Exceção é procurada corretamente: `whereDate('data_inicio', '<=', $quando) AND whereDate('data_fim', '>=', $quando)`
  - Precedência: exceção > regra semanal
- **Critérios de aceite:**
  - [ ] Algoritmo implementado fielmente conforme documento 03, §9.4 (3 estados, precedência, lógica ISO-8601)
  - [ ] Retorno é `?bool` (permite `null`)
  - [ ] Parâmetro `$quando` é tipo `CarbonInterface` (não string)
  - [ ] Testável e sem dependência de `now()` — recebe `$quando` como argumento
  - [ ] Validação de `dayOfWeekIso` (1=seg, 7=dom, ISO-8601)
  - [ ] Sem efeitos colaterais, sem query ao banco fora do primeiro `->first()` de exceção

---

### [S4-BE-05] Policy: `SetorPolicy::atualizarExpediente(User $user, Setor $setor): bool`

- **Objetivo:** Autorizar a edição de expediente de um setor, com 3 caminhos: Institucional (sempre), Gestor de Unidade (setor de sua(s) unidade(s)), Coordenador designado (apenas seu próprio setor).
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade, Coordenador do Setor
- **Partes afetadas:**
  - `app/Policies/SetorPolicy.php`
  - `app/Repositories/UnidadeRepositoryInterface.php` (já existe — reusar `getUnidadesGeridasPor()`)
- **Depende de:** S4-BE-03, Sprint 1 (Gestor de Unidade + `unidade_gestores` pivot)
- **Riscos relacionados:** R-21 (escalonamento via edição de setor), R-01 (IDOR)
- **Casos de teste obrigatórios:**
  - Institucional com permission `setores.atualizar` pode editar expediente de qualquer setor
  - Gestor de Unidade pode editar expediente de setores da(s) sua(s) unidade(s)
  - Gestor de Unidade **não** consegue editar setor de unidade alheio (IDOR test: 2 campi, 2 gestores)
  - Coordenador designado pode editar expediente do próprio setor (`setor.coordenador_id === $user->id`)
  - Coordenador designado **não** consegue editar setor diferente, mesmo que de mesma unidade
  - Usuário comum (sem nenhum papel) é rejeitado
- **Critérios de aceite:**
  - [ ] Lógica implementada conforme documento 03, §9.5: IF institucional THEN true; ELSE IF gestor de unidade escopado THEN true; ELSE IF coordenador designado THEN true; ELSE false
  - [ ] Reusa `$this->unidadeRepository->getUnidadesGeridasPor($user->id)` (nunca duplica lógica de escopo)
  - [ ] Sem hard-coded `hasRole()` — usa `hasPermissionTo()` para Institucional (risco R-04)
  - [ ] Testes incluem cenário multi-unidade (Gestor de Unidade com 2 unidades consegue editar ambas)
  - [ ] Testes confirmam que coordenador é checado por `===`, não por `IN`

---

### [S4-BE-06] Endpoint e FormRequest: `PATCH /setores/{setor}/expediente`

- **Objetivo:** Fornecer rota estreita dedicada para edição de expediente, separada do CRUD genérico `PUT /setores/{setor}`, com validação restrita aos campos de expediente.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade, Coordenador do Setor
- **Partes afetadas:**
  - `routes/web.php` (adicionar rota)
  - `app/Http/Controllers/Setor/SetorController.php` ou novo `SetorExpedienteController.php` (método `updateExpediente()`)
  - `app/Http/Requests/UpdateSetorExpedienteRequest.php` (NOVO)
  - `app/Services/SetorService.php` (ou refatorar `update()` para adicionar método paralelo)
- **Depende de:** S4-BE-05, S4-BE-04
- **Riscos relacionados:** R-21 (delimitação de campo), R-22 (auditoria)
- **Casos de teste obrigatórios:**
  - Requisição válida com `horario_abertura`, `horario_fechamento`, `dias_funcionamento` é aceita
  - Requisição com campos adicionais (`nome`, `sigla`, `unidade_id`, `coordenador_id`) — mesmo no payload — é rejeitada ou os campos são silenciosamente ignorados (não aplicados ao DB)
  - Validação de horários: `horario_abertura` < `horario_fechamento`
  - Validação de `dias_funcionamento`: array de inteiros 1–7 (ISO-8601)
  - Exceções: validação de intervalo (`data_inicio` ≤ `data_fim`), campo `fechado` boolean
  - Usuário não autorizado (não é gestor de unidade daquela unidade) recebe 403
- **Critérios de aceite:**
  - [ ] Rota `PATCH /setores/{setor}/expediente` definida e autorizada por `SetorPolicy::atualizarExpediente()`
  - [ ] `UpdateSetorExpedienteRequest` **nunca** aceita `nome`, `sigla`, `unidade_id`, `coordenador_id` — validação explícita ou `fillable` limitado
  - [ ] Horários validados com `date_format:H:i` ou similar
  - [ ] `dias_funcionamento` validado como `array` com `between:1,7` por item
  - [ ] Exceções validadas em subrequest (`excecoes.*.data_inicio`, etc.)
  - [ ] Response retorna setor atualizado com campos de expediente
  - [ ] Soft delete: não afeta setors já deletados (soft-delete), válida normalmente

---

### [S4-BE-07] Endpoint: Designação de `coordenador_id` no CRUD de Setor

- **Objetivo:** Permitir que Institucional e Gestor de Unidade designem o coordenador responsável de um setor, como parte da edição normal do setor (`PUT /setores/{setor}`), sem segregar em endpoint separado.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:**
  - `app/Http/Requests/UpdateSetorRequest.php` (ou `StoreSetorRequest`, se houver)
  - `app/Http/Controllers/Setor/SetorController.php::update()`
  - `SetorPolicy::update()` (já deve existir — estender se necessário)
- **Depende de:** S4-BE-05
- **Riscos relacionados:** R-21 (risco: coordenador não pode alterar si mesmo)
- **Casos de teste obrigatórios:**
  - Institucional consegue designar coordenador (null ou `user_id` existente)
  - Gestor de Unidade consegue designar coordenador em setor de sua unidade
  - Gestor de Unidade **não** consegue designar em setor alheio
  - Coordenador designado **não** consegue se remover nem designar substituto (só edita expediente, não coordenador_id)
  - Usuário inexistente retorna erro de validação
- **Critérios de aceite:**
  - [ ] Campo `coordenador_id` validado em `UpdateSetorRequest` como `['nullable', 'exists:users,id']`
  - [ ] Policy `update()` confirmada para Institucional/Gestor de Unidade (já deve existir; S4-BE-05 é específica de expediente)
  - [ ] Coordenador nunca consegue alterar `coordenador_id` (validado em teste)
  - [ ] Transação garante que setor e coordenador chegam ao banco juntos

---

### [S4-BE-08] Trilha de Auditoria: Alterações de Expediente (R-22)

- **Objetivo:** Registrar autor e valores anteriores em toda alteração de expediente (risco R-22: coordenador controla indiretamente o portão da urgência).
- **Caso de uso:** UC-18
- **Atores envolvidos:** Sistema (lógica pura)
- **Partes afetadas:**
  - Tabela de log de auditoria (existente ou nova conforme arquitetura do projeto)
  - `app/Services/SetorService.php` (adicionar lógica de log)
  - Modelo de auditoria se precisar (ex.: `SetorAuditLog` ou reusar solução existente)
- **Depende de:** S4-BE-06
- **Riscos relacionados:** R-22 (controle indireto do portão)
- **Casos de teste obrigatórios:**
  - Alteração de `horario_abertura` registra valor anterior e novo no log
  - Alteração de `dias_funcionamento` registra array anterior e novo
  - Adição de exceção registra os dados completos da exceção
  - Log inclui `user_id` de quem executou
  - Log inclui `timestamp` de quando foi executado
  - Múltiplas alterações sucessivas geram múltiplas linhas no log
- **Critérios de aceite:**
  - [ ] Cada `PATCH /setores/{setor}/expediente` dispara evento ou listener que registra no log
  - [ ] Log inclui: `setor_id`, `user_id` (quem alterou), `valores_anteriores` (JSON), `valores_novos` (JSON), `timestamp`
  - [ ] Se a solução de auditoria for genérica (ex.: `ActivityLog`), confirmar que é adequada aqui; caso contrário, tabela/modelo dedicado
  - [ ] Teste verifica que alterar `horario_abertura` de `08:00` para `09:00` gera entrada com `valores_anteriores.horario_abertura = '08:00'`

---

### [S4-BE-09] Validação: Delimitação de Campos por Ator (R-21)

- **Objetivo:** Garantir que o coordenador designado **nunca** consegue alterar campos que não sejam de expediente, mesmo que enviados no payload.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Coordenador do Setor
- **Partes afetadas:**
  - `app/Http/Requests/UpdateSetorExpedienteRequest.php` (S4-BE-06)
  - Testes de autorização
- **Depende de:** S4-BE-06, S4-BE-09 (este é o teste dedicado)
- **Riscos relacionados:** R-21 (escalonamento via edição de setor)
- **Casos de teste obrigatórios:**
  - Coordenador tenta enviar `unidade_id` no payload via `PATCH /setores/{setor}/expediente` — é rejeitado ou ignorado
  - Coordenador tenta enviar `nome` no payload — é rejeitado ou ignorado
  - Coordenador tenta enviar `sigla` no payload — é rejeitado ou ignorado
  - Coordenador tenta enviar `coordenador_id` no payload — é rejeitado ou ignorado
  - Mudança desses campos **não persiste no DB** (verificado em query posterior)
  - Coordenador consegue editar campos válidos (`horario_abertura`, etc.) **na mesma requisição** onde tenta campos inválidos (rejeita a alteração inteira ou apenas o campo inválido?)
- **Critérios de aceite:**
  - [ ] `UpdateSetorExpedienteRequest` usa `only()` ou `except()` para garantir que **somente** `horario_abertura`, `horario_fechamento`, `dias_funcionamento` e exceções entram (implementação técnica: `fillable` limitado ou `getValidated()` com chaves pré-filtradas)
  - [ ] Teste unitário de FormRequest confirma que `$request->validated()` nunca contém campos proibidos
  - [ ] Teste integração confirma que banco não é alterado para campos proibidos mesmo se enviados
  - [ ] Comportamento claro documentado (rejeita a requisição inteira, ou ignora silenciosamente o campo? — decidir e testar ambos os casos)

---

### [S4-BE-10] Dashboard: Extensão de `HomeService` com Indicador de Setores Sem Expediente

- **Objetivo:** Adicionar ao bloco de dashboard do Gestor de Unidade um indicador (contagem ou lista) de setores do campus que ainda não têm expediente cadastrado (risco R-20).
- **Caso de uso:** UC-18, UC-20
- **Atores envolvidos:** Gestor de Unidade
- **Partes afetadas:**
  - `app/Services/HomeService.php` (estender `getGestorUnidadeData()` ou método paralelo)
  - `app/Repositories/SetorRepositoryInterface.php` (adicionar método para buscar setores sem expediente)
  - Frontend: `resources/js/presentation/organisms/WidgetPainelGestorUnidade.tsx` consome dados (integração em S4-FE-04)
- **Depende de:** S4-BE-01, S4-BE-03, Sprint 1 (Gestor de Unidade)
- **Riscos relacionados:** R-20 (expediente vazio no deploy — mitigado por D-6, preenchimento gradual com indicador)
- **Casos de teste obrigatórios:**
  - Query retorna apenas setores da(s) unidade(s) gerida(s) pelo usuário
  - Query filtra setores onde `horario_abertura IS NULL` OU `dias_funcionamento IS NULL`
  - Múltiplas unidades: se Gestor de Unidade gerencia Campus A e B, conta setores de ambos
  - Contagem está correta após inserção de novo setor sem expediente
  - Contagem desce quando expediente é adicionado
  - Soft-deleted setors não entram na contagem
- **Critérios de aceite:**
  - [ ] Novo método em `HomeService` (ex.: `getSetoresPendentes(User $user): Collection`)
  - [ ] Retorna apenas setores da(s) unidade(s) do usuário
  - [ ] Retorna campos: `id`, `nome`, `sigla`, `unidade_id` (dados para atalho para tela de edição)
  - [ ] Query em repositório usando `whereNull('horario_abertura')->orWhereNull('dias_funcionamento')`
  - [ ] Adiciona à prop retornada do `getGestorUnidadeData()` um campo `setor_pendentes_count` (número) e opcionalmente `setores_pendentes` (lista reduzida)
  - [ ] Teste confirma que usuário comum (sem papel) **não consegue acessar esse dado** (se houver endpoint específico para isso)

---

## Resumo de Dependências Entre Tasks

```
S4-BE-01 (Migrations)
├── S4-BE-02 (exceções)
│   └── S4-BE-03 (Relações Eloquent)
│       ├── S4-BE-04 (ExpedienteService)
│       │   └── S4-BE-05 (SetorPolicy)
│       │       ├── S4-BE-06 (Endpoint PATCH)
│       │       │   └── S4-BE-08 (Auditoria)
│       │       │       └── S4-BE-09 (Delimitação de campo)
│       │       └── S4-BE-07 (Designação de coordenador)
│       └── S4-BE-10 (Dashboard)
```

**Ordem recomendada de execução:** S4-BE-01 → S4-BE-02 → S4-BE-03 → S4-BE-04 → S4-BE-05 → S4-BE-06 → S4-BE-07 → S4-BE-08 → S4-BE-09 → S4-BE-10

S4-BE-10 pode rodar em paralelo com S4-BE-06 a S4-BE-09 uma vez que S4-BE-03 esteja pronto.
