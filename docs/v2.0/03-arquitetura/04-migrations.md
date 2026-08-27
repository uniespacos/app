# 04 — Migrations: Tabelas e Campos Novos da v2.0

## 1. Princípio: Tudo Aditivo

Nenhuma migration desta v2.0 altera ou remove coluna, tipo, constraint ou tabela **existente**. A única exceção é a remoção deliberada de linhas de dados na tabela `permissions` (remoção de permissões órfãs de Andar), que não alteração de estrutura.

Esta diretriz está em conformidade com `docs/REGRAS_INVIOLAVEIS_E_PADROES.md` §2.1 ("Zero Alteração no Schema"):

> Proibido criar ou executar migrations que modifiquem tipos de colunas, constraints ou excluam campos do PostgreSQL 16 sem alinhamento prévio. O schema vigente é 100% preservado.

A regra veda **alterar ou remover** estrutura, não veda **adicionar** novas tabelas e colunas. Todos os `down()` são reversíveis: `dropIfExists` para tabelas, `dropColumn` para campos.

---

## 2. Ordem Sugerida de Migrations

### 2.1 `create_unidade_gestores_table`

**Função:** Tabela pivot N:N — relaciona `User` a `Unidade` como Gestor de Unidade.

**Schema SQL:**

```sql
CREATE TABLE unidade_gestores (
    id BIGINT PRIMARY KEY,
    unidade_id BIGINT NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (unidade_id, user_id)
);
```

**Detalhes:**

- Constraint `UNIQUE (unidade_id, user_id)` garante que um usuário não é duplicado como gestor da mesma unidade.
- `ON DELETE CASCADE` em ambas as FKs: se a unidade for removida, o vínculo desaparece; se o usuário for removido, o vínculo também desaparece.
- Tabela nasce **vazia** (sem backfill necessário — é uma nova entidade).

**Reversibilidade (`down()`):**

```php
Schema::dropIfExists('unidade_gestores');
```

**Backfill necessário:** Não. Inserção de gestores será manual via UI ou seeder posterior (fora do escopo de criação da estrutura).

---

### 2.2 `create_modulo_gestores_espaco_table`

**Função:** Tabela pivot N:N — relaciona `User` a `Modulo` como Gestor de Espaço padrão (setor de audiovisual padrão).

**Schema SQL:**

```sql
CREATE TABLE modulo_gestores_espaco (
    id BIGINT PRIMARY KEY,
    modulo_id BIGINT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (modulo_id, user_id)
);
```

**Detalhes:**

- **Sem** constraint de unicidade em `modulo_id` isolado — múltiplos usuários podem compor a equipe padrão de um módulo.
- `ON DELETE CASCADE` para ambas as FKs: se o módulo for removido, todos os vínculos daquele módulo desaparecem; se o usuário for removido, o vínculo é removido.
- Tabela nasce **vazia** — nenhum módulo tem gestor padrão por padrão.

**Reversibilidade (`down()`):**

```php
Schema::dropIfExists('modulo_gestores_espaco');
```

**Backfill necessário:** Não. Preenchimento posterior será manual ou via seeder de dados iniciais.

---

### 2.3 `create_espaco_gestores_espaco_table`

**Função:** Tabela pivot N:N — relaciona `User` a `Espaco` como Gestor de Espaço direto (override do padrão do módulo).

**Schema SQL:**

```sql
CREATE TABLE espaco_gestores_espaco (
    id BIGINT PRIMARY KEY,
    espaco_id BIGINT NOT NULL REFERENCES espacos(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (espaco_id, user_id)
);
```

**Detalhes:**

- Nome deliberadamente distinto de `espaco_user` (tabela já existente para favoritos) para eliminar ambiguidade semântica.
- Constraint `UNIQUE (espaco_id, user_id)` evita duplicação.
- **Presença de qualquer linha para um `espaco_id`** nesta tabela significa "este espaço tem override — ignore o padrão do módulo" (algoritmo de resolução em `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md` §3).
- `ON DELETE CASCADE` para ambas as FKs.

**Reversibilidade (`down()`):**

```php
Schema::dropIfExists('espaco_gestores_espaco');
```

**Backfill necessário:** Não. Criação de overrides será posterior, conforme necessidade de negócio.

---

### 2.4 `add_tipo_vinculo_to_users_table`

**Função:** Adiciona taxonomia de vínculo institucional ao usuário (estudante, professor, técnico-administrativo, externo).

**Schema SQL:**

```sql
ALTER TABLE users ADD COLUMN tipo_vinculo VARCHAR(30) NOT NULL DEFAULT 'externo';
```

**Detalhes:**

