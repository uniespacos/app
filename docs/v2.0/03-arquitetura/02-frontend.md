# 02 — Arquitetura Frontend da v2.0

## Princípio Arquitetural: Composição por Permissão, Não por Role

### Pilar Central: Composição por Blocos Condicionais

O frontend da v2.0 **abandona a multiplicação de páginas por role** em favor de um modelo único de composição. Uma página não pergunta "que role é esse usuário?" — ela renderiza os blocos para os quais o usuário tem permissão, na ordem que fizer sentido, e simplesmente não renderiza os que ele não tem.

**Características principais:**

- **Uma página, múltiplos blocos condicionais:** Um Institucional vê **todos** os blocos ao mesmo tempo (é super-role); um Gestor de Espaço vê só o bloco dele.
- **O backend decide o escopo, o frontend decide a composição:** O endpoint já retorna os dados filtrados pelo escopo do usuário (padrão de segurança estabelecido); o componente React só decide **quais blocos montar na tela**, nunca filtra dado sensível no cliente.
- **Reaproveitamento radical de componentes existentes:** Nenhum componente novo duplica um já existente (`EspacoCard`, `DataTable`, `GestoresEspaco`) — deve compô-los.

### Regra Inviolável §4.3 — Nunca Verificar Role Diretamente

A regra central do projeto — em vigor desde a auditoria gestores-unidade-espaço — é **obrigatória**:

```typescript
// ❌ PROIBIDO
if (user.role === 'gestor_espaco') {
    // renderizar algo
}

// ✅ OBRIGATÓRIO
<Can permission="secao.dashboard-gestor-espaco">
    <WidgetEspacosSobResponsabilidade />
</Can>
```

Toda decisão de composição no frontend passa por `<Can permission="...">` ou pelo hook `useCan()`. Isso é um gatilho automatizado de code review e deve ser auditado em cada PR de execução.

---

## Contratos SSOT Novos

Seguindo a regra inviolável §4.2 (toda máquina de estado/enum de negócio vive em `resources/js/contracts/`), três contratos canônicos nascem ou são expandidos na v2.0:

### `resources/js/contracts/roles.contract.ts` — Expansão

```typescript
// resources/js/contracts/roles.contract.ts
export const SystemRole = {
    INSTITUCIONAL: 'institucional',
    GESTOR: 'gestor',                 // rótulo de exibição passa a ser "Gestor de Reserva"
    GESTOR_ESPACO: 'gestor_espaco',   // NOVO
    GESTOR_UNIDADE: 'gestor_unidade', // NOVO
    COMUM: 'comum',
} as const;

export const ROLES_VALIDAS: readonly RoleType[] = [
    SystemRole.INSTITUCIONAL,
    SystemRole.GESTOR,
    SystemRole.GESTOR_ESPACO,
    SystemRole.GESTOR_UNIDADE,
    SystemRole.COMUM,
] as const;
```

### `resources/js/contracts/tipo-vinculo.contract.ts` — NOVO

Taxonomia de vínculo institucional do usuário com a UESB, capturado no cadastro:

```typescript
// resources/js/contracts/tipo-vinculo.contract.ts (NOVO)
export const TipoVinculo = {
    ESTUDANTE: 'estudante',
    PROFESSOR: 'professor',
    TECNICO_ADMINISTRATIVO: 'tecnico_administrativo',
    EXTERNO: 'externo',
} as const;

export type TipoVinculoType = typeof TipoVinculo[keyof typeof TipoVinculo];
```

**Observação:** Default para a base legada é `externo` (P-27), e o campo é obrigatório na extensão de `StoreRegisterRequest` (UC-23).

### `resources/js/contracts/origem-avaliacao.contract.ts` — NOVO

Rastreabilidade de por que um horário foi aprovado — fluxo normal ou regime de urgência:

```typescript
// resources/js/contracts/origem-avaliacao.contract.ts (NOVO)
export const OrigemAvaliacao = {
    FLUXO_NORMAL: 'fluxo_normal',
    URGENCIA_GESTOR_ESPACO: 'urgencia_gestor_espaco',
} as const;

export type OrigemAvaliacaoType = typeof OrigemAvaliacao[keyof typeof OrigemAvaliacao];
```

---

## Impacto em Cascata dos Contratos

Quando um contrato é criado ou expandido, toda uma cascata de arquivos deve mudar **simultaneamente** e sem fragmentação. O projeto segue um padrão fixo:

### Arquivos que Precisam Mudar

