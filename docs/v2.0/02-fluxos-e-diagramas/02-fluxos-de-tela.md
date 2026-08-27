# 02 — Fluxos de Tela, Navegação por Ator e Componentes

## 1. Princípio Arquitetural: Composição por Permissão

A diretriz central desta auditoria substitui a multiplicação de páginas por role por **composição condicional dentro de uma única página**, decidida a partir das `permissions` do usuário autenticado (nunca do nome do role — mantém `REGRAS_INVIOLAVEIS_E_PADROES.md` §4.3).

### 1.1 Conceito

- **Uma página, múltiplos "blocos" condicionais.** A página não pergunta "que role é esse usuário?" — ela renderiza os blocos para os quais o usuário tem permissão, na ordem que fizer sentido, e simplesmente não renderiza os que ele não tem. Um Institucional pode ver **todos** os blocos ao mesmo tempo (é super-role); um Gestor de Espaço vê só o bloco dele.
- **O backend decide o escopo, o frontend decide a composição.** O endpoint já retorna os dados filtrados pelo escopo do usuário (padrão de segurança já estabelecido); o componente React só decide **quais blocos montar na tela**, nunca filtra dado sensível no cliente.
- **Reaproveitamento radical de componentes existentes.** Nenhum componente novo deve duplicar um já existente (`EspacoCard`, `DataTable`, `GestoresEspaco`) — deve compô-los.

### 1.2 Exemplo Concreto — Dashboard Único

**Antes (revisão anterior):** `DashboardGestorUnidadePage.tsx` + `DashboardGestorEspacoPage.tsx` como arquivos 100% separados.

**Depois (esta atualização):** uma única `Dashboard/DashboardPage.tsx` compõe organisms condicionais:

```tsx
// resources/js/presentation/pages/Dashboard/DashboardPage.tsx (conceito)
export default function DashboardPage() {
    return (
        <AppLayout>
            <Can permission="secao.dashboard-institucional">
                <WidgetVisaoMacroInstitucional />
            </Can>
            <Can permission="secao.dashboard-gestor-unidade">
                <WidgetPainelGestorUnidade />
            </Can>
            <Can permission="secao.dashboard-gestor-espaco">
                <WidgetEspacosSobResponsabilidade />
                <WidgetAprovacoesUrgenciaRecentes />
            </Can>
            <Can permission="secao.dashboard-gestor">
                <WidgetReservasParaAvaliar />
            </Can>
            <WidgetMinhasReservas /> {/* sempre visível — todo usuário autenticado tem reservas próprias */}
        </AppLayout>
    );
}
```

Um usuário que acumula `gestor_unidade` **e** `gestor_espaco` — caso explicitamente permitido — vê os dois blocos na mesma tela, sem duplicar navegação. Isso substitui as páginas separadas mantidas riscadas para rastreabilidade da mudança de decisão.

---

## 2. Mapa de Páginas

| Página | Rota | Compartilhada entre | Observação |
|---|---|---|---|
| ~~`Dashboard/DashboardGestorUnidadePage.tsx`~~ / ~~`DashboardGestorEspacoPage.tsx`~~ | — | — | **Descartadas nesta atualização** — substituídas por composição dentro de `Dashboard/DashboardPage.tsx` único (ver §1.2) |
| `Dashboard/DashboardPage.tsx` (evolução da página existente) | `/dashboard` | Comum, Gestor de Reserva, Gestor de Espaço, Gestor de Unidade, Institucional | Um único ponto de entrada; cada bloco condicional por `<Can permission="...">` |
| `Administrativo/Unidades/GestoresUnidade.tsx` (ou seção dentro de `EditarUnidade.tsx`) | — | Institucional | Reaproveita padrão de `Administrativo/Setores/UsuariosSetor.tsx` |
| `Administrativo/Modulos/*`, `Administrativo/Espacos/*`, `Administrativo/Setores/*` (existentes, **não duplicadas**) | `/administrativo/modulos`, etc. | Institucional **e** Gestor de Unidade | Mesma página, mesmo componente — o backend já retorna só os módulos/espaços do escopo do usuário (institucional vê tudo, gestor de unidade vê só sua Unidade). Nenhuma rota `/gestor-unidade/*` paralela é criada. |
| `Reservas/Gestor/*` (existentes, **estendida**) | `/gestor/reservas` | Gestor de Reserva **e** Gestor de Espaço (bloco de urgência, ver §1.2) | Seção adicional "Aprovação de Urgência", visível só com `reservas.avaliar-urgencia` |
| `Espacos/MeusEspacos.tsx` (novo, mas único — não um por role) | `/meus-espacos` | Gestor de Espaço (infraestrutura) **e** Gestor de Reserva (agenda) | Cada bloco mostra o vínculo relevante ao papel do usuário; reaproveita `EspacoCard` |
| `EspacosOrfaos.tsx` (lista detalhada) | `/espacos-orfaos` | **Apenas Gestor de Unidade** | `<DataTable>` acionável, escopado ao campus — P-10 |
| Bloco analítico de órfãos | dentro de `/dashboard` | **Apenas Institucional** | Contadores por campus, **não** lista — P-10 tornou estes dois casos genuinamente diferentes, não o mesmo componente com filtro |
| `Espacos/Reportar.tsx` (pública, NOVO) | `/reportar/{espaco:public_id}` | Qualquer visitante (sem login) | Fluxo de QR Code + tutorial assistido (documento 05, §9) |
| `auth/register` (existente, **estendida**) | `/register` | Visitante | Ganha campo `tipo_vinculo` (UC-23) |

