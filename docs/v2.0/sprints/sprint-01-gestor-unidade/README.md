# Sprint 1 — Gestor de Unidade: Modelo de Dados, Autorização Escopada e Entrega Atômica

## Objetivo do Sprint

Implementar o papel **Gestor de Unidade** com autonomia operacional completa sobre seu campus: criação da tabela `unidade_gestores`, role novo, Policies escopadas por `unidade_id` nos contratos de Módulo, Setor e Espaço, repositórios de listagem/edição escopados, endpoints de atribuição de gestores, e concessão final das permissions de gestão administrativa ao role — tudo como uma **entrega atômica e indivisível**.

---

## ⚠️ Bloco Atômico: Por Que Este Sprint Não Pode Ser Mergeado em Partes (Risco R-18)

As rotas administrativas (`/institucional/modulos`, `/institucional/setores`, `/institucional/espacos`) são
liberadas por middleware com **permissions** genéricas (`middleware(['permission:secao.gestao-modulos'])`), e os
controllers **HOJE NÃO FILTRAM POR `unidade_id`**. Se as permissions `secao.gestao-modulos`, `secao.gestao-setores`,
`secao.gestao-espacos` forem concedidas ao role `gestor_unidade` **antes** de as Policies e repositórios
implementarem o filtro de escopo por `unidade_id`, qualquer Gestor de Unidade enxergaria e editaria **os 3 campi da
UESB** — vazamento de escopo cross-campus.

**Consequência prática:** as 13 tasks deste sprint formam um **bloco indivisível**:

1. Tasks S1-BE-01 a S1-BE-09 (migrations, relations, Policies, repositórios) implementam o filtro de escopo
2. Task S1-BE-10 (controller + service de atribuição) fornece o mecanismo de atribuição do gestor
3. Task S1-BE-13 (**gate final**) concede as permissions ao role **somente depois** que tudo acima está testado e
   passou

**Nunca mergear S1-BE-13 como PR isolada.** Nunca mergear "cria o role" numa PR e "escopa as Policies" em outra.
Qualquer PR deste sprint deve incluir, no mínimo, as tasks de schema (S1-BE-01 a S1-BE-03), Policies (S1-BE-07 a
S1-BE-09) e o gate final (S1-BE-13) — ou nenhuma delas.

---

## O Que Este Sprint Entrega

- ✅ Tabela `unidade_gestores` (N:N, `UNIQUE(unidade_id, user_id)`)
- ✅ Role `gestor_unidade` (`is_system = true`, sem permissions iniciais)
- ✅ Coluna `unidades.label_gestor` (VARCHAR(100) NULL, puramente cosmética)
- ✅ Relations Eloquent em `Unidade::gestores()` e `User::unidadesGeridas()`
- ✅ `UnidadeRepositoryInterface::getUnidadesGeridasPor(int $userId): Collection`
- ✅ Extensão de `RelatorioService::aplicarEscopo()` para filtrar por unidades geridas
- ✅ Policies **escopadas** em `UnidadePolicy`, `ModuloPolicy`, `SetorPolicy`, `EspacoPolicy`
- ✅ Scoping em repositórios de listagem/edição (Modulo, Setor, Espaco)
- ✅ Endpoint e Service de atribuição/remoção de Gestores de Unidade
- ✅ Endpoint isolado `PATCH /unidades/{unidade}/label-gestor`
- ✅ Notifications de atribuição e remoção (`ShouldQueue`, com `try-catch` obrigatório)
- ✅ Concessão das permissions `secao.gestao-modulos`, `secao.gestao-setores`, `secao.gestao-espacos`,
  `unidades.listar`, `unidades.visualizar`, `unidades.atualizar` ao role `gestor_unidade`

---

## O Que Este Sprint NÃO Entrega

- ❌ Role `gestor_espaco` (Gestor de Espaço) — fica para Sprint 2
- ❌ Tabelas `modulo_gestores_espaco` e `espaco_gestores_espaco` (pivots de Gestor de Espaço) — Sprint 2
- ❌ Permissions `modulos.gerenciar-gestores-espaco`, `espacos.gerenciar-gestor-espaco-direto` — Sprint 2
- ❌ Aprovação de urgência (Fluxo A e B) — Sprint 8
- ❌ Expediente de setores e validação automática — Sprint 7
- ❌ Dashboard composto com bloco de Gestor de Unidade — Sprint 6
- ❌ Alias de rotas `/administrativo/*` (renaming de `/institucional/*`) — Sprint 11

---

## Nota de Adaptação: Divisão da Migration de Roles em 2 Sprints

A auditoria original (`docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md`, §5)
propôs uma **única migration** (`add_gestor_unidade_and_gestor_espaco_roles.php`) que criaria ambos os roles num só
passo. **Esta documentação divide em 2 sprints para reduzir risco atômico.**

**Adaptação executada:**
- Task **S1-BE-02**: Migration + seeder cria **APENAS `gestor_unidade`** (1 linha em `roles`)
- Task S1-BE-02 (para a futura Sprint 2): nova migration criará `gestor_espaco` isoladamente

Impacto: nenhum na arquitetura, apenas dividir em dois passos o que a auditoria havia bundlado. Registrado aqui para
rastreabilidade.

---

## Definição de Versão Estável (Fim de Sprint)

Ao fim deste sprint, um **usuário com role `gestor_unidade`** designado para as Unidades (campi) A, B e C:

1. ✅ **Enxerga e edita módulos/setores/espaços SOMENTE das Unidades A, B e C** — nunca consegue acessar ou
   modificar estrutura física de outro campus
2. ✅ **Não consegue criar/excluir Módulos, Setores ou Espaços** — "exclusivo de Institucional" está implementado e
   testado (P-22 define que essas ações permanecem exclusivas do super-role)
3. ✅ **Consegue editar APENAS o campo `label_gestor` de sua(s) Unidade(s)** — não consegue alterar `nome` ou
   `sigla` (D-8)
4. ✅ **É atribuído e removido de Unidades via endpoint dedicado** — sem manipulação de tabela ou chamadas SQL diretas
5. ✅ **As permissions foram concedidas ao role APÓS o scoping estar 100% testado** — nunca antes
6. ✅ **Toda deploy de código deste sprint passa em testes de autorização cross-campus** — 2+ campi, 2+ gestores,
   validando que escopo vaza zero

---

## Dependências

**Pré-requisito:** Sprint 0 (`sprint-00-preparacao`) deve estar merged. Particularmente, o bug **R-12**
(`Auth::user()->setor->unidade` com `setor_id` nulo) deve estar **corrigido neste sprint** (tarefa S1-BE-08
inclui a correção, conforme P-24) antes que as alterações nos mesmos 5 controllers de Sprint 0 causem regressão.

---

## Links de Referência

- [Visão geral e regras invioláveis](../../00-visao-geral/04-regras-invioaveis.md) — obrigatoriedade de `ShouldQueue` em
  notificações, tolerância zero a supressões de linter
- [Decisões consolidadas](../../00-visao-geral/03-decisoes-consolidadas.md) — P-05 a P-34 (todas as decisões de
  negócio que sustentam este sprint)
- [Matriz de permissions](../../03-arquitetura/03-matriz-de-permissions.md) — lista completa de permissions novas e
  distribuição por role
- [Auditoria de origem — Modelagem](../../02-fluxos-e-diagramas/04-modelo-de-dados.md) — schema exato de
  `unidade_gestores`, algoritmo de scoping
- [Auditoria de origem — Riscos](../../02-fluxos-e-diagramas/) — R-18 explicado em detalhe, estratégia de mitigação
