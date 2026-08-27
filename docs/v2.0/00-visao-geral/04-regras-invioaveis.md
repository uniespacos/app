# 04 — Regras Invioláveis da v2.0

> **Documento para revisores de PR.** Leia antes de aprovar qualquer mudança na v2.0. Regras não negociáveis — violação impede merge.

---

## Parte 1: Regras Gerais do Projeto (Herdadas)

Estas 6 regras valem para todo o UniEspaços e foram estabelecidas em `CLAUDE.md`. Repete-se aqui por ênfase:

### 1. Nunca use `RefreshDatabase` em teste

O trait `RefreshDatabase` apaga o banco de desenvolvimento **inteiro**. Use sempre `DatabaseTransactions` (padrão
já em `tests/TestCase.php`). Um teste que limpa o banco por acidente afeta todos os devs que compartilham o Docker.

### 2. Comandos Banidos

Jamais rode em ambiente local/desenvolvimento:
- `migrate:fresh`
- `migrate:reset`
- `db:wipe`
- `cache:clear --database`

Se um teste quebrou e você suspeita que o banco está "sujo", relata ao time — nunca limpe por conta própria.

### 3. Toda `Notification` implementa `ShouldQueue`

Envio síncrono de e-mail dentro de uma request HTTP trava o usuário. Obrigatoriamente `implements ShouldQueue`.

### 4. `notify()` dentro de `Job` sempre em `try-catch`

Sem isso, uma falha do provedor de e-mail derruba a lógica central da job e dispara alerta falso ao usuário. A
tentativa de notificar **nunca** deve abrir uma excepção descontrolada.

### 5. `REVERB_SCHEME=http` para Comunicação Interna

Backend → Reverb dentro do Docker usa HTTP. HTTPS fica só no caminho externo (browser → Caddy → Reverb).

### 6. Sem Trailer de Co-autoria em Commit

Os commits saem com a autoria do desenvolvedor. Nenhuma mensagem do tipo `Co-Authored-By: Claude ...`.

---

## Parte 2: Regras Específicas da v2.0

Cada regra aqui protege contra um ou mais riscos identificados na auditoria (ver `docs/auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`).

### 1. Nunca Condicionar Fluxo a Nome de Papel

**Regra:** Autorização de negócio **nunca** verifica `role === 'gestor_espaco'` ou `hasRole('gestor_unidade')`. Sempre
checar a **permission real**.

**Implementação:**
- **Backend:** `$user->hasPermissionTo('secao.gestao-modulos')` em Policy, nunca `hasRole()`.
- **Frontend:** `<Can permission="secao.gestao-modulos">` ou `useCan('secao.gestao-modulos')`, nunca
  `user.role === 'gestor_unidade'`.

**Risco mitigado:** R-04 (autorização por nome de papel viola a separação PBAC).

---

### 2. Toda Policy de Escopo Territorial Valida Posse Explícita

**Regra:** `gestor_unidade` só pode operar dentro de `unidadeIds IN unidadesGeridas($user)`.  
`gestor_espaco` só pode operar dentro de `espacoIds IN espacosGeridosPorGestorEspaco($user)`.

Nunca confiar apenas na permission genérica (`secao.gestao-modulos`); a Policy **deve** filtrar por unidade/espaço.

**Exemplo:**
```php
public function update(User $user, Modulo $modulo): bool
{
    if (!$user->hasPermissionTo('secao.gestao-modulos')) {
        return false;
    }

    // Escopo: só módulos da(s) unidade(s) gerida(s) pelo usuário
    $unidadeIds = $user->unidadesGeridas()->pluck('id');
    if (!$unidadeIds->contains($modulo->unidade_id)) {
        return false;
    }

    return true;
}
```

**Risco mitigado:** R-01 (escopo vazando entre unidades — um Gestor de Unidade conseguindo operar outro campus via
URL direta).

---

### 3. Defesa em Profundidade nas Queries de Escrita

**Regra:** Toda query de `update()` ou `delete()` que altera um recurso escopado repete o filtro de posse **na
própria query SQL**, redundante com a Policy. Nunca confiar só na autorização em memória.

