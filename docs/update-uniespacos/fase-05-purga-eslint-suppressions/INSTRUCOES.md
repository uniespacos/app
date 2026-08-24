# Fase 5: Saneamento de ESLint Suppressions e Validação Global

> **Diretório:** `docs/update-uniespacos/fase-05-purga-eslint-suppressions/`  
> **Objetivo:** Auditar, recalcular e purgar o arquivo `eslint-suppressions.json`, aproveitando as tipagens TypeScript aprimoradas de todo o ecossistema atualizado (React 19, Radix UI, TypeScript-ESLint 8.68+, Zod e React Hook Form), garantindo zero dívida técnica oculta, conformidade total de linter e validação de ponta a ponta dos builds cliente e SSR.  
> **Severidade Mitigada:** 🟡 Baixa / Qualidade de Código (Redução drástica de regras de tipagem suprimidas).  
> **Independência:** 100% autônoma. Não altera nenhuma regra de negócio.

---

## 📖 1. Norte de Estudo & Leitura Prévia Obrigatória

1. **ESLint v9 Flat Config com TypeScript-ESLint:**  
   [https://eslint.org/docs/latest/use/configure/configuration-files](https://eslint.org/docs/latest/use/configure/configuration-files)  
   *Compreenda como o `eslint.config.js` executa a análise com `project: true` para tipos em tempo real.*
2. **Convenções de Código Limpo — UniEspaços:**  
   Arquivo `.agents/plugins/uniespacos/skills/frontend-conventions/SKILL.md`  
   *Regra de ouro: código novo ou tocado não deve adicionar suppressions; se o linter apontar erro em código ajustado, deve ser corrigido com tipagem precisa.*

---

## 🛠️ 2. Tarefas Atômicas Detalhadas

### 🔹 Tarefa T5.1: Auditoria Completa do `eslint-suppressions.json`
- **Arquivo Alvo:** `eslint-suppressions.json`
- **Ação:** Executar varredura do linter para identificar quais arquivos em `resources/js/` agora passam limpos sem necessidade de suppression graças à modernização dos pacotes:
  ```bash
  npx eslint resources/js
  ```

---

### 🔹 Tarefa T5.2: Purga e Redução de Entradas no `eslint-suppressions.json`
- **Arquivo Alvo:** `eslint-suppressions.json`
- **Ação:** Remover entradas obsoletas de arquivos onde os tipos agora são 100% inferidos corretamente (ex: `resources/js/components/ui/chart.tsx`, `resources/js/components/ui/form.tsx`, `resources/js/components/ui/sidebar.tsx`, etc.).

---

### 🔹 Tarefa T5.3: Validação de Formatação e Estilo de Código
- **Ação:** Executar a checagem do Prettier com os plugins atualizados de Tailwind e import sorting:
  ```bash
  npm run format:check
  ```
- **Caso haja arquivos desalinhados:** Executar `npm run format`.

---

### 🔹 Tarefa T5.4: Validação de Build Completo (Client & SSR)
- **Ação:** Executar a compilação de produção para o client e para SSR (Server-Side Rendering do Inertia):
  ```bash
  npm run build
  npm run build:ssr
  ```

---

### 🔹 Tarefa T5.5: Execução da Suíte Completa de Testes de Regressão
- **Ação:** Rodar toda a bateria de testes automatizados do frontend e do backend Laravel:
  ```bash
  # Checagem de tipos
  npx tsc --noEmit

  # 170 testes de frontend
  npm test

  # 191 testes de backend em ambiente isolado
  docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test
  ```

---

## ⚠️ 3. O Que Pode Quebrar & Como Mitigar

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|
| Quebra no build de SSR | Baixa | Médio | Executar `npm run build:ssr` para validar se nenhum módulo tenta acessar `window` indevidamente no servidor. |
| Inconsistência de lint em novos arquivos | Baixa | Baixo | Corrigir declarações de tipos estritos diretamente nas interfaces em vez de mascarar com `any`. |

---

## 🔄 4. Fluxos Alternativos & Troubleshooting

- **Problema:** `npm run build:ssr` falha acusando objeto global não definido.  
  **Solução:** Garantir que acessos a APIs do navegador (`localStorage`, `window.matchMedia`) em hooks estejam encapsulados dentro de `useEffect` ou checagens `typeof window !== 'undefined'`.
- **Problema:** O ESLint reporta erro em linha específica após remover a suppression.  
  **Solução:** Aplicar narrowing de tipos adequado com TypeScript (ex: checagem `if (typeof x === 'string')` ou asserção segura).

---

## 🧪 5. Fluxo de Testes & Validação Final

Execute em sequência no terminal:
```bash
# 1. Checagem estrita de tipos TypeScript (deve sair com código 0)
npx tsc --noEmit

# 2. Verificação de Linter
npx eslint resources/js

# 3. Verificação de Formatação
npm run format:check

# 4. Build de Produção e SSR
npm run build && npm run build:ssr

# 5. Suíte de testes de frontend (todos os 170 testes devem passar)
npm test

# 6. Suíte de testes de backend (todos os 191 testes devem passar)
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test
```

---

## ✅ 6. Critérios de Aceite

- [ ] `eslint-suppressions.json` auditado e purgado ao mínimo absoluto.
- [ ] `npx eslint resources/js` executando sem nenhum erro ou aviso bloqueante.
- [ ] `npm run build` e `npm run build:ssr` concluídos com sucesso.
- [ ] 170 testes de frontend e 191 testes de backend passando sem regressão.

---

## 📄 7. Relatório de Implementação Obrigatório (Conclusão do Plano)

Ao finalizar esta fase, crie o arquivo `RELATORIO_IMPLEMENTACAO.md` nesta pasta:

```markdown
# Relatório de Implementação — Fase 5: Saneamento de ESLint Suppressions e Validação Global

- **Data de Conclusão:** AAAA-MM-DD
- **Executor:** [Nome do Desenvolvedor / Agente]
- **Status:** Concluído com Sucesso

## Alterações Realizadas
- [x] T5.1: Auditoria completa de eslint-suppressions.json
- [x] T5.2: Purga de regras obsoletas de suppressions
- [x] T5.3: Formatação checada com Prettier
- [x] T5.4: Builds de produção (Client + SSR) validados
- [x] T5.5: Bateria completa de testes executada

## Evidências Finais
- `npx tsc --noEmit`: 0 erros
- `npx eslint resources/js`: 0 erros
- `npm test`: 30 suites, 170 passed
- `php artisan test`: 191 passed
- `npm run build && npm run build:ssr`: Concluídos com sucesso

## Conclusão da Atualização
O ecossistema frontend do UniEspaços está 100% atualizado nas versões mais recentes estáveis do ecossistema React 19, Tailwind CSS v4 e Inertia 2, com total conformidade de tipos e zero regressões.
```