**Princípio explícito:** nenhuma página nova nasce "por role" nesta auditoria — toda página nova ou estendida é avaliada primeiro quanto à possibilidade de compartilhamento (ver §1). Uma página só é exclusiva de um papel quando a ação em si é fisicamente exclusiva dele (ex.: a tela pública de report via QR Code não faz sentido ter bloco condicional, pois não exige login).

---

## 3. Navegação por Ator

A tabela abaixo cruza cada ator principal com as páginas do mapa acima que ele acessa, referenciando os casos de uso consolidados em `../01-casos-de-uso/README.md`:

### 3.1 Visitante

**Casos de Uso:** UC-01 (cadastro), UC-22 (report via QR Code, sem login)

| Página | Acesso | Observação |
|---|---|---|
| `auth/register` | ✅ Direto | Cadastro com `tipo_vinculo` |
| `Espacos/Reportar.tsx` | ✅ Direto | Fluxo de QR Code + tutorial assistido; sem autenticação |

### 3.2 Comum (Usuário Solicitante)

**Casos de Uso:** UC-01 (autenticação), UC-02 (consulta/favoritos), UC-03 (solicitação), UC-05 (edição/cancelamento)

| Página | Acesso | Observação |
|---|---|---|
| `Dashboard/DashboardPage.tsx` | ✅ (bloco `WidgetMinhasReservas`) | Vê apenas suas próprias reservas |
| Fluxo de reserva (existente) | ✅ | Consultar espaços, solicitar, editar, cancelar reserva |
| `Espacos/Reportar.tsx` | ✅ Com login | Report de problema após autenticação |

### 3.3 Gestor de Reserva

**Casos de Uso:** UC-06 (avaliar reservas, fluxo normal), UC-11 (relatórios, parcial), UC-19 (relatórios escopados, parcial)

| Página | Acesso | Observação |
|---|---|---|
| `Dashboard/DashboardPage.tsx` | ✅ (bloco `WidgetReservasParaAvaliar`) | Vê reservas pendentes de avaliação das agendas que gerencia |
| `Reservas/Gestor/*` | ✅ Direto | Avaliação de reservas do fluxo normal (UC-06) |
| Relatórios | ✅ Parcial | Acesso limitado; dados escopados à suas agendas |

### 3.4 Gestor de Espaço

**Casos de Uso:** UC-14 (atribuição de gestor de espaço, escopado), UC-17 (bloco de dashboard), UC-21-A (aprovação em regime de urgência), UC-21-B (criação assistida no balcão), UC-22 (triagem de report via QR Code)

| Página | Acesso | Observação |
|---|---|---|
| `Dashboard/DashboardPage.tsx` | ✅ Blocos `WidgetEspacosSobResponsabilidade` + `WidgetAprovacoesUrgenciaRecentes` | Painel dedicado do Gestor de Espaço; visão dos espaços sob sua responsabilidade |
| `Espacos/MeusEspacos.tsx` | ✅ Direto | Lista dos espaços que gerencia (infraestrutura); reaproveita `EspacoCard` |
| `Reservas/Gestor/*` (bloco urgência) | ✅ Seção adicional | Aprovação em regime de urgência (UC-21-A) — visível apenas com `reservas.avaliar-urgencia` |
| Fluxo de criação assistida no balcão | ✅ | Criação de reserva em nome de terceiro (UC-21-B) — acesso ao endpoint `POST /gestor-espaco/reservas` |
| `Espacos/Reportar.tsx` | ✅ Acesso à triagem | Recebe notificações de problems via report e pode triar chamados (UC-22) |

