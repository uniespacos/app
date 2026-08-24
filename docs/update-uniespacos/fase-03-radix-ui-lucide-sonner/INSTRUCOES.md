# Fase 3: Primitivos Radix UI, Ícones Lucide e Notificações Sonner

> **Diretório:** `docs/update-uniespacos/fase-03-radix-ui-lucide-sonner/`  
> **Objetivo:** Atualizar todos os 20 pacotes primitivos do Radix UI para as versões com suporte pleno aos contratos de `ref` do React 19, elevar o `lucide-react` para a versão `1.34.0` (garantindo `aria-hidden` por padrão) e atualizar o sistema de toasts `sonner` (`2.0.8`).  
> **Severidade Mitigada:** 🟠 Média (Eliminação de conflitos de tipos em `ref` callbacks e melhoria de acessibilidade).  
> **Independência:** 100% autônoma. Não altera nenhuma regra de negócio.

---

## 📖 1. Norte de Estudo & Leitura Prévia Obrigatória

1. **Radix UI Primitives — React 19 Compatibility:**  
   [https://www.radix-ui.com/primitives/docs/overview/introduction](https://www.radix-ui.com/primitives/docs/overview/introduction)  
   *Compreenda como o Radix UI gerencia props polimórficas (`asChild` via `@radix-ui/react-slot`) e contratos de acessibilidade WAI-ARIA no React 19.*
2. **Lucide React v1 Migration Guide:**  
   [https://lucide.dev/guide/migration/migrate-from-v0](https://lucide.dev/guide/migration/migrate-from-v0)  
   *Note a remoção de ícones de marcas e o tratamento nativo de `aria-hidden="true"` para leitores de tela.*
3. **Sonner Toasts Specification:**  
   [https://sonner.emilkowal.ski/](https://sonner.emilkowal.ski/)  
   *Valide o posicionamento do `<Toaster />` e despacho de mensagens via `toast.success()` / `toast.error()`.*

---

## 🛠️ 2. Tarefas Atômicas Detalhadas

### 🔹 Tarefa T3.1: Atualizar Primitivos Radix de Overlays e Modais
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências:
  - `"@radix-ui/react-dialog"`: `"^1.1.23"`
  - `"@radix-ui/react-alert-dialog"`: `"^1.1.23"`
  - `"@radix-ui/react-popover"`: `"^1.1.23"`
  - `"@radix-ui/react-dropdown-menu"`: `"^2.1.24"`
  - `"@radix-ui/react-tooltip"`: `"1.2.16"`

---

### 🔹 Tarefa T3.2: Atualizar Primitivos Radix de Formulários e Seleção
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências:
  - `"@radix-ui/react-select"`: `"2.3.7"`
  - `"@radix-ui/react-checkbox"`: `"1.3.11"`
  - `"@radix-ui/react-radio-group"`: `"^1.4.7"`
  - `"@radix-ui/react-switch"`: `"^1.3.7"`
  - `"@radix-ui/react-label"`: `"^2.1.15"`

---

### 🔹 Tarefa T3.3: Atualizar Primitivos Radix de Layout, Navegação e Slots
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências:
  - `"@radix-ui/react-tabs"`: `"^1.1.21"`
  - `"@radix-ui/react-avatar"`: `"1.2.6"`
  - `"@radix-ui/react-scroll-area"`: `"^1.2.18"`
  - `"@radix-ui/react-separator"`: `"1.1.15"`
  - `"@radix-ui/react-slot"`: `"^1.3.3"`
  - `"@radix-ui/react-collapsible"`: `"1.1.20"`
  - `"@radix-ui/react-navigation-menu"`: `"1.2.22"`
  - `"@radix-ui/react-toggle"`: `"1.1.18"`
  - `"@radix-ui/react-toggle-group"`: `"1.1.19"`
  - `"@radix-ui/react-aspect-ratio"`: `"^1.1.15"`

---

### 🔹 Tarefa T3.4: Atualizar `lucide-react` e `sonner`
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências:
  - `"lucide-react"`: `"1.34.0"`
  - `"sonner"`: `"^2.0.8"`

---

### 🔹 Tarefa T3.5: Auditar Primitivos em `resources/js/components/ui/`
- **Arquivos Alvo:** `resources/js/components/ui/*.tsx`
- **Ação:** Confirmar que os wrappers de componentes (`dialog.tsx`, `select.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `avatar.tsx`, `badge.tsx`, etc.) compilam sem erros de tipo no `npx tsc --noEmit` e sem warnings de forwardRef depreciado.

---

## ⚠️ 3. O Que Pode Quebrar & Como Mitigar

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|
| Incompatibilidade com ícones Lucide removidos | Nula | Baixo | Foi verificado previamente que o UniEspaços possui **0 referências** a ícones de marcas removidos. |
| Erros de tipos em refs no Radix UI | Baixa | Médio | As versões atualizadas do Radix já utilizam o padrão moderno de refs do React 19. |
| Quebra nos testes de modais ou diálogos | Muito Baixa | Baixo | Executar `npm test` para validar todos os testes que renderizam diálogos (`ModalNovaInstituicao.test.tsx`, `ConfirmDeleteDialog.test.tsx`, etc.). |

---

## 🔄 4. Fluxos Alternativos & Troubleshooting

- **Problema:** O TypeScript aponta erro de tipo em `DialogOverlay` ou `DropdownMenuItem`.  
  **Solução:** Verificar se a prop está usando a tipagem `React.ComponentProps<typeof DialogPrimitive.Overlay>`.
- **Problema:** Toasts do Sonner não exibem ícones.  
  **Solução:** Confirmar que o `<Toaster richColors />` está montado no layout raiz (`app-layout.tsx`).

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

# 4. Suíte de testes de backend
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test

# 5. Verificação de Linter
npx eslint resources/js
```

---

## ✅ 6. Critérios de Aceite

- [ ] Todos os 20 pacotes `@radix-ui/react-*` atualizados no `package.json`.
- [ ] `lucide-react` atualizado para `1.34.0`.
- [ ] `sonner` atualizado para `2.0.8`.
- [ ] `npx tsc --noEmit` executando com zero erros.
- [ ] 170 testes de frontend e 191 testes de backend passando com sucesso.

---

## 📄 7. Relatório de Implementação Obrigatório

Ao finalizar esta fase, crie o arquivo `RELATORIO_IMPLEMENTACAO.md` nesta pasta seguindo o modelo:

```markdown
# Relatório de Implementação — Fase 3: Primitivos Radix UI, Ícones Lucide e Sonner

- **Data de Conclusão:** AAAA-MM-DD
- **Executor:** [Nome do Desenvolvedor / Agente]
- **Status:** [Concluído / Parcial]

## Alterações Realizadas
- [x] T3.1: Atualizados primitivos de overlays e modais Radix
- [x] T3.2: Atualizados primitivos de formulários Radix
- [x] T3.3: Atualizados primitivos de layout e slots Radix
- [x] T3.4: Atualizado lucide-react para 1.34.0 e sonner para 2.0.8
- [x] T3.5: Auditados componentes em resources/js/components/ui/

## Evidências de Testes
- `npx tsc --noEmit`: [Colar resumo]
- `npm test`: [Colar resumo: 30 suites, 170 passed]
- `php artisan test`: [Colar resumo: 191 passed]

## Desvios ou Observações
[Registrar qualquer particularidade encontrada durante a execução]
```

---

## 🤖 8. Obrigação do Agente ao Concluir a Fase: Geração do Pre-Prompt da Próxima Fase

Ao terminar a execução e validar todos os testes:
1. Crie o arquivo `docs/update-uniespacos/fase-03-radix-ui-lucide-sonner/RELATORIO_IMPLEMENTACAO.md`.
2. **Gere em sua resposta final o Pre-Prompt completo e estruturado para a Fase 4: Formulários, Validação, Gráficos e Datas**, pronto para ser copiado em uma nova sessão.
