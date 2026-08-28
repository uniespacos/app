# Sprint 4 — Setor Expandido: Expediente e Coordenador

## Objetivo do Sprint

Expandir a entidade `Setor` com atributos operacionais — horário de funcionamento (com suporte a exceções) e designação de um coordenador responsável por manter essas informações — de forma que o fluxo de urgência (Sprint 5) possa validar automaticamente se o Gestor de Reserva está em expediente. **Este sprint prepara o dado; não implementa a aprovação de urgência.**

---

## O Que Esta Entrega Inclui

- ✅ Migrations: colunas de expediente em `setors` + tabela de exceções
- ✅ Models Eloquent com relações
- ✅ Serviço `ExpedienteService` com algoritmo de 3 estados
- ✅ Policy escopada de autorização para edição de expediente
- ✅ Endpoint e FormRequest estreitos (`PATCH /setores/{setor}/expediente`)
- ✅ Trilha de auditoria de alterações
- ✅ Validação de delimitação por campo (responsável nunca edita `unidade_id`, `nome`, `sigla`, `coordenador_id`)
- ✅ Extensão do dashboard do Gestor de Unidade com indicador de setores sem expediente
- ✅ Testes de integração cobrindo algoritmo, escopo e auditoria

---

## O Que Esta Entrega **Não** Inclui

- ❌ **`ReservaPolicy::avaliarComUrgencia()`** — implementado no Sprint 5
- ❌ **Bloqueio automático de urgência** baseado no estado do expediente — é camada da urgência, não deste sprint
- ❌ Aprovação de urgência em si (Fluxo A e B) — Sprint 5
- ❌ Refatoração retroativa de dashboards/telas que referem `Setor` — apenas adição de campos sem alterar carregamento global

---

## Definição de Versão Estável

Ao fim deste sprint, `develop` estará estável quando:

1. ✅ Nenhum usuário sem `coordenador_id` designado consegue editar expediente de setor alheio (validado por teste de autorização)
2. ✅ Toda alteração de expediente (via `PATCH /setores/{setor}/expediente`) é registrada com autor e valores anteriores
3. ✅ O responsável designado consegue editar **apenas** campos de expediente; qualquer tentativa de alterar `unidade_id`, `nome`, `sigla` ou `coordenador_id` é silenciosamente ignorada ou rejeitada com erro específico (validado por teste)
4. ✅ `ExpedienteService::estaEmExpediente()` retorna os 3 estados esperados (`true`/`false`/`null`) para os casos documentados (algoritmo testado)
5. ✅ Dashboard do Gestor de Unidade exibe contagem de setores sem expediente, fornecendo atalho para configuração
6. ✅ Nenhuma regressão nas telas existentes de administração (tsc, jest, testes backend 100% verdes)

---

## Dependências

- **Endurecimento obrigatório:** Sprint 1 — Gestor de Unidade (`gestor_unidade` role + tabela `unidade_gestores` + Policy escopada)
- **Referência de padrão:** `docs/REGRAS_INVIOLAVEIS_E_PADROES.md` §2.1–2.6 (delimitação por campo, trilha de auditoria)

---

## Links Críticos

- [Modelagem de dados e algoritmo de precedência](../../auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md) — seções 9.1 a 9.5 (schema exato, algoritmo `estaEmExpediente()`, delimitação de campos)
- [Matriz de riscos](../../auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md) — R-19, R-20, R-21, R-22, R-23 (transversalidade, expediente vazio, escalonamento, auditoria, premissa semântica)
- [Especificação de atores — Setor Expandido](../../auditoria-gestores-unidade-espaco/02-especificacao-novos-atores.md) — seção 5-B (fronteira conceitual, responsável designado, delimitação)
- [Regras invioláveis](../../00-visao-geral/04-regras-invioaveis.md) — regras 5 e 6 (delimitação por campo e trilha de auditoria)

---

## Anatomia de Task

Todas as tasks no backlog deste sprint seguem a estrutura padronizada em [README.md](../../README.md#41-anatomia-de-uma-task), §4.1, sem exceção.
