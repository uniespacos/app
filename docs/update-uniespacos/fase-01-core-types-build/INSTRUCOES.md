# Fase 1: Core, Tipagens React 19 e Ferramental de Build / Lint

> **Diretório:** `docs/update-uniespacos/fase-01-core-types-build/`  
> **Objetivo:** Alinhar o pacote `react-is` com o runtime React 19 (`^19.2.8`), atualizar as ferramentas de compilação (Vite 6, Plugin React), suíte de testes unitários (Jest 30, TS-Jest 29, Testing Library 16), linter e formatador (TypeScript-ESLint 8.68+, Prettier), e purgar imports indevidos de pacotes.  
> **Severidade Mitigada:** 🟠 Média (Eliminação de falhas silenciosas de verificação de tipos e elementos no React 19).  
> **Independência:** 100% autônoma. Não altera nenhuma regra de negócio.

---

## 📖 1. Norte de Estudo & Leitura Prévia Obrigatória

1. **React 19 & `react-is` Compatibility:**  
   [https://github.com/facebook/react/tree/main/packages/react-is](https://github.com/facebook/react/tree/main/packages/react-is)  
   *Compreenda como incompatibilidades entre `react-is@18` e `react@19` quebram validações internas de `isElement` e `isValidElementType` em bibliotecas satélites.*
2. **TypeScript-ESLint v8 Strict Type-Checked:**  
   [https://typescript-eslint.io/getting-started/](https://typescript-eslint.io/getting-started/)  
   *Entenda o funcionamento das regras de tipagem estrita e como versões recentes refinam a inferência sem falsos positivos.*
3. **Vite 6 & `@vitejs/plugin-react`:**  
   [https://vite.dev/guide/migration.html](https://vite.dev/guide/migration.html)  
   *Valide o suporte a React 19 Fast Refresh e SSR no ecossistema Vite.*

---

## 🛠️ 2. Tarefas Atômicas Detalhadas

### 🔹 Tarefa T1.1: Atualizar `react-is` para Paridade com React 19
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar `"react-is"` de `"^18.3.1"` para `"^19.2.8"`.
- **Antes:**
  ```json
  "react-is": "^18.3.1",
  ```
- **Depois:**
  ```json
  "react-is": "^19.2.8",
  ```

---

### 🔹 Tarefa T1.2: Atualizar Ferramental de Build e Comunicação em Tempo Real
- **Arquivo Alvo:** `package.json`
- **Ação:** Elevar dependências de build e WebSocket para as versões estáveis mais recentes:
  - `"vite"`: `"^6.4.3"`
  - `"@vitejs/plugin-react"`: `"6.1.0"`
  - `"laravel-echo"`: `"^2.4.0"`
  - `"pusher-js"`: `"^8.6.0"`
  - `"concurrently"`: `"9.1.2"`
  - `"globals"`: `"16.0.0"`

---

### 🔹 Tarefa T1.3: Atualizar Linter e Formatador (ESLint 9 + Prettier)
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar `devDependencies` de análise estática:
  - `"typescript-eslint"`: `"8.68.0"`
  - `"eslint"`: `"^9.39.5"`
  - `"prettier"`: `"3.5.3"`
  - `"prettier-plugin-organize-imports"`: `"4.3.0"`
  - `"prettier-plugin-tailwindcss"`: `"0.8.1"`
  - `"eslint-config-prettier"`: `"10.1.2"`

---

### 🔹 Tarefa T1.4: Atualizar Ferramental de Testes (Jest & Testing Library)
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar ferramentas de testes para compatibilidade total com React 19:
  - `"@babel/core"`: `"^7.29.7"`
  - `"@babel/preset-env"`: `"^7.29.7"`
  - `"@babel/preset-typescript"`: `"^7.29.7"`
  - `"babel-jest"`: `"^30.4.1"`
  - `"jest"`: `"^30.4.2"`
  - `"jest-environment-jsdom"`: `"^30.4.1"`
  - `"ts-jest"`: `"^29.4.12"`

---

### 🔹 Tarefa T1.5: Purgar Import Indevido em `Dashboard.tsx`
- **Arquivo Alvo:** `resources/js/presentation/pages/Administrativo/Dashboard.tsx`
- **Ação:** Remover a linha 4 (`import { Button } from 'react-day-picker';`), que foi inserida por engano via auto-import e não é utilizada na página.

---

## ⚠️ 3. O Que Pode Quebrar & Como Mitigar

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|
| Incompatibilidade de tipos no `typescript-eslint` atualizado | Baixa | Médio | Rodar `npx tsc --noEmit` e `npx eslint resources/js`. O projeto já utiliza ESLint 9 Flat Config. |
| Quebra de testes de componentes React | Muito Baixa | Baixo | `@testing-library/react@^16.3.2` já suporta React 19. Executar `npm test` para validar todos os 170 testes. |
| Conflito de peer dependencies no `npm install` | Baixa | Médio | Executar `npm install` limpo. O bloco `"overrides"` no `package.json` garante resolução correta. |

---

## 🔄 4. Fluxos Alternativos & Troubleshooting

- **Problema:** `npm install` alerta sobre peer dependencies do Babel ou Jest.  
  **Solução:** Assegurar que `@babel/core`, `babel-jest` e `ts-jest` estejam sincronizados nas versões 7.29.x / 30.4.x / 29.4.x especificadas.
- **Problema:** O Vite passa a servir módulo vazio (`Element type is invalid`).  
  **Solução:** Executar `touch <arquivo_modificado>` para invalidar o cache de HMR do Vite.

---

## 🧪 5. Fluxo de Testes & Validação

Execute em sequência no terminal:
```bash
# 1. Instalar dependências atualizadas
npm install

# 2. Checagem estrita de tipos TypeScript (deve sair com código 0)
npx tsc --noEmit

# 3. Suíte de testes de frontend (todos os 170 testes devem passar)
npm test

# 4. Suíte de testes de backend (garantir zero regressão)
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test

# 5. Verificação de Linter
npx eslint resources/js
```

---

## ✅ 6. Critérios de Aceite

- [ ] `package.json` com `react-is: ^19.2.8`.
- [ ] `typescript-eslint` em `8.68.0` e ferramentas de teste atualizadas.
- [ ] `resources/js/presentation/pages/Administrativo/Dashboard.tsx` sem o import fantasma de `react-day-picker`.
- [ ] `npx tsc --noEmit` executando com zero erros.
- [ ] 170 testes de frontend e 191 testes de backend passando com sucesso.

---

## 📄 7. Relatório de Implementação Obrigatório

Ao finalizar esta fase, crie o arquivo `RELATORIO_IMPLEMENTACAO.md` nesta pasta seguindo o modelo:

```markdown
# Relatório de Implementação — Fase 1: Core, Tipagens React 19 e Build/Lint

- **Data de Conclusão:** AAAA-MM-DD
- **Executor:** [Nome do Desenvolvedor / Agente]
- **Status:** [Concluído / Parcial]

## Alterações Realizadas
- [x] T1.1: Atualizado react-is para ^19.2.8
- [x] T1.2: Atualizadas dependências de build (Vite 6, Plugin React, Pusher, Echo)
- [x] T1.3: Atualizado ESLint e Prettier
- [x] T1.4: Atualizadas ferramentas de teste Jest e Babel
- [x] T1.5: Purgado import morto em Dashboard.tsx

## Evidências de Testes
- `npx tsc --noEmit`: [Colar resumo]
- `npm test`: [Colar resumo: 30 suites, 170 passed]
- `php artisan test`: [Colar resumo: 191 passed]
- `npx eslint resources/js`: [Colar resumo]

## Desvios ou Observações
[Registrar qualquer particularidade encontrada durante a execução]
```

---

## 🤖 8. Obrigação do Agente ao Concluir a Fase: Geração do Pre-Prompt da Próxima Fase

Ao terminar a execução e validar todos os testes:
1. Crie o arquivo `docs/update-uniespacos/fase-01-core-types-build/RELATORIO_IMPLEMENTACAO.md`.
2. **Gere em sua resposta final o Pre-Prompt completo e estruturado para a Fase 2: Estilização Tailwind CSS v4 e Utilitários**, pronto para ser copiado em uma nova sessão.