**Exemplo (padrão já em `AvaliarReservaJob`):**
```php
Horario::where('id', $horarioId)
    ->whereIn('agenda_id', $agendasDoGestorIds)  // filtro redundante com Policy
    ->update(['situacao' => 'deferida']);
```

No contexto do Gestor de Espaço (urgência), seria:
```php
Horario::where('id', $horarioId)
    ->whereIn('agenda.espaco_id', $espacoIdsGeridosPorGestorEspaco)
    ->update(['situacao' => 'deferida']);
```

**Por quê:** Protege contra bugs na Policy ou condições de corrida (race conditions) na filtragem em memória.

**Risco mitigado:** R-01 (IDOR via falha de escopo na query).

---

### 4. ⚠️ Sprint 1 é Bloco Atômico — Não Mergear em Partes

**Regra CRÍTICA:** As permissions `secao.gestao-modulos`, `secao.gestao-setores`, `secao.gestao-espacos` **nunca**
podem ser concedidas ao role `gestor_unidade` antes de as **Policies escopadas estarem implementadas e testadas**.

**O problema:** Rotas são liberadas por permission e controllers não filtram por unidade. Conceder a permission
antes da Policy = acesso cross-campus. Um Gestor de Unidade do Campus A enxergaria (e editaria) Módulos, Setores e
Espaços de **todos os 3 campi** da UESB.

**Sequência obrigatória:**
1. Criar tabelas (`unidade_gestores`, `modulo_gestores_espaco`, `espaco_gestores_espaco`).
2. Implementar repositórios com algoritmo de precedência.
3. **Implementar e testar Policies escopadas** (toda uma suite de testes com 2+ campi e 2+ gestores).
4. **Conceder a permission ao role** (concomitantemente com o passo 3, na mesma PR).

Ou as três entram juntas numa entrega única, ou a concessão da permission fica retida até o final.

**Teste obrigatório:** `ReservaAuthorizationTest` já estabelece o padrão de autorização com 2 campi — replicar para
todas as policies novas (`ModuloPolicy`, `SetorPolicy`, `EspacoPolicy`).

**Risco mitigado:** R-18 (**o risco mais crítico desta migração** — sequenciamento de permissions).

---

### 5. Responsável Designado de Setor Edita Apenas Expediente

**Regra:** O `coordenador_id` de um Setor edita **exclusivamente** campos de expediente:
- `horario_abertura`
- `horario_fechamento`
- `dias_funcionamento`
- Exceções (tabela `setor_excecoes_expediente`)

**Nunca** edita:
- `nome`
- `sigla`
- `unidade_id`
- `coordenador_id` (quem o designou)

**Por quê:** Editar `unidade_id` permitiria mover o setor para outro campus e escapar do escopo de quem o designou
(mesmo tipo de escalonamento que R-01 cobre).

**Implementação:** Policy delimitada por campo na camada de Service ou diretamente no Controller, nunca permitindo
update genérico de `Setor` pelo coordenador.

**Risco mitigado:** R-21 (escalonamento via edição de setor).

---

### 6. Toda Alteração de Expediente Gera Trilha de Auditoria

**Regra:** Mudanças em `horario_abertura`, `horario_fechamento`, `dias_funcionamento` ou exceções devem ser
registradas com:
- Autor (quem fez a mudança)
- Valores anteriores
- Timestamp da mudança

**Por quê:** Com o expediente agora governando automaticamente o bloqueio da aprovação de urgência (ver regra 8), quem
o edita controla indiretamente se a urgência é permitida naquele setor. A trilha é barata e suficiente como controle.

**Implementação sugerida:** Tabela `audits` já existe ou criar `setor_audit_log` simples; disparar em
`Setor::booted()` via `updated` event, ou integrar com ferramenta de auditoria existente.

**Risco mitigado:** R-22 (controle indireto do portão de urgência).

---

### 7. Setor Nunca Guarda Escopo de Gestão de Espaços

