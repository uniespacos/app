# Fase 4: Formulários, Validação, Gráficos e Datas

> **Diretório:** `docs/update-uniespacos/fase-04-forms-dates-charts/`  
> **Objetivo:** Atualizar o ecossistema de formulários e validação (`react-hook-form@^7.86.0`, `@hookform/resolvers@^5.9.1`, `zod@^3.25.76`), gráficos de indicadores (`recharts@^3.10.1`), e manipulação de datas e calendário (`date-fns@^4.4.0`, `react-day-picker@^8.10.2`), garantindo zero regressão em regras de negócio e cálculos de reservas/agendas.  
> **Severidade Mitigada:** 🔴 Alta (Formulários críticos de criação de setores/cargos, agendamento de slots e relatórios gerenciais).  
> **Independência:** 100% autônoma. Não altera estruturas do banco de dados ou endpoints do backend.

---

## 📖 1. Norte de Estudo & Leitura Prévia Obrigatória

1. **React Hook Form & Zod Resolvers:**  
   [https://react-hook-form.com/docs/useform](https://react-hook-form.com/docs/useform)  
   *Compreenda como o `zodResolver` infere tipos estritos a partir do schema Zod sem necessidade de casting manual `as any`.*
2. **Date-fns v4 Upgrade Guide:**  
   [https://date-fns.org/v4.0.0/docs/Upgrade-Guide](https://date-fns.org/v4.0.0/docs/Upgrade-Guide)  
   *Note a padronização de export do locale para `date-fns/locale` e suporte ESM modular.*
3. **Recharts 3.x com React 19:**  
   [https://recharts.org/en-US/guide/getting-started](https://recharts.org/en-US/guide/getting-started)  
   *Entenda o funcionamento dos containers responsivos e renderização de `BarChart` / `PieChart`.*

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
- **Verificação:** Manter o bloco `"overrides"` em `package.json` para o `react-day-picker`:
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
  - `resources/js/hooks/use-slot-selection.ts`
  - `resources/js/lib/utils.ts`
  - `resources/js/presentation/molecules/AgendaNavegacao.tsx`
  - `resources/js/presentation/molecules/DatePicker.tsx`
  - `resources/js/presentation/organisms/AgendaDialogReserva.tsx`
- **Ação:** Substituir eventuais caminhos legados `from 'date-fns/locale/pt-BR'` pela forma canônica e unificada:
  ```ts
  import { ptBR } from 'date-fns/locale';
  ```

---

### 🔹 Tarefa T4.4: Atualizar `recharts` e Validar Gráficos
- **Arquivo Alvo:** `package.json`
- **Ação:** Atualizar `"recharts"` para `"^3.10.1"`.
- **Validação:** Confirmar que os 4 componentes de gráficos compilam sem erros de tipo:
  - `resources/js/presentation/organisms/GraficoIndicadoresConsolidados.tsx`
  - `resources/js/presentation/organisms/GraficoInventarioEspacos.tsx`
  - `resources/js/presentation/organisms/GraficoOcupacaoEspacos.tsx`
  - `resources/js/presentation/organisms/GraficoReservasPeriodo.tsx`

---

### 🔹 Tarefa T4.5: Validar Testes de Domínio de Datas e Slots de Reserva
- **Ação:** Executar a suíte de testes unitários que cobre toda a matemática e regras de agendamento:
  - `resources/js/hooks/use-agenda-navigation.test.ts`
  - `resources/js/hooks/use-agenda-selection.test.ts`
  - `resources/js/hooks/use-reservation-slots.test.ts`
  - `resources/js/hooks/use-slot-selection.test.ts`
  - `resources/js/lib/utils/derivar-slots-do-turno.test.ts`
  - `resources/js/lib/utils/reserva-helpers.test.ts`
- **Comando:** `npx jest --testPathPattern="(agenda|slot|reserva|turno)"`

---

## ⚠️ 3. O Que Pode Quebrar & Como Mitigar

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|---|---|---|---|
| Incompatibilidade de tipos no `zodResolver` | Baixa | Médio | `@hookform/resolvers@5.9.1` foi desenhado especificamente para paridade com Zod 3.25+. |
| Falha no cálculo de semanas/dias no `date-fns` v4 | Muito Baixa | Alto | A suíte de 6 arquivos de testes automatizados de datas e turnos cobre rigorosamente todas as funções utilizadas. |
| Gráficos do Recharts renderizarem em branco | Baixa | Médio | Com o alinhamento de `react-is@^19.2.8` realizado na Fase 1, o Recharts 3.10 renderiza normalmente sem falhas de `ResponsiveContainer`. |

---

## 🔄 4. Fluxos Alternativos & Troubleshooting

- **Problema:** Erro de tipo ao passar `resolver: zodResolver(schema)` no `useForm`.  
  **Solução:** Assegurar que os tipos inferidos do schema Zod correspondam à interface do formulário (`z.infer<typeof schema>`).
- **Problema:** O DatePicker exibe meses em inglês.  
  **Solução:** Confirmar que `locale={ptBR}` está passado para o componente `DayPicker` em `resources/js/components/ui/calendar.tsx`.

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

- [ ] `react-hook-form: ^7.86.0`, `@hookform/resolvers: ^5.9.1` e `zod: ^3.25.76` instalados.
- [ ] `date-fns: ^4.4.0` e `recharts: ^3.10.1` instalados.
- [ ] Imports de `ptBR` padronizados para `date-fns/locale`.
- [ ] 170 testes de frontend e 191 testes de backend passando com sucesso.

---

## 📄 7. Relatório de Implementação Obrigatório

Ao finalizar esta fase, crie o arquivo `RELATORIO_IMPLEMENTACAO.md` nesta pasta seguindo o modelo:

```markdown
# Relatório de Implementação — Fase 4: Formulários, Validação, Gráficos e Datas

- **Data de Conclusão:** AAAA-MM-DD
- **Executor:** [Nome do Desenvolvedor / Agente]
- **Status:** [Concluído / Parcial]

## Alterações Realizadas
- [x] T4.1: Atualizados react-hook-form, @hookform/resolvers e zod
- [x] T4.2: Atualizados date-fns e react-day-picker
- [x] T4.3: Padronizados imports de ptBR de date-fns/locale
- [x] T4.4: Atualizado recharts para 3.10.1 e validados componentes de gráficos
- [x] T4.5: Validados testes de agendamento e slots

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
1. Crie o arquivo `docs/update-uniespacos/fase-04-forms-dates-charts/RELATORIO_IMPLEMENTACAO.md`.
2. **Gere em sua resposta final o Pre-Prompt completo e estruturado para a Fase 5: Saneamento de ESLint Suppressions e Validação Global**, pronto para ser copiado em uma nova sessão.
