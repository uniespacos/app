# Fase 2: Estilização Tailwind CSS v4 e Utilitários

> **Diretório:** `docs/update-uniespacos/fase-02-tailwind-styling/`  
> **Objetivo:** Elevar o compilador Tailwind CSS v4 (`4.3.3`), o plugin `@tailwindcss/vite`, o motor nativo Oxide/LightningCSS e o utilitário `tailwind-merge` (`3.6.0`), assegurando resolução semântica perfeita de classes dinâmicas geradas a partir do `@theme` nativo do CSS.  
> **Severidade Mitigada:** 🟡 Baixa (Prevenção de conflitos de precedência em classes CSS utilitárias).  
> **Independência:** 100% autônoma. Não altera estruturas de dados ou lógica de negócio.

---

## 📖 1. Norte de Estudo & Leitura Prévia Obrigatória

1. **Tailwind CSS v4 Upgrade Guide & `@theme`:**  
   [https://tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)  
   *Compreenda como o Tailwind v4 resolve variáveis CSS nativas e como o plugin Vite compila o `@import "tailwindcss";`.*
2. **`tailwind-merge` v3.6 com Suporte ao Tailwind v4:**  
   [https://github.com/dcastilho/tailwind-merge](https://github.com/dcastilho/tailwind-merge)  
   *Entenda como a versão 3.6 do `tailwind-merge` mapeia conflitos de classes atômicas do Tailwind v4 (ex: `bg-primary` vs `bg-destructive`).*

---

## 🛠️ 2. Tarefas Atômicas Detalhadas

### 🔹 Tarefa T2.1: Atualizar Tailwind CSS e Plugin Vite
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências de compilação CSS:
  - `"tailwindcss"`: `"4.3.3"`
  - `"@tailwindcss/vite"`: `"4.3.3"`

---

### 🔹 Tarefa T2.2: Atualizar Binários Nativos Opcionais do Compilador
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar `optionalDependencies` para o motor de compilação de alta performance do Tailwind v4:
  ```json
  "optionalDependencies": {
      "@rollup/rollup-linux-x64-gnu": "4.62.5",
      "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
      "lightningcss-linux-x64-gnu": "1.33.0"
  }
  ```

---

### 🔹 Tarefa T2.3: Atualizar `tailwind-merge` para v3.6.0
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar `"tailwind-merge"` de `"3.2.0"` para `"3.6.0"`.

---

### 🔹 Tarefa T2.4: Validar Helper Universal `cn(...)`
- **Arquivo Alvo:** `resources/js/lib/utils.ts`
- **Ação:** Verificar o helper `cn`:
  ```ts
  import { type ClassValue, clsx } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  ```
- **Validação:** Garantir que todas as chamadas `cn()` em componentes Shadcn continuam mesclando classes utilitárias e sobrescritas de `className` sem degradação visual.

---

### 🔹 Tarefa T2.5: Validar Compilação de Produção dos Assets
- **Ação:** Executar `npm run build` para garantir que o Vite e o `@tailwindcss/vite` processam `resources/css/app.css` e geram os bundles em `public/build/` sem advertências de sintaxe ou diretivas desconhecidas.

---

## ⚠️ 3. O Que Pode Quebrar & Como Mitigar

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|
| Incompatibilidade de classes personalizadas no `twMerge` | Baixa | Baixo | `tailwind-merge@3.6.0` possui suporte nativo à gramática de classes do Tailwind v4. |
| Falha de compilação do LightningCSS em containers Docker | Muito Baixa | Baixo | `lightningcss` e `oxide` estão fixados em arquitetura `linux-x64-gnu`. |

---

## 🔄 4. Fluxos Alternativos & Troubleshooting

- **Problema:** O Vite apresenta erro de compilação CSS após o upgrade.  
  **Solução:** Limpar a pasta `public/build` com `rm -rf public/build` e reexecutar `npm run build`.
- **Problema:** Cache do Vite no browser com estilos desatualizados.  
  **Solução:** Rodar `npm run dev` com hard refresh (`Ctrl + Shift + R`).

---

## 🧪 5. Fluxo de Testes & Validação

Execute em sequência no terminal:
```bash
# 1. Instalar dependências atualizadas
npm install

# 2. Compilar assets de produção (deve concluir com código 0)
npm run build

# 3. Checagem estrita de tipos TypeScript
npx tsc --noEmit

# 4. Suíte de testes de frontend
npm test

# 5. Suíte de testes de backend
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test
```

---

## ✅ 6. Critérios de Aceite

- [ ] `tailwindcss` e `@tailwindcss/vite` atualizados para `4.3.3`.
- [ ] `tailwind-merge` atualizado para `3.6.0`.
- [ ] `npm run build` gerando os bundles sem erros de CSS.
- [ ] 170 testes de frontend e 191 testes de backend passando com sucesso.

---

## 📄 7. Relatório de Implementação Obrigatório

Ao finalizar esta fase, crie o arquivo `RELATORIO_IMPLEMENTACAO.md` nesta pasta seguindo o modelo:

```markdown
# Relatório de Implementação — Fase 2: Estilização Tailwind CSS v4 e Utilitários

- **Data de Conclusão:** AAAA-MM-DD
- **Executor:** [Nome do Desenvolvedor / Agente]
- **Status:** [Concluído / Parcial]

## Alterações Realizadas
- [x] T2.1: Atualizado tailwindcss e @tailwindcss/vite para 4.3.3
- [x] T2.2: Atualizadas optionalDependencies nativas (oxide, lightningcss, rollup)
- [x] T2.3: Atualizado tailwind-merge para 3.6.0
- [x] T2.4: Validado helper cn() em lib/utils.ts
- [x] T2.5: Validada compilação de produção com npm run build

## Evidências de Testes
- `npm run build`: [Colar resumo da compilação]
- `npx tsc --noEmit`: [Colar resumo]
- `npm test`: [Colar resumo: 30 suites, 170 passed]
- `php artisan test`: [Colar resumo: 191 passed]

## Desvios ou Observações
[Registrar qualquer particularidade encontrada durante a execução]
```

---

## 🤖 8. Obrigação do Agente ao Concluir a Fase: Geração do Pre-Prompt da Próxima Fase

Ao terminar a execução e validar todos os testes:
1. Crie o arquivo `docs/update-uniespacos/fase-02-tailwind-styling/RELATORIO_IMPLEMENTACAO.md`.
2. **Gere em sua resposta final o Pre-Prompt completo e estruturado para a Fase 3: Primitivos Radix UI, Ícones Lucide e Sonner**, pronto para ser copiado em uma nova sessão.
