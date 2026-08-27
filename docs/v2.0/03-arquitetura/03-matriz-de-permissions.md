# Matriz de Permissions × Roles — Referência Definitiva

## ⚠️ Alerta Crítico: Risco R-18 de Sequenciamento

> As rotas administrativas são liberadas por permission (`Route::middleware(['permission:secao.gestao-modulos'])`), e os controllers **não filtram por unidade** hoje. Conceder `secao.gestao-*` ao `gestor_unidade` **antes** de implementar o filtro de escopo faria com que ele enxergasse e editasse os **3 campi**. A Fase de roles/permissions **não pode** ser mergeada isoladamente — precisa entrar junto com (ou depois de) a Fase de Policies escopadas.

---

## 1. Permissions Existentes Que o Gestor de Unidade Passa a Receber

Como o Gestor de Unidade tem **CRUD completo** do seu campus, ele não precisa só de permissions novas — precisa das **já existentes**, com escopo aplicado na camada de Policy/Repository:

| Permission existente | `gestor_unidade` | Observação |
|---|:---:|---|
| `modulos.listar` / `.visualizar` / `.criar` / `.atualizar` / `.deletar` | ✅ escopado | Requer Policy `ModuloPolicy` aceitar escopo de `unidade_id` |
| `setores.listar` / `.visualizar` / `.criar` / `.atualizar` / `.deletar` | ✅ escopado | Idem |
| `espacos.listar` / `.visualizar` / `.criar` / `.atualizar` / `.deletar` | ✅ escopado | Idem |
| `espacos.alterar-gestores` | ✅ escopado | Atribuir Gestor de Reserva às agendas do campus |
| ~~`andares.criar` / `andares.atualizar`~~ | ❌ **removidas** | **P-32 (fechada): remover.** São permissions órfãs — existem no `PermissionSeeder` e têm rótulo em `permission-labels.ts`, mas nunca são verificadas no backend. Andar não tem ciclo de vida independente de Módulo (é governado por `ModuloPolicy` via transitividade), então permissions próprias são conceitualmente incorretas e induzem erro na tela de Roles |
| `secao.gestao-modulos` / `-setores` / `-espacos` | ✅ | **Necessárias para acessar as rotas** — ⚠️ ver alerta R-18 acima |
| `unidades.listar` / `.visualizar` | ✅ escopado | Para enxergar a própria Unidade |
| `unidades.criar` / `.deletar` | ❌ | Ato fundacional, exclusivo do Institucional |
| `unidades.atualizar` | ✅ escopado | **P-33 (fechada): pode.** Recomenda-se limitar ao campo `label_gestor` — nome/sigla do campus são identidade institucional e afetam relatórios históricos (ver D-8) |
| `setores.atualizar` (coordenador + expediente) | ✅ escopado | Novo uso: configurar `coordenador_id`, horários e exceções dos setores do campus |

---

## 2. Permissions Novas

| Permission nova | `institucional` | `gestor_unidade` | `gestor_espaco` | `gestor` | `comum` |
|---|:---:|:---:|:---:|:---:|:---:|
| `unidades.gerenciar-gestores` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `modulos.gerenciar-gestores-espaco` | ✅ | ✅ escopado | ❌ | ❌ | ❌ |
| `espacos.gerenciar-gestor-espaco-direto` | ✅ | ✅ escopado | ❌ | ❌ | ❌ |
| `espacos.visualizar-inventario-proprio` | ✅ | ✅ escopado | ✅ (só os seus) | ❌ | ❌ |
| `secao.dashboard-gestor-unidade` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `secao.dashboard-gestor-espaco` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `secao.gestao-orfaos-espaco` | ✅ (analítico) | ✅ (detalhado) | ❌ | ❌ | ❌ |
| `reservas.avaliar-urgencia` | ⚠️ ver nota | ❌ | ✅ | ❌ | ❌ |
| `chamados.triar` | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## 3. Nota Crítica: `reservas.avaliar-urgencia` e o RoleSeeder

O `RoleSeeder` concede ao `institucional` **todas** as permissions existentes, com exatamente duas exclusões:

```php
Permission::where('guard_name', 'web')
    ->where('name', '!=', 'reservas.deletar')
    ->where('name', '!=', 'reservas.atualizar')   // ← exclusão anterior
```

Ou seja, `reservas.avaliar-urgencia` seria **automaticamente concedida ao Institucional**, tornando-o capaz de aprovar reservas por urgência — o que contraria a separação de papéis que esta auditoria defende (o Institucional não deve avaliar reservas; ver `docs/authorization-policies.md`, histórico de 2026-08-23, quando `reservas.atualizar` foi deliberadamente revogada dele).

