# Fase 4: Formulários, Validação, Gráficos e Datas

> **Diretório:** `docs/update-uniespacos/fase-04-forms-dates-charts/`  
> **Objetivo:** Atualizar o ecossistema de formulários e validação (`react-hook-form@^7.86.0`, `@hookform/resolvers@^5.9.1`, `zod@^3.25.76`), gráficos de indicadores (`recharts@^3.10.1`), e manipulação de datas e calendário (`date-fns@^4.4.0`, `react-day-picker@^8.10.2`), garantindo zero regressão em regras de negócio, formulários reativos e cálculos matemáticos de slots e agendas.  
> **Severidade Mitigada:** 🔴 Alta (Formulários de criação de setores/cargos, integridade de agendamento de slots e relatórios gerenciais).  
> **Independência:** 100% autônoma. Não altera estruturas do banco de dados ou endpoints do backend.

---

## 📖 1. Norte de Estudo & Leitura Prévia Obrigatória

1. **React Hook Form & Zod Resolvers:**  
   [https://react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform)  
   *Compreenda como o `zodResolver` infere tipos estritos a partir do schema Zod sem necessidade de casting manual `as any`.*
2. **Date-fns v4 Upgrade Guide:**  
   [https://date-fns.org/v4.0.0/docs/Upgrade-Guide](https://date-fns.org/v4.0.0/docs/Upgrade-Guide)  
   *Note a padronização oficial de export do locale para `date-fns/locale` e a arquitetura ESM modular.*
3. **Recharts 3.x com React 19 & ChartContainer:**  
   [https://recharts.org/en-US/guide/getting-started](https://recharts.org/en-US/guide/getting-started)  
   *Entenda o funcionamento do wrapper `ChartContainer` em `components/ui/chart.tsx` e renderização de `BarChart` / `PieChart`.*

---

## 🛠️ 2. Tarefas Atômicas Detalhadas

### 🔹 Tarefa T4.1: Atualizar Pacotes de Formulários e Validação
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências:
  - `"react-hook-form"`: `"^7.86.0"`
  - `"@hookform/resolvers"`: `"^5.9.1"`
  - `"zod"`: `"^3.25.76"`

---

### 🔹 Tarefa T4.2: Atualizar Pacotes de Data e Calendário
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar dependências:
  - `"date-fns"`: `"^4.4.0"`
  - `"react-day-picker"`: `"^8.10.2"`
- **Verificação Crítica:** Manter o bloco `"overrides"` em `package.json` para o `react-day-picker`:
  ```json
  "overrides": {
      "react-day-picker": {
          "react": "$react",
          "react-dom": "$react-dom"
      }
  }
  ```

---

### 🔹 Tarefa T4.3: Padronizar Imports do Locale `ptBR` do `date-fns`
- **Arquivos Alvo:**
  1. `resources/js/hooks/use-slot-selection.ts`
  2. `resources/js/lib/utils.ts`
  3. `resources/js/presentation/molecules/AgendaNavegacao.tsx`
  4. `resources/js/presentation/molecules/DatePicker.tsx`
  5. `resources/js/presentation/organisms/AgendaDialogReserva.tsx`
- **Ação:** Substituir quaisquer caminhos legados `from 'date-fns/locale/pt-BR'` pela forma canônica e unificada do date-fns v4:
  ```ts
  import { ptBR } from 'date-fns/locale';
  ```

---

### 🔹 Tarefa T4.4: Atualizar `recharts` e Validar Gráficos
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar `"recharts"` para `"^3.10.1"`.
- **Validação:** Confirmar que os 4 componentes de gráficos compilam e tipam perfeitamente com `ChartConfig`:
  - `resources/js/presentation/organisms/GraficoIndicadoresConsolidados.tsx`
  - `resources/js/presentation/organisms/GraficoInventarioEspacos.tsx`
  - `resources/js/presentation/organisms/GraficoOcupacaoEspacos.tsx`
  - `resources/js/presentation/organisms/GraficoReservasPeriodo.tsx`

---

### 🔹 Tarefa T4.5: Validar a Suíte Completa de Testes de Datas e Agendamentos
- **Ação:** Executar a bateria de testes unitários que cobre toda a matemática e regras de agendamento de horários:
  - `resources/js/hooks/use-agenda-navigation.test.ts`
  - `resources/js/hooks/use-agenda-selection.test.ts`
  - `resources/js/hooks/use-reservation-slots.test.ts`
  - `resources/js/hooks/use-slot-selection.test.ts`
  - `resources/js/lib/utils/derivar-slots-do-turno.test.ts`
  - `resources/js/lib/utils/reserva-helpers.test.ts`
- **Comando:** `npx jest --testPathPattern="(agenda|slot|reserva|turno)"`

---

## ⚠️ 3. O Que Pode Quebrar & Como Mitigar (Pontos Críticos & Armadilhas)

| Risco / Ponto Crítico | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|
| Incompatibilidade de tipos no `zodResolver` no `react-hook-form@7.86` | Baixa | Médio | `@hookform/resolvers@5.9.1` foi desenhado especificamente para paridade com Zod 3.25+. Os formulários que usam Zod (`RoleFormModal.tsx`, `SetorForm.tsx`) devem tipar o generic `useForm<FormValues>` alinhado com `z.infer<typeof schema>`. |
| Imports fragmentados de locale `pt-BR` no `date-fns` v4 | Média | Baixo | Usar estritamente `import { ptBR } from 'date-fns/locale'`. O date-fns v4 padronizou os locales sob o export raiz `date-fns/locale`. |
| Gráficos do Recharts não renderizarem em produção | Baixa | Alto | Com `react-is@^19.2.8` (atualizado na Fase 1) e `recharts@^3.10.1`, o `ResponsiveContainer` não sofre do bug de minificação de displayNames. |
| Testes de backend falharem por presença de `manifest.json` | Média | Baixo | Conforme a regra de armadilhas conhecidas (`GEMINI.md`), antes de rodar os testes de backend, execute `rm -rf public/build` para evitar a falha de envelope no `ErrorHandlingTest`. |
| Erro de tipos em `format(date, ...)` com strings ISO | Baixa | Médio | Sempre realizar o parsing de strings de data com `parseISO(dateString)` ou `new Date(dateString)` antes de passar ao `format()` do date-fns v4. |

---

## 🔄 4. Fluxos Alternativos & Troubleshooting

- **Problema:** O TypeScript reporta que `date-fns/locale/pt-BR` não foi encontrado.  
  **Solução:** Atualizar o import para `import { ptBR } from 'date-fns/locale'`.
- **Problema:** `npm install` reporta conflito de peer dependencies no `react-day-picker`.  
  **Solução:** Garantir que o bloco `"overrides"` no `package.json` contém `"react-day-picker": { "react": "$react", "react-dom": "$react-dom" }`.
- **Problema:** O DatePicker exibe meses ou dias em inglês.  
  **Solução:** Confirmar que `locale={ptBR}` é passado explicitamente para o componente `<DayPicker />` em `resources/js/components/ui/calendar.tsx`.

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

# 4. Limpar assets para ambiente de teste isolado e rodar testes do backend
rm -rf public/build && docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test

# 5. Verificação de Linter
npx eslint resources/js
```

---

## ✅ 6. Critérios de Aceite

- [ ] `react-hook-form: ^7.86.0`, `@hookform/resolvers: ^5.9.1` e `zod: ^3.25.76` instalados e sincronizados.
- [ ] `date-fns: ^4.4.0`, `react-day-picker: ^8.10.2` e `recharts: ^3.10.1` instalados.
- [ ] Todos os imports de locale `ptBR` padronizados para `date-fns/locale`.
- [ ] `npx tsc --noEmit` executando com zero erros.
- [ ] 170 testes de frontend e 192 testes de backend passando com sucesso.

---

## 📄 7. Relatório de Implementação Obrigatório

Ao finalizar esta fase, crie o arquivo `RELATORIO_IMPLEMENTACAO.md` nesta pasta seguindo o modelo:

```markdown
# Relatório de Implementação — Fase 4: Formulários, Validação, Gráficos e Datas

- **Data de Conclusão:** AAAA-MM-DD
- **Executor:** [Nome do Desenvolvedor / Agente]
- **Status:** Concluído

## Alterações Realizadas
- [x] T4.1: Atualizados react-hook-form, @hookform/resolvers e zod
- [x] T4.2: Atualizados date-fns e react-day-picker mantendo overrides
- [x] T4.3: Padronizados imports de ptBR de date-fns/locale
- [x] T4.4: Atualizado recharts para 3.10.1 e validados gráficos de indicadores
- [x] T4.5: Validados todos os testes de agendamento, slots e formulários

## Evidências de Testes
- `npx tsc --noEmit`: 0 erros
- `npm test`: 30 suites passadas, 170 testes passados
- `php artisan test`: 192 testes passados
- `npx eslint resources/js`: 0 erros

## Desvios ou Observações
[Registrar qualquer particularidade encontrada durante a execução]
```

---

## 🤖 8. Obrigação do Agente ao Concluir a Fase: Geração do Pre-Prompt da Próxima Fase

Ao terminar a execução e validar todos os testes:
1. Crie o arquivo `docs/update-uniespacos/fase-04-forms-dates-charts/RELATORIO_IMPLEMENTACAO.md`.
2. **Gere em sua resposta final o Pre-Prompt completo e estruturado para a Fase 5: Saneamento de ESLint Suppressions e Validação Global**, pronto para ser copiado em uma nova sessão.