### 3.5 Gestor de Unidade

**Casos de Uso:** UC-08 (CRUD de estrutura física, operador principal), UC-09/UC-14 (atribuição de gestores, escopado), UC-15 (CRUD escopado), UC-15-B (bootstrap), UC-16 (bloco de dashboard), UC-18 (espaços órfãos, lista detalhada), UC-19 (relatórios escopados), UC-24 (designação e expediente de setor)

| Página | Acesso | Observação |
|---|---|---|
| `Dashboard/DashboardPage.tsx` | ✅ Bloco `WidgetPainelGestorUnidade` | Painel consolidado da Unidade; inclui indicador de setores sem expediente cadastrado (D-6) |
| `Administrativo/Modulos/*` | ✅ Escopado | CRUD completo dos módulos de sua Unidade; mesma página que o Institucional, mas dados escopados |
| `Administrativo/Setores/*` | ✅ Escopado | CRUD completo dos setores de sua Unidade; inclui designação de responsável e configuração de expediente (UC-24) |
| `Administrativo/Espacos/*` | ✅ Escopado | CRUD completo dos espaços de sua Unidade; pode atribuir Gestor de Espaço (UC-14) e Gestor de Reserva (UC-09) |
| `EspacosOrfaos.tsx` | ✅ Lista detalhada | Visualiza espaços órfãos de Gestor de Espaço apenas de seu campus (UC-18); `<DataTable>` acionável |
| Relatórios | ✅ Escopado | Acesso a relatórios dos dados de sua Unidade (UC-19) |

### 3.6 Institucional

**Casos de Uso:** UC-08 (CRUD estrutura, bootstrap/exceção), UC-10 (gestão de usuários/papéis), UC-13 (atribuição de Gestor de Unidade), UC-15-B (bootstrap de unidade), UC-18 (órfãos, indicador analítico), UC-20 (BI macro entre campi)

| Página | Acesso | Observação |
|---|---|---|
| `Dashboard/DashboardPage.tsx` | ✅ Todos os blocos | BI macro consolidado entre campi; vê indicador analítico de órfãos, macro de gestores, etc. |
| `Administrativo/Unidades/*` | ✅ Direto | Gestão global de Unidades; atribuição de Gestor de Unidade (UC-13); bootstrap de Unidade recém-criada (UC-15-B) |
| `Administrativo/Modulos/*` | ✅ Global | CRUD global de módulos; pode bootstrap estrutura física de qualquer campus (UC-08, exceção) |
| `Administrativo/Setores/*` | ✅ Global | CRUD global de setores; gestão global de expediente (UC-24) |
| `Administrativo/Espacos/*` | ✅ Global | CRUD global de espaços; atribuição global de gestores (UC-09, UC-14) |
| `Administrativo/Usuarios/*` | ✅ Global | Gestão de usuários, papéis e permissões (UC-10) |
| Bloco analítico de órfãos | ✅ Dentro de `/dashboard` | Contadores de órfãos por campus (UC-18); visão macro consolidada (UC-20) |
| Relatórios | ✅ Global | Acesso a todos os relatórios; visão macro entre campi (UC-11, UC-19, UC-20) |

---

## 4. Componentes Novos/Alterados