**Recomendação:** adicionar `reservas.avaliar-urgencia` à lista de exclusão do `RoleSeeder`, seguindo o precedente já estabelecido:

```php
Permission::where('guard_name', 'web')
    ->where('name', '!=', 'reservas.deletar')
    ->where('name', '!=', 'reservas.atualizar')
    ->where('name', '!=', 'reservas.avaliar-urgencia')   // ← P-34 (fechada)
```

Esta é uma mudança automática que deve ser executada quando a permission `reservas.avaliar-urgencia` for criada — não há intervenção manual posterior.

---

## 4. Distribuição para o Gestor de Espaço

| Permission | Observação |
|---|---|
| `espacos.listar` / `.visualizar` | Escopado aos seus espaços |
| `espacos.visualizar-inventario-proprio` | Inventário dos espaços sob sua responsabilidade |
| `reservas.avaliar-urgencia` | Aprovação de reservas em regime de urgência (exceção da regra geral) |
| `secao.dashboard-gestor-espaco` | Acesso ao painel do Gestor de Espaço |
| `relatorios.inventario-espacos` | Relatório escopado aos seus espaços |
| **Não recebe** `reservas.avaliar` | Não participa do fluxo normal de avaliação; a distinção entre as duas permissions é o que mantém os papéis separados |

---

## 5. Matriz Consolidada Final: Todas as Permissions × Todos os Atores

Esta tabela é a fonte de verdade única. Cada ✅ = irrestrito (exceto quando indicado "escopado"), ✅ escopado = restrito por Policy/Repository, ❌ = sem permissão.