**Regra:** Campos que já existem em `Setor` (organizacionais: `nome`, `sigla`, `unidade_id`) **nunca** são usados para
determinar "quem gerencia qual espaço".

O escopo de gestão de espaços vive **exclusivamente** nos 3 pivots:
- `unidade_gestores` (Gestor de Unidade)
- `modulo_gestores_espaco` (Gestor de Espaço padrão do Módulo)
- `espaco_gestores_espaco` (Gestor de Espaço direto no Espaço)

**Misturar as duas semânticas** (setor organizacional + setor de gestão) reabre uma opção de design já rejeitada em
auditoria anterior.

**Por quê:** Manter `Setor` como entidade puramente administrativa, com escopo de gestão ligado exclusivamente via
`coordenador_id` (responsável pela edição de expediente, regra 5). Qualquer filtro de espaços por setor passa por
`User.setor_id` (vínculo de RH), não por uma lógica de `Setor` como "unidade de gestão".

---

### 8. Aprovação de Urgência é Exclusivamente do Mesmo Dia

**Regra:** Nenhuma reserva com qualquer horário fora de **hoje** pode ser aprovada por urgência.

**Validação dupla obrigatória:**
1. **Na Policy (`ReservaPolicy::avaliarComUrgencia()`):** Se qualquer horário da reserva cair em outra data (Fluxo A),
   a urgência é recusada.
2. **Na entrada do formulário (Fluxo B):** O Gestor de Espaço no balcão só consegue criar/avaliar com urgência
   horários **deste dia**.

Nunca relaxar essa checagem. Se a regra de negócio for expandida para "dias futuros próximos", exige nova decisão
explícita e risco assessment.

**Risco mitigado:** P-15 (decisão fechada: urgência **nunca** vale para data futura).

---

### 9. `reservas.user_id` Permanece `NOT NULL`

**Regra:** Toda reserva deve ter um usuário cadastrado e autenticado como titular.

Não criar reserva "avulsa" sem usuário, mesmo no Fluxo B (walk-in no balcão). Se a pessoa não tem cadastro, ela se
cadastra na hora (via QR Code no balcão, no dispositivo dela, não deslogando o Gestor de Espaço).

**Por quê:** Toda a lógica de propriedade em `ReservaPolicy::view()`, `::update()`, `::delete()` depende dessa
invariante. Remover a obrigatoriedade abriria brechas de IDOR.

**Risco mitigado:** P-30 (decisão fechada: só usuários cadastrados).

---

### 10. Institucional Nunca Recebe `reservas.avaliar-urgencia`

**Regra:** A permission `reservas.avaliar-urgencia` é concedida **exclusivamente** ao role `gestor_espaco`.

**Adicioná-la explicitamente à lista de exclusão no `RoleSeeder`** (junto com `reservas.deletar` e
`reservas.atualizar`):

```php
// RoleSeeder::run()
$institucional->syncPermissions(
    Permission::where('name', '!=', 'reservas.deletar')
        ->where('name', '!=', 'reservas.atualizar')
        ->where('name', '!=', 'reservas.avaliar-urgencia')  // NOVA EXCLUSÃO
        ->pluck('id')
);
```

**Por quê:** O Institucional monitora e faz analytics. Não avalia reservas — nem no fluxo normal, nem na urgência.

**Risco mitigado:** R-04, P-34 (separação de papéis).

---

### 11. `unidades.label_gestor` é Puramente Cosmético

**Regra:** O campo `label_gestor` (ex.: "Prefeitura de Campus", "Assessoria Acadêmica") **nunca** aparece em lógica
de autorização.

Usa-se apenas para exibição (UI). A chave Spatie do role permanece **sempre** `gestor_unidade`, independentemente
do rótulo customizado.

**Implementação:** Frontend consome `unidade.label_gestor ?? 'Gestor de Unidade'` em telas. Backend não toca nele em
nenhuma decisão de acesso.

**Risco mitigado:** Confusão de identidade vs. autorização (P-13).

---

### 12. Chave Spatie do Role `gestor` Nunca é Renomeada

**Regra:** O role `gestor` mantém a chave `gestor` na tabela Spatie `roles`.