| Componente | Ação |
|---|---|
| `organisms/GestoresEspaco.tsx` (já existe, hoje só lista gestores de Agenda) | **Renomear internamente** o conceito de "Gestor" para "Gestor de Reserva" nos rótulos; criar componente irmão `organisms/GestoresEspacoInfraestrutura.tsx` para o novo vínculo (evitar sobrecarregar o componente existente com 2 conceitos) |
| `organisms/GestoresUnidade.tsx` (novo) | Seletor multi-usuário para vincular Gestores de Unidade a uma Unidade — reaproveita padrão de `UsuariosSetor.tsx` |
| `molecules/EspacoGestorEspacoBadge.tsx` (novo, pequeno) | Badge na ficha do espaço indicando "Gerenciado por: {nome}" com indicação visual se é override ou herdado do módulo (ex.: ícone diferente) |
| `atoms/OrigemVinculoBadge.tsx` (novo, pequeno) | "Padrão do Módulo" vs. "Atribuição Direta" — reutilizável em qualquer tela que precise indicar a origem da atribuição (evita confusão de UX quando um espaço tem override) |
| `organisms/WidgetAprovacaoUrgencia.tsx` (NOVO) | Bloco condicional (`reservas.avaliar-urgencia`) na página de Reservas do Gestor (§1.2): lista horários livres do dia nos espaços que o Gestor de Espaço gerencia, com seletor de `CategoriaSolicitanteEnum` e botão de aprovação |
| `atoms/OrigemAvaliacaoBadge.tsx` (NOVO) | "Aprovado em regime de urgência" — exibido no card/detalhe de reserva sempre que `Horario.origem_avaliacao !== 'fluxo_normal'`, para transparência ao solicitante e ao Gestor de Reserva titular |
| `molecules/TutorialChamadoViewer.tsx` (NOVO) | Exibe o conteúdo de `TipoChamado.tutorial` na rota pública de report, com CTA "Resolveu?" antes de liberar o formulário de chamado formal |
| `organisms/WidgetEspacosSobResponsabilidade.tsx` (NOVO) | Bloco do dashboard composto do Gestor de Espaço (§1.2) — substitui o que seria o corpo de uma `DashboardGestorEspacoPage` inteira |
| `organisms/WidgetPainelGestorUnidade.tsx` (NOVO) | Bloco do dashboard composto do Gestor de Unidade (§1.2) — substitui o que seria o corpo de uma `DashboardGestorUnidadePage` inteira. **Inclui o indicador de setores sem expediente cadastrado** (D-6), tornando o preenchimento gradual visível sem ser bloqueante |
| `organisms/SetorExpedienteForm.tsx` (NOVO) | Edição de horário, dias de funcionamento e exceções por intervalo. Visível ao Institucional, Gestor de Unidade e ao responsável designado daquele setor |
| `atoms/AvisoExpedienteIndeterminado.tsx` (NOVO, pequeno) | Aviso exibido no fluxo de urgência quando `estaEmExpediente()` retorna `null` — comunica que a validação não pôde ser feita, sem bloquear (D-2) |

---

## 5. Rotas

### 5.1 Referência Geral

A diretriz de composição por permissão remove a necessidade de prefixos de rota por role para dashboards — `/dashboard` é única. Rotas específicas por role só existem quando a **ação** é exclusiva daquele papel (ex.: aprovação de urgência é fisicamente só do Gestor de Espaço).

### 5.2 Exemplo de Middleware de Permission

```php
// routes/web.php

// Dashboard único — cada Controller/Service internamente decide quais blocos de dado retornar,
// baseado nas permissions do usuário autenticado (ver documento 03 §5, aplicarEscopo)
Route::middleware(['auth', 'verified'])->get('/dashboard', [HomeController::class, 'index'])->name('dashboard');

// Rota de aprovação de urgência — exclusiva do Gestor de Espaço
Route::middleware(['auth', 'verified', 'permission:reservas.avaliar-urgencia'])
    ->prefix('gestor-espaco')
    ->name('gestor-espaco.')
    ->group(function () {
        Route::patch('/reservas-urgentes/{horario}', [GestorEspacoReservaUrgenteController::class, 'aprovar'])
            ->name('reservas-urgentes.aprovar');
    });

// Rota pública de report — sem middleware de autenticação
Route::get('/reportar/{espaco:public_id}', [ChamadoPublicoController::class, 'create'])->name('chamados.reportar');
Route::post('/reportar/{espaco:public_id}', [ChamadoPublicoController::class, 'store']);
```

### 5.3 Observação sobre Prefixo `/institucional/*` (P-29)

As rotas administrativas hoje usam prefixo `/institucional/` combinado com gate de permission. Assim que o `gestor_unidade` receber `secao.gestao-modulos`, ele passará a operar em URLs `/institucional/modulos/...` — sendo que ele não é institucional.

A recomendação é renomear para `/administrativo/` (alinha com a estrutura de arquivos do frontend `resources/js/presentation/pages/Administrativo/`) em mudança atômica posterior, na **Fase 11**, que não bloqueia as fases centrais.

---

## Referências

- **Documento 03** — Padrões Técnicos, Contratos e Rotas (escopo de aplicarEscopo, permissions, rotas administrativas)
- **Documento 05** — Fluxo de Urgência (QR Code, tutorial, chamados)
- **`../01-casos-de-uso/README.md`** — Índice consolidado de casos de uso com matriz de atores
- **`REGRAS_INVIOLAVEIS_E_PADROES.md` §4.3** — Proibição de condicionais por role; obrigatoriedade de `<Can permission="...">`