- Coluna **não-nulável** com `DEFAULT 'externo'` — default conservador que nunca concede prioridade indevida a um usuário legado que não declarou seu vínculo.
- Valores permitidos: `'estudante'`, `'professor'`, `'tecnico_administrativo'`, `'externo'` (enum `TipoVinculoEnum` em PHP).
- Usuários pré-existentes recebem `'externo'` automaticamente; cadastro novo (`StoreRegisterRequest`) passa a coletar o campo; usuários existentes são convidados a corrigir no perfil.
- Campo é **consultivo** — alimenta sugestões de prioridade em fluxos de urgência, mas nunca bloqueia automaticamente.

**Reversibilidade (`down()`):**

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('tipo_vinculo');
});
```

**Backfill necessário:** Sim — `'externo'` para toda base legada, aplicado automaticamente pelo `DEFAULT` da migration. Nenhuma ação posterior exigida.

---

### 2.5 `add_label_gestor_to_unidades_table`

**Função:** Adiciona rótulo customizável do cargo de Gestor de Unidade por campus (P-13).

**Schema SQL:**

```sql
ALTER TABLE unidades ADD COLUMN label_gestor VARCHAR(100) NULL;
```

**Detalhes:**

- Coluna **nullable** — `NULL` significa "usar rótulo padrão 'Gestor de Unidade'".
- Exemplo de valor: `"Prefeitura de Campus"`, `"Assessoria Acadêmica"`.
- Puramente **cosmético** — nunca usado em lógica de autorização, apenas em exibição. A chave Spatie continua sendo sempre `gestor_unidade`, independentemente do rótulo.
- Tabela `unidades` já existia; este campo é adição pura.

**Reversibilidade (`down()`):**

```php
Schema::table('unidades', function (Blueprint $table) {
    $table->dropColumn('label_gestor');
});
```

**Backfill necessário:** Não — o campo é opcional. Preenchimento será via UI de administração de unidades, conforme demanda.

---

### 2.6 `add_urgencia_fields_to_horarios_table`

**Função:** Adiciona campo de origem da avaliação (fluxo normal vs. urgência) a cada horário.

**Schema SQL:**

```sql
ALTER TABLE horarios ADD COLUMN origem_avaliacao VARCHAR(30) NOT NULL DEFAULT 'fluxo_normal';
```

**Detalhes:**

- Coluna **não-nulável** com `DEFAULT 'fluxo_normal'` — todo horário existente permanece no fluxo normal sem backfill.
- Valores permitidos: `'fluxo_normal'` (caminho padrão via Gestor de Reserva), `'urgencia_gestor_espaco'` (exceção, aprovação de Gestor de Espaço).
- Retrocompatível: nenhum backfill necessário — o default cobre todos os horários legados.
- Campo está em `Horario`, não em `Reserva`, porque a aprovação de urgência é sempre pontual (um dia). Colocá-la em `Reserva` obrigaria a reserva inteira a herdar uma origem que só se aplica a parte dela.

**Reversibilidade (`down()`):**

```php
Schema::table('horarios', function (Blueprint $table) {
    $table->dropColumn('origem_avaliacao');
});
```

**Backfill necessário:** Não — `DEFAULT 'fluxo_normal'` cobre toda a base legada.

---

### 2.7 `add_coordenador_e_expediente_to_setors_table`

**Função:** Expansão de `Setor` com coordenador responsável e horário de funcionamento padrão.

**Schema SQL:**

```sql
ALTER TABLE setors ADD COLUMN coordenador_id BIGINT NULL
    REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE setors ADD COLUMN horario_abertura TIME NULL;
