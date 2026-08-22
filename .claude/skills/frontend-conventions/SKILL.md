---
name: frontend-conventions
description: Convenções de frontend do UniEspaços (atomic design, modais, formulários, gerência de estado, tokens de cor). Use antes de criar componente novo ou decidir onde um arquivo de UI vai.
---

# Convenções de frontend — UniEspaços

## Onde o arquivo vai (atomic design)

`resources/js/presentation/`:

- `atoms/` — sem estado próprio de domínio (`SituacaoBadge`, `input-error`, `text-link`).
- `molecules/` — composição pequena e reutilizável entre páginas (`Modal`, `FormField`,
  `DatePicker`, `delete-item`).
- `organisms/` — composição com lógica de domínio, geralmente amarrada a um recurso
  (`PermissionModal`, `EspacoCard`, `AgendaDialogReserva`).
- `pages/` — o componente que o Inertia renderiza (`Administrativo/Usuarios/Usuarios.tsx`).
- `templates/` — layout que envolve páginas (`app-layout.tsx`).

`resources/js/components/ui/` é a cópia local do shadcn (`dialog.tsx`, `button.tsx`, `select.tsx`).
Só mexe se o motivo for consertar o primitivo em si para todo mundo — não para uma tela.

## Modal: sempre via `Modal`, nunca `Dialog` cru

`presentation/molecules/Modal.tsx` encapsula `Dialog`/`DialogContent`/`DialogHeader` já com o raio
(`rounded-xl`) e overlay (`bg-black/50`) corretos. Toda tela nova de modal monta em cima dele:

```tsx
<Modal open={open} onOpenChange={setOpen} title="..." description="..." size="md">
  {/* conteúdo */}
</Modal>
```

`size`: `sm|md|lg|xl`. Escape hatch pontual via `className` quando o conteúdo exige largura fora do
padrão (ex.: tabela grande) — não é a regra, é exceção documentada no próprio JSX.

Campo de formulário dentro do modal usa `FormField` (label + controle + erro em
`text-sm text-destructive`), não repita esse bloco à mão.

`AlertDialog` continua separado — é para confirmação destrutiva bloqueante (não fecha com clique
fora), semântica diferente do `Dialog`.

## Formulário: qual mecanismo usar

O projeto tem mais de um padrão convivendo — escolha pelo contexto, não pelo que está mais perto:

- **CRUD simples ligado a uma rota Laravel** (criar/editar/deletar registro): `useForm` do
  `@inertiajs/react`. Dá `data`, `setData`, `errors`, `processing` de graça, integrado com validação
  do `FormRequest`. Exemplo: `EditUserModal.tsx`, `delete-item.tsx`.
- **Formulário com validação client-side complexa** (múltiplos campos interdependentes, regra de
  negócio no próprio front): `react-hook-form` + `zod`. Exemplo: `RoleFormModal.tsx`.
- **Ação simples sem formulário** (favoritar, mudar status): `router.post/put/delete` direto, sem
  `useForm`.

Não misture os três no mesmo componente. Se o formulário crescer de "simples" para "precisa de
validação client-side", migre inteiro para `react-hook-form`, não tampone com `useState` solto.

## Leitura de estado do servidor

`usePage<{...}>().props` é a única fonte de props vindas do Inertia — não duplique em `useState`
sem necessidade (isso já causou bug de tela mostrando dado desatualizado até o F5). Quando a ação
precisa refletir na lista sem reload manual, prefira deixar o backend responder com `back()` (ou
redirect) e o Inertia atualizar as props sozinho, em vez de sincronizar estado local à mão.

## Cor: token semântico, nunca valor fixo

Use `bg-destructive`, `text-muted-foreground`, `bg-success`, etc. — nunca `bg-red-500` ou hex direto.
Os tokens estão em `tailwind.config`/CSS vars do tema e respeitam dark mode automaticamente.

## Mapeie, não exiba valor cru do banco

Quando o backend guarda slug (`andar-1`, `terreo`) e a UI precisa de rótulo (`1º Andar`, `Térreo`),
procure o mapper antes de espalhar `switch`/`if` pela UI. Exemplo real:
`lib/utils/andars/AndarOptions.ts` → `getAndarLabelByValue()`. Mesma lógica para outros enums de
domínio (`getTurnoText` em `lib/utils.ts`).

## Antes de escrever componente novo

Grep pelo nome do padrão que você está prestes a reimplementar. Vários bugs já resolvidos nesta base
vieram de duplicação: date-picker copiado em dois lugares, filtro de busca reimplementado por tela.
Se dois componentes fazem a mesma coisa, o segundo devia ter sido reuso do primeiro.