**Apenas o rótulo de exibição muda** (em `permission-labels.ts` ou similar) para "Gestor de Reserva", diferenciando
de "Gestor de Espaço" e "Gestor de Unidade".

**Por quê:** `app/Models/Role.php` implementa em `booted()` um validador que lança `RuntimeException` ao tentar
renomear qualquer role com `is_system = true`. As 3 roles atuais são de sistema. Contornar essa proteção é deliberado
e arriscado.

**Risco mitigado:** P-02 (decision já tomada, reforçada tecnicamente).

---

### 13. Zero Supressão Nova de ESLint

**Regra:** Código novo **nunca** pode incluir supressão de linter (`// eslint-disable-line`).

Débito técnico pré-existente (95 supressões em 45 arquivos) será quitado posteriormente. Valide com:
```bash
npx eslint resources/js --suppressions-location <(echo '{}')
```

Se uma regra está legítima demais para suprimir, levanta-se uma issue e o padrão é ajustado em decisão arquitetural
— não se cala o linter.

**Risco mitigado:** Acúmulo de débito técnico (P-32, etc.).

---

## Parte 3: Checklist Rápido de Revisão de PR

Cole este checklist na descrição de PR antes de pedir revisão:

```markdown
## ✅ Verificação de Regras Invioláveis

- [ ] (R.1) `DatabaseTransactions` em teste, nunca `RefreshDatabase`
- [ ] (R.2) Nenhum dos comandos banidos (`migrate:fresh`, `db:wipe`, etc.)
- [ ] (R.3) Toda `Notification` nova implementa `ShouldQueue`
- [ ] (R.4) Se há `notify()` em `Job`, está em `try-catch`
- [ ] (R.5) `REVERB_SCHEME=http` na comunicação interna (Docker)
- [ ] (R.6) Sem trailer `Co-Authored-By:` no commit

**v2.0 Específicas:**

- [ ] (2.1) Autorização só por permission (`hasPermissionTo()` / `<Can>`), nunca por `hasRole()`
- [ ] (2.2) Toda Policy nova de escopo valida posse (`whereIn('unidade_id', $unidadeIds)`)
- [ ] (2.3) Queries de escrita repetem filtro de posse (defesa em profundidade)
- [ ] (2.4) ⚠️ Se toca em permissions `secao.gestao-*`, Policy escopada está implementada e testada (R-18)
- [ ] (2.5) Coordenador edita apenas expediente (`horario_*`, `dias_funcionamento`, exceções)
- [ ] (2.6) Alterações de expediente geram trilha de auditoria
- [ ] (2.7) Nenhuma lógica de escopo usa campos de `Setor`; todo escopo vem dos 3 pivots
- [ ] (2.8) Urgência só vale para hoje; validação em Policy + SQL
- [ ] (2.9) `reservas.user_id NOT NULL` — sem reserva avulsa
- [ ] (2.10) `reservas.avaliar-urgencia` está excluída do `institucional` em `RoleSeeder`
- [ ] (2.11) `label_gestor` nunca aparece em lógica de autorização
- [ ] (2.12) Chave `gestor` do role não foi renomeada
- [ ] (2.13) Zero supressão nova de ESLint; valide com `--suppressions-location <(echo '{}')`

**Testes:**

- [ ] `npx tsc --noEmit` — 0 erros de tipo
- [ ] `npx jest` — 100% verde (se tocou frontend)
- [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde (se tocou backend)
- [ ] `docker exec uniespacos-workspace-1 vendor/bin/pint` aplicado (se tocou PHP)
- [ ] Testes de autorização incluem 2+ campi / 2+ papéis (se tocou em Policy de escopo)
```

---

## Referência Rápida de Documentos

- **Decisões de negócio (P-XX, D-XX):** `docs/auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`
- **Riscos e mitigação (R-XX):** Mesma fonte, §1
- **Modelo de dados (3 pivots, algoritmo de precedência):** `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md`
- **Fluxos de urgência e expediente:** `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md` §7–§8
- **Autorização e policies:** `docs/authorization-policies.md`