1. **`resources/js/constants/permissions.ts`**
   - Atualmente exporta `ROLE_INSTITUCIONAL`, `ROLE_GESTOR`, `ROLE_COMUM` derivados de `SystemRole`
   - Precisa adicionar: `ROLE_GESTOR_ESPACO`, `ROLE_GESTOR_UNIDADE`
   - Precisa adicionar constantes das permissions novas: `PERMISSION_UNIDADES_GERENCIAR_GESTORES`, `PERMISSION_MODULOS_GERENCIAR_GESTORES_ESPACO`, etc.

2. **`resources/js/constants/permission-labels.ts`**
   - Rótulos de cada permission nova (exibição na tela de Roles)
   - Correção do rótulo de `gestor` para "Gestor de Reserva" (faz diferença agora que temos `gestor_espaco` e `gestor_unidade`)

3. **`resources/js/types/index.d.ts`** — Tipo Global de `User`
   - Tipo global de `User` ganha campo `tipo_vinculo` (string, uma das chaves de `TipoVinculo`)

4. **`resources/js/contracts/contracts.test.ts`**
   - Teste de contrato **precisa cobrir os 5 roles** (adicionando os 2 novos)
   - Precisa cobrir os 2 contratos novos (`TipoVinculo`, `OrigemAvaliacao`)
   - Qualquer `switch` sobre um contrato **exige** `default: return assertNever(...)` (regra §4.2)
   - Isso garante que adicionar um novo valor ao contrato quebre o build até todos os switches serem atualizados

### Checklist Mecânico para Toda Mudança de Contrato

- [ ] Contrato definido em `resources/js/contracts/`
- [ ] Type generado e exportado
- [ ] Constante em `permissions.ts` (se for role/permission)
- [ ] Rótulo em `permission-labels.ts`
- [ ] Tipo global de `User` atualizado (se relevante)
- [ ] `contracts.test.ts` estendido com cobertura dos novos valores + `assertNever` em todos os switches

---

## Componentes Novos/Alterados

A tabela abaixo lista **todos os componentes** que nascem ou são substancialmente alterados para suportar a composição por permissão da v2.0. Organização por tipo (organisms, molecules, atoms):

### Organisms (Blocos de Composição)

| Componente | Ação |
|---|---|
| `organisms/Dashboard/WidgetVisaoMacroInstitucional.tsx` (novo nome/refator de lógica) | Bloco visível só ao `institucional` — contadores agregados por campus. Exemplo de conteúdo que **reaproveita** componentes menores, nunca duplica dados. |
| `organisms/Dashboard/WidgetPainelGestorUnidade.tsx` (NOVO) | Bloco do dashboard composto do Gestor de Unidade — substitui o que seria o corpo de uma `DashboardGestorUnidadePage` inteira. Inclui o indicador de setores sem expediente cadastrado (D-6), tornando o preenchimento gradual visível sem ser bloqueante. |
| `organisms/Dashboard/WidgetEspacosSobResponsabilidade.tsx` (NOVO) | Bloco do dashboard composto do Gestor de Espaço — substitui o que seria o corpo de uma `DashboardGestorEspacoPage` inteira. |
| `organisms/Dashboard/WidgetAprovacoesUrgenciaRecentes.tsx` (novo nome/refator) | Continuação visual do widget anterior, listando as últimas aprovações de urgência feitas pelo Gestor de Espaço. |
| `organisms/Dashboard/WidgetReservasParaAvaliar.tsx` (novo nome/refator) | Bloco do Gestor de Reserva — reservas pendentes na(s) sua(s) agenda(s). |
| `organisms/Dashboard/WidgetMinhasReservas.tsx` (novo nome/refator) | Sempre visível — todo usuário autenticado tem reservas próprias. |
| `organisms/Reservas/WidgetAprovacaoUrgencia.tsx` (NOVO) | Seção adicional na página de Reservas do Gestor (`/gestor/reservas`), visível só com `reservas.avaliar-urgencia`: lista horários livres do dia nos espaços que o Gestor de Espaço gerencia, com seletor de `CategoriaSolicitanteEnum` e botão de aprovação. |
| `organisms/Administrativo/GestoresEspaco.tsx` (já existe, renomeado conceitualmente) | **Renomear internamente** o conceito de "Gestor" para "Gestor de Reserva" nos rótulos; criar componente irmão `organisms/Administrativo/GestoresEspacoInfraestrutura.tsx` para o novo vínculo (evitar sobrecarregar o componente existente com 2 conceitos). |
| `organisms/Administrativo/GestoresUnidade.tsx` (NOVO) | Seletor multi-usuário para vincular Gestores de Unidade a uma Unidade — reaproveita padrão de `UsuariosSetor.tsx`. |
| `organisms/Administrativo/SetorExpedienteForm.tsx` (NOVO) | Edição de horário, dias de funcionamento e exceções por intervalo (documento 03, §9.2–9.3). Visível ao Institucional, Gestor de Unidade e ao responsável designado daquele setor. |

