# Problemas Identificados — Bugs e Dúvidas Bloqueantes

> **Este é um documento vivo.** Será preenchido durante a execução dos sprints conforme bugs pré-existentes forem descobertos e dúvidas de negócio travarem tasks.
> Leia [`./README.md`](./README.md) para entender o processo de registro.

---

## Propósito

Este documento coleta dois tipos de entraves encontrados durante a implementação:

1. **Bugs pré-existentes** descobertos enquanto se trabalha em código novo — problemas herdados de v1.x que só aparecem sob novas condições.
2. **Dúvidas de negócio bloqueantes** — questões não respondidas na auditoria que impedem a execução de uma task.

Ambos são registrados **no momento em que são identificados**, não no fim do sprint.

---

## Exemplo Ilustrativo — Remova ou Substitua pelo Primeiro Registro Real

### [2026-09-10] Migração de `tipo_vinculo` falha silenciosamente para usuários legados

- **Descoberto em:** S1-BE-04 (Criar e Vincular Gestor de Unidade)
- **Descrição:** A auditoria (03-modelagem-dados-vinculos-precedencia.md, §7.1) propôs `tipo_vinculo` com `DEFAULT 'externo'` conservador. Ao rodar a migration em produção, porém, 2.341 usuários legados ficam com a coluna `NULL` em vez de `'externo'`. Investigação: o seeder de testes popula antes da migration, causando o gap. A seed rodada em CI/CD não tem usuários reais — só aparece em ambiente produtivo.
- **Severidade:** Bloqueante — a autorização de urgência fica indeterminada para esses usuários.
- **Status:** Aberto
- **Resolução:** (Pendente)

---

## Formato de Entrada (Copie e Adapte)

```markdown
### [DATA] Título curto e descritivo

- **Descoberto em:** (S{n}-{trilha}-{nn} ou nome do sprint)
- **Descrição:** parágrafo com contexto, observações e impacto observado
- **Severidade:** bloqueante ou não-bloqueante
- **Status:** aberto / resolvido / aceito como está
- **Resolução:** (preenchida quando status = resolvido ou aceito como está)
```

---

## Registros Reais

(A ser preenchido durante a implementação.)