| Permission | Comum | Gestor de Reserva | Gestor de Espaço | Gestor de Unidade | Institucional |
|---|:---:|:---:|:---:|:---:|:---:|
| **Usuários** |
| `usuarios.listar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.visualizar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.criar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.atualizar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.deletar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.gerenciar-permissoes` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.gerenciar-permissoes-diretas` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `usuarios.buscar-para-atendimento` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Espaços** |
| `espacos.listar` | ❌ | ❌ | ✅ escopado | ✅ escopado | ✅ |
| `espacos.visualizar` | ❌ | ❌ | ✅ escopado | ✅ escopado | ✅ |
| `espacos.criar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `espacos.atualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `espacos.deletar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `espacos.alterar-gestores` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `espacos.gerenciar-gestor-espaco-direto` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `espacos.visualizar-inventario-proprio` | ❌ | ❌ | ✅ escopado | ✅ escopado | ✅ |
| **Reservas** |
| `reservas.listar` | ✅ | ✅ | ✅ escopado | ✅ escopado | ✅ |
| `reservas.visualizar` | ✅ | ✅ | ✅ escopado | ✅ escopado | ✅ |
| `reservas.deletar` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `reservas.avaliar` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `reservas.avaliar-urgencia` | ❌ | ❌ | ✅ escopado | ❌ | ❌ |
| `reservas.atualizar` | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Roles** |
| `roles.listar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `roles.visualizar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `roles.criar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `roles.atualizar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `roles.deletar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `roles.gerenciar-permissoes` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Instituições** |
| `instituicoes.listar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `instituicoes.visualizar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `instituicoes.criar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `instituicoes.atualizar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `instituicoes.deletar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Unidades** |
| `unidades.listar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `unidades.visualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `unidades.criar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `unidades.atualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `unidades.deletar` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `unidades.gerenciar-gestores` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Módulos** |
| `modulos.listar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `modulos.visualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `modulos.criar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `modulos.atualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `modulos.deletar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `modulos.gerenciar-gestores-espaco` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| **Setores** |
| `setores.listar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `setores.visualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `setores.criar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `setores.atualizar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `setores.deletar` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| **Relatórios** |
| `relatorios.reservas-periodo` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `relatorios.ocupacao-espacos` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `relatorios.inventario-espacos` | ❌ | ❌ | ✅ escopado | ✅ escopado | ✅ |
| `relatorios.indicadores-consolidados` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Seções (UI Access Control)** |
| `secao.dashboard-institucional` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `secao.dashboard-gestor` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `secao.dashboard-gestor-unidade` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `secao.dashboard-gestor-espaco` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `secao.gestao-reservas` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `secao.gestao-espacos` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `secao.gestao-usuarios` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `secao.gestao-instituicoes` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `secao.gestao-unidades` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `secao.gestao-modulos` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `secao.gestao-setores` | ❌ | ❌ | ❌ | ✅ escopado | ✅ |
| `secao.gestao-orfaos-espaco` | ❌ | ❌ | ❌ | ✅ escopado | ✅ analítico |
| `secao.gestao-roles` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `secao.relatorios` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Sistema** |
| `sistema.telescope` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Chamados** |
| `chamados.triar` | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 6. Checklist de Sequenciamento Seguro

Siga esta sequência **como bloco atômico** (Sprint 1) para evitar exposição de escopo irrestrito:

- [ ] **Pré-requisito obrigatório:** Todas as 8 Policies (`UnidadePolicy`, `ModuloPolicy`, `SetorPolicy`, `EspacoPolicy`, `AndarPolicy`, etc.) já implementadas com filtro de `unidade_id` e `aplicarEscopo()` (ver documento 03, §5);
  - [ ] `UnidadePolicy::gerenciarGestores()` criada;
  - [ ] `ModuloPolicy::gerenciarGestoresEspaco()` criada;
  - [ ] `EspacoPolicy::gerenciarGestorEspacoDireto()` criada;
  - [ ] `ReservaPolicy::avaliarComUrgencia()` criada;
- [ ] **Pré-requisito obrigatório:** `RoleSeeder` atualizado com 3ª exclusão para `reservas.avaliar-urgencia` (P-34);
- [ ] **Pré-requisito obrigatório:** `HomeController` + `HomeService` refatorados para composição aditiva de blocos (documento 06, §0.4);
- [ ] **Pré-requisito obrigatório:** Todas as rotas administrativas (`/administrativo/*` após renomear, ou `/institucional/*` se mantendo) têm middleware de permission + Policy em cada método;
- [ ] Permissões novas criadas em `PermissionSeeder`:
  - [ ] `unidades.gerenciar-gestores`
  - [ ] `modulos.gerenciar-gestores-espaco`
  - [ ] `espacos.gerenciar-gestor-espaco-direto`
  - [ ] `espacos.visualizar-inventario-proprio`
  - [ ] `secao.dashboard-gestor-unidade`
  - [ ] `secao.dashboard-gestor-espaco`
  - [ ] `secao.gestao-orfaos-espaco`
  - [ ] `reservas.avaliar-urgencia`
  - [ ] `chamados.triar`
  - [ ] `usuarios.buscar-para-atendimento`
- [ ] Permissões órfãs removidas do `PermissionSeeder`:
  - [ ] `andares.criar`
  - [ ] `andares.atualizar`
- [ ] Role `gestor_unidade` atualizado com permissions de escopo aplicado (tabela §1);
- [ ] Role `gestor_espaco` atualizado com permissions (tabela §4);
- [ ] **Validação de escopo:** Executar teste de regressão onde um `gestor_unidade` NÃO consegue:
  - [ ] Listar módulos/setores/espaços de outro campus;
  - [ ] Editar módulos/setores/espaços de outro campus;
  - [ ] Atribuir gestores de espaço fora de seu campus;
- [ ] **Validação de Institucional:** Executar teste de regressão onde `institucional` **não** consegue:
  - [ ] Aprovar reservas por urgência (ter `reservas.avaliar-urgencia` = false);
  - [ ] Alterar expediente (setor está no escopo de Gestor de Unidade);
- [ ] **Validação de Separação de Papéis:** Um `gestor_espaco` **não** tem `reservas.avaliar`;
- [ ] **Validação de Composição de Dashboard:** Usuário com múltiplos papéis (ex.: `institucional` + `gestor_unidade`) vê todos os blocos correspondentes em `/dashboard` único;
- [ ] **Code Review:** Auditar que nenhum componente React faz `if (role === 'gestor_unidade')` — todos usam `<Can permission="...">` ou `useCan()`;

---

## 7. Referências Cruzadas

- **Alerta de Sequenciamento (R-18):** seção 2.1 deste documento e `docs/auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md`, §2.1
- **Decisões Fechadas:** P-05, P-06, P-10, P-12, P-13, P-23, P-27, P-28, P-29, P-32, P-33, P-34 (ver `docs/auditoria-gestores-unidade-espaco/`)
- **Separação de Papéis:** `docs/authorization-policies.md`
- **Roadmap de Execução:** `docs/v2.0/04-roadmap/README.md` (Sprint 1 é bloco atômico)
- **Backend Patterns:** `docs/repositories-pattern.md`