ALTER TABLE setors ADD COLUMN horario_fechamento TIME NULL;
ALTER TABLE setors ADD COLUMN dias_funcionamento JSON NULL;
```

**Detalhes:**

- `coordenador_id`: referência a `users(id)` com `ON DELETE SET NULL`. Se o usuário for removido, o setor perde o coordenador mas não é destruído — coerente com o tratamento de `agendas.user_id`.
- `horario_abertura` e `horario_fechamento`: horários em formato `TIME`. Ambos podem ser `NULL` — indica "expediente não configurado".
- `dias_funcionamento`: coluna **JSON**, recebe array de inteiros ISO-8601 (1=seg, 7=dom). Exemplo: `[1, 2, 3, 4, 5]` para segunda a sexta. Reaproveita precedente do projeto — `Andar.tipo_acesso` já é JSON com cast `'array'`.
- Todas as colunas são **adições puras** — tabela `setors` já existia, nenhuma coluna anterior foi removida.

**Reversibilidade (`down()`):**

```php
Schema::table('setors', function (Blueprint $table) {
    $table->dropColumn('coordenador_id');
    $table->dropColumn('horario_abertura');
    $table->dropColumn('horario_fechamento');
    $table->dropColumn('dias_funcionamento');
});
```

**Backfill necessário:** Não — todos os campos são nullable. Preenchimento será gradual via UI, conforme cada setor é configurado (D-6).

---

### 2.8 `create_setor_excecoes_expediente_table`

**Função:** Registra exceções ao expediente padrão de um setor (feriados, recessos, expediente reduzido).

**Schema SQL:**

```sql
CREATE TABLE setor_excecoes_expediente (
    id BIGINT PRIMARY KEY,
    setor_id BIGINT NOT NULL REFERENCES setors(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    fechado BOOLEAN NOT NULL DEFAULT true,
    horario_abertura TIME NULL,
    horario_fechamento TIME NULL,
    motivo VARCHAR(255) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_excecoes_setor_periodo ON setor_excecoes_expediente (setor_id, data_inicio, data_fim);
```

**Detalhes:**

- Usa **intervalo** (`data_inicio` e `data_fim`), não uma linha por data — um recesso de 15 dias é 1 linha, não 15.
- `fechado = true`: a exceção é um encerramento (feriado, recesso).
- `fechado = false`: a exceção é um expediente **especial** (horários reduzidos), fornecidos em `horario_abertura` / `horario_fechamento`.
- `motivo`: descrição humanizável (ex.: "Recesso de fim de ano", "Feriado municipal").
- Índice composto `idx_excecoes_setor_periodo` otimiza buscas por período em consultas do tipo `WHERE setor_id = ? AND data_inicio <= ? AND data_fim >= ?`.
- Tabela nasce **vazia** — preenchimento será posterior via UI ou seeder.

**Reversibilidade (`down()`):**

```php
Schema::dropIfExists('setor_excecoes_expediente');
```

**Backfill necessário:** Não. Criação de exceções será manual, conforme calendário de cada setor.

---

### 2.9 `remove_orphan_andares_permissions`

**Função:** Remove permissões órfãs de `Andar` que nunca foram verificadas no código (P-32).

**Explicação:**

Esta é a **única migration desta lista que remove algo** — mas remove apenas **linhas de dados** em `permissions`, não estrutura de tabela. As permissions `andares.criar` e `andares.atualizar` existem no seeder (`database/seeders/RoleSeeder.php`) há anos mas nunca são verificadas em `AndareController` nem em Policy alguma.

**SQL de remoção:**

```sql
DELETE FROM permissions WHERE name IN ('andares.criar', 'andares.atualizar');
DELETE FROM role_has_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions WHERE name IN ('andares.criar', 'andares.atualizar')
);
```

**Detalhes:**

- Verifica se `Andar` ainda não têm controllers/policies que checam essas permissions. Se a auditoria estiver errada, o seeder pode recriá-las — migrations são idempotentes neste contexto.
- Não cria or remove tabelas ou colunas — apenas limpa ruído histórico.

**Reversibilidade (`down()`):**

A reversão é **opcional** — recriar permissões órfãs é improvável de ser necessário. Mas se for:

```php
// Apenas registro histórico — não auto-recriar.
// A remoção é declarativa: "estas perms não pertencem mais".
```

Em prática, não há `down()` que recrie as permissions — elas nascerão de novo na próxima seed que for rodada, se necessário.

**Backfill necessário:** Sim, remove linhas. Validação pré-execução: conferir que nenhum middleware/policy do projeto verifica `andares.criar` ou `andares.atualizar`.

---

### 2.10 `add_gestor_unidade_and_gestor_espaco_roles`

**Função:** Cria os dois novos roles do sistema: `gestor_unidade` e `gestor_espaco`.

**SQL:**

```sql
INSERT INTO roles (name, guard_name, is_system, created_at, updated_at)
VALUES
    ('gestor_unidade', 'web', true, NOW(), NOW()),
    ('gestor_espaco', 'web', true, NOW(), NOW());
```

**Detalhes:**

- Ambos os roles têm `is_system = true` — indica que são roles fundamentais do sistema, não customizáveis pelo usuário.
- Migration de **dados**, não de estrutura — tabela `roles` já existe.
- Segue o padrão de `RoleSeeder` (arquivo já existente que popula roles iniciais).
- Nenhuma permissão é associada nesta migration — a associação (ex.: `gestor_espaco` recebe `reservas.avaliar-urgencia`) fica para seeders subsequentes ou manual.

**Reversibilidade (`down()`):**

```php
DB::table('roles')->whereIn('name', ['gestor_unidade', 'gestor_espaco'])->delete();
```

**Backfill necessário:** Não — inserção de dados novos em tabela já existente. Os roles nascerão vazios (sem usuários atribuídos) e serão preenchidos manualmente ou via endpoints de administração.

---

## 3. Dependências entre Migrations

### 3.1 Independências

**Migrations 1–3 (tabelas pivot de gestores)** não têm dependência entre si — podem rodar em qualquer ordem relativa:

- `unidade_gestores` requer apenas que `unidades` e `users` existam (já existem).
- `modulo_gestores_espaco` requer apenas que `modulos` e `users` existam.
- `espaco_gestores_espaco` requer apenas que `espacos` e `users` existam.

**Migrations 4–8 (campos e tabelas novos)** são independentes das anteriores (1–3) e entre si:

- `add_tipo_vinculo_to_users_table` altera apenas `users`.
- `add_label_gestor_to_unidades_table` altera apenas `unidades`.
- `add_urgencia_fields_to_horarios_table` altera apenas `horarios`.
- `add_coordenador_e_expediente_to_setors_table` altera apenas `setors`.
- `create_setor_excecoes_expediente_table` cria nova tabela, depende apenas de `setors` (que já existe).

### 3.2 Ordem Recomendada

1. **Executar 1–3 primeiro** (pivots de gestores) — são independentes e estabelecem a base de relacionamentos.
2. **Executar 4–8 a seguir** (expansão de campos) — podem rodar em paralelo, mas convencionalmente rodam sequencialmente.
3. **Executar 9 (limpeza de permissions)** — deve ser precoce o suficiente para validar que nenhum código depende das permissions removidas.
4. **Executar 10 (criação de roles) por último** — faz sentido lógico deixar para o fim, pois é a "formalização" de que os novos roles estão prontos. Não há dependência técnica (10 não requer 1–9), mas é pedagogicamente claro executar nesta ordem.

### 3.3 Ordem Estrita Necessária?

Não — a única restrição é que qualquer migration que depende de um campo deve vir após a migration que cria o campo. Neste conjunto, **não há dependências cruzadas entre as 10 migrations** — cada uma é aditiva e não bloqueia a outra.

Recomendação: rodar na ordem 1–10 como indicado, mas sem urgência em paralelizar (migrations em banco de dados relacional devem ser seriais por design).

---

## 4. Backfill — Resumo

| Migration | Tem Backfill? | Estratégia | Notas |
|---|:---:|---|---|
| 1. `create_unidade_gestores_table` | ❌ Não | Tabela nova, nasce vazia | Preenchimento manual posterior |
| 2. `create_modulo_gestores_espaco_table` | ❌ Não | Tabela nova, nasce vazia | Preenchimento manual posterior |
| 3. `create_espaco_gestores_espaco_table` | ❌ Não | Tabela nova, nasce vazia | Preenchimento manual posterior |
| 4. `add_tipo_vinculo_to_users_table` | ✅ Sim (automático) | `DEFAULT 'externo'` em coluna não-nulável | Toda base legada recebe `'externo'`; nenhuma ação adicional |
| 5. `add_label_gestor_to_unidades_table` | ❌ Não | Coluna nullable, campo opcional | Preenchimento via UI conforme demanda |
| 6. `add_urgencia_fields_to_horarios_table` | ✅ Sim (automático) | `DEFAULT 'fluxo_normal'` em coluna não-nulável | Todo horário legado fica em fluxo normal; retrocompatível |
| 7. `add_coordenador_e_expediente_to_setors_table` | ❌ Não | Colunas nullable, campos opcionais | Preenchimento gradual, conforme setores são configurados (D-6) |
| 8. `create_setor_excecoes_expediente_table` | ❌ Não | Tabela nova, nasce vazia | Preenchimento manual por calendário |
| 9. `remove_orphan_andares_permissions` | ⚠️ Sim (remoção) | Remove linhas órfãs de `permissions` | Validar que nenhum código verifica `andares.criar`/`andares.atualizar` |
| 10. `add_gestor_unidade_and_gestor_espaco_roles` | ✅ Sim (inserção) | INSERT de 2 linhas em `roles` | Roles nascem vazios; preenchimento de usuários posterior |

### 4.1 Destaques

- **Tabelas novas (1–3, 8):** Nenhum backfill — nascem vazias, dados chegam via UI ou endpoints.
- **Campos com DEFAULT (4, 6):** Retrocompatibilidade total — todo registro legado recebe o valor default automaticamente.
- **Campos nullable (5, 7):** Opcional — não afetam registros legados.
- **Remoção (9):** A única que remove dado. Deve ser validada pré-execução.
- **Inserção de roles (10):** Simples — adiciona 2 linhas à tabela existente.

**Conclusão:** A maioria das migrations é **R-06 compatível** (tabelas novas vazias) ou retrocompatível via defaults. Nenhuma requer script de backfill complexo.

---

## 5. Referências

- **Modelagem completa:** `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md`
- **Regras invioláveis:** `docs/REGRAS_INVIOLAVEIS_E_PADROES.md` §2.1
- **Enums e constants:** `docs/enums-and-constants.md`
- **Expediente e Setor:** Documento em elaboração (fase 3)
- **Fluxos de urgência:** Documento em elaboração (fase 3)