### Molecules (Componentes Compostos Reutilizáveis)

| Componente | Ação |
|---|---|
| `molecules/EspacoGestorEspacoBadge.tsx` (NOVO) | Badge na ficha do espaço indicando "Gerenciado por: {nome}" com indicação visual se é override ou herdado do módulo (ex.: ícone diferente). |
| `molecules/TutorialChamadoViewer.tsx` (NOVO) | Exibe o conteúdo de `TipoChamado.tutorial` na rota pública de report, com CTA "Resolveu?" antes de liberar o formulário de chamado formal. |

### Atoms (Primitivos Visuais)

| Componente | Ação |
|---|---|
| `atoms/OrigemVinculoBadge.tsx` (NOVO) | "Padrão do Módulo" vs. "Atribuição Direta" — reutilizável em qualquer tela que precise indicar a origem da atribuição (evita confusão de UX quando um espaço tem override). |
| `atoms/OrigemAvaliacaoBadge.tsx` (NOVO) | "Aprovado em regime de urgência" — exibido no card/detalhe de reserva sempre que `Horario.origem_avaliacao !== 'fluxo_normal'`, para transparência ao solicitante e ao Gestor de Reserva titular. |
| `atoms/AvisoExpedienteIndeterminado.tsx` (NOVO) | Aviso exibido no fluxo de urgência quando `estaEmExpediente()` retorna `null` — comunica que a validação não pôde ser feita, sem bloquear (D-2). |

---

## i18n — Novas Chaves

Bloco JSON de exemplo das novas chaves de tradução necessárias para suportar a v2.0:

```json
{
  "gestor_unidade": "Gestor de Unidade",
  "gestor_unidade_plural": "Gestores de Unidade",
  "gestor_espaco": "Gestor de Espaço",
  "gestor_espaco_plural": "Gestores de Espaço",
  "gestor_reserva": "Gestor de Reserva",
  "gestor_reserva_plural": "Gestores de Reserva",
  "espaco_orfao_gestor_espaco": "Espaço sem Gestor de Espaço atribuído",
  "tipo_vinculo_estudante": "Estudante",
  "tipo_vinculo_professor": "Professor",
  "tipo_vinculo_tecnico_administrativo": "Técnico-Administrativo",
  "tipo_vinculo_externo": "Externo",
  "vinculo_origem_padrao_modulo": "Padrão do Módulo",
  "vinculo_origem_override_espaco": "Atribuição Direta ao Espaço",
  "origem_avaliacao_fluxo_normal": "Fluxo de aprovação padrão",
  "origem_avaliacao_urgencia": "Aprovação em regime de urgência",
  "reserva_aprovada_urgencia": "Aprovada em regime de urgência",
  "categoria_solicitante_professor": "Professor",
  "categoria_solicitante_monitor": "Monitor",
  "categoria_solicitante_aluno": "Aluno",
  "categoria_solicitante_externo": "Externo",
  "chamado_tutorial_resolveu": "Isso resolveu o seu problema?",
  "chamado_tutorial_nao_resolveu_cta": "Não, quero abrir um chamado",
  "expediente_indeterminado_aviso": "Não foi possível validar o horário. Prossiga com cautela.",
  "label_gestor_unidade_padrao": "Gestor de Campus"
}
```

**Nota:** A chave `label_gestor_unidade_padrao` é sugestão de rótulo padrão; o `label_gestor` de cada Unidade é customizável via permissão `unidades.atualizar` (P-33).

---

## Exemplo de Composição — Dashboard Único

A mudança de paradigma é ilustrada no exemplo concreto do Dashboard. **Antes (versão anterior deste documento):** `DashboardGestorUnidadePage.tsx` + `DashboardGestorEspacoPage.tsx` como arquivos 100% separados. **Depois (esta atualização):** uma única `Dashboard/DashboardPage.tsx` compõe organisms condicionais:

### `resources/js/presentation/pages/Dashboard/DashboardPage.tsx` (Conceito)

```tsx
import { AppLayout } from '@/presentation/templates/AppLayout';
import { Can } from '@/presentation/components/authorization/Can';
import { WidgetVisaoMacroInstitucional } from '@/presentation/organisms/Dashboard/WidgetVisaoMacroInstitucional';
import { WidgetPainelGestorUnidade } from '@/presentation/organisms/Dashboard/WidgetPainelGestorUnidade';
import { WidgetEspacosSobResponsabilidade } from '@/presentation/organisms/Dashboard/WidgetEspacosSobResponsabilidade';
import { WidgetAprovacoesUrgenciaRecentes } from '@/presentation/organisms/Dashboard/WidgetAprovacoesUrgenciaRecentes';
import { WidgetReservasParaAvaliar } from '@/presentation/organisms/Dashboard/WidgetReservasParaAvaliar';
import { WidgetMinhasReservas } from '@/presentation/organisms/Dashboard/WidgetMinhasReservas';

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Bloco 1: Institucional vê visão macro agregada */}
                <Can permission="secao.dashboard-institucional">
                    <WidgetVisaoMacroInstitucional />
                </Can>

                {/* Bloco 2: Gestor de Unidade vê painel de campus */}
                <Can permission="secao.dashboard-gestor-unidade">
                    <WidgetPainelGestorUnidade />
                </Can>

                {/* Bloco 3: Gestor de Espaço vê espaços sob responsabilidade */}
                <Can permission="secao.dashboard-gestor-espaco">
                    <WidgetEspacosSobResponsabilidade />
                    <WidgetAprovacoesUrgenciaRecentes />
                </Can>

                {/* Bloco 4: Gestor de Reserva vê reservas para avaliar */}
                <Can permission="secao.gestao-reservas">
                    <WidgetReservasParaAvaliar />
                </Can>

                {/* Bloco 5: Sempre visível — todo usuário autenticado tem reservas próprias */}
                <WidgetMinhasReservas />
            </div>
        </AppLayout>
    );
}
```

### Benefícios Imediatos

1. **Eliminação de rota duplicada:** Uma rota `GET /dashboard` em vez de 3 (`/dashboard/institucional`, `/dashboard/gestor`, etc.).
2. **Acúmulo de papéis natural:** Um usuário que acumula `gestor_unidade` **e** `gestor_espaco` — caso **explicitamente permitido** (P-12, fechada: acúmulo livre de papéis) — vê os dois blocos na mesma tela, sem duplicar navegação. Sua experiência melhora, não se degrada.
3. **Componentes menores e testáveis:** Cada widget é um organism independente com interface clara, facilitando testes unitários e refatorações futuras.
4. **Fidelidade à regra §4.3:** Não há um único `if (role === ...)` no arquivo — toda decisão é baseada em permission, garantindo segurança.

### Cascata no Backend (Complemento Necessário)

A diretriz de composição **não é uma mudança apenas de frontend**. O backend também muda:

| Camada | De | Para |
|---|---|---|
| `HomeController` | `match(true)` escolhendo 1 de 3 páginas | Render único de `Dashboard/DashboardPage` |
| `HomeService` | `if/elseif` retornando 1 bloco | **Merge aditivo** dos blocos que o usuário pode ver |

Exemplo de transformação:

```php
// ANTES
if ($user->hasPermissionTo('secao.dashboard-institucional')) {
    return $this->getInstitucionalData($user);     // ← retorna E PARA
} elseif ($user->hasPermissionTo('secao.dashboard-gestor')) {
    return $this->getGestorData($user);
}
return $this->getUserData($user);

// DEPOIS
$data = [];

if ($user->hasPermissionTo('secao.dashboard-institucional')) {
    $data['institucional'] = $this->getInstitucionalData($user);
}
if ($user->hasPermissionTo('secao.dashboard-gestor-unidade')) {
    $data['gestor_unidade'] = $this->getGestorUnidadeData($user);
}
if ($user->hasPermissionTo('secao.dashboard-gestor-espaco')) {
    $data['gestor_espaco'] = $this->getGestorEspacoData($user);
}

$data['minhas_reservas'] = $this->getMinhasReservasData($user);

return $data;
```

**Risco de Performance (R-17):** Um usuário com todos os papéis dispararia todas as queries de todos os blocos. Recomendação: montar o payload **bloco a bloco sob condição de permissão**, e considerar carregamento diferido (endpoint próprio por bloco, ou Inertia partial reload) para os blocos mais caros.

---

## Síntese — Pilares da Arquitetura Frontend v2.0

| Pilar | Implementação |
|---|---|
| **Permissão, não Role** | Toda decisão condicional usa `<Can permission="...">` ou `useCan()`. Nunca `role === 'X'`. |
| **Composição por Blocos** | Uma página renderiza N organisms condicionais. Reaproveitamento radical de componentes existentes. |
| **Contratos SSOT** | `resources/js/contracts/` é a fonte canônica de todas as máquinas de estado. Mudança de contrato quebra o build até `contracts.test.ts` ser atualizado. |
| **Cascata Automática** | Adicionar um valor a um contrato força atualização de `permissions.ts`, `permission-labels.ts`, `types/index.d.ts`, `contracts.test.ts`. Checklist mecânico em PR. |
| **Sem Duplicação** | Componentes existentes (`EspacoCard`, `DataTable`, `GestoresEspaco`) são compostos, nunca duplicados. |
