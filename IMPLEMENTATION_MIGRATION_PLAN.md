# Comprehensive Phased Atomic Refactoring & TypeScript Resolution Plan

This plan documents the step-by-step strategy for analyzing and refactoring the **UniEspaços** Presentation layer. It divides the work into 3 incremental, highly traceable phases, each using its own Git branch. It extracts Atoms, corrects component classification (moving filters/fields from Organisms to Molecules), and resolves all 66 TypeScript compile errors to ensure a production-ready build.

---

## Phase 1: Extract and Standardize Atoms
* **Git Branch**: `refactor/08-01-atoms-extraction`
* **Target PR**: `refactor/08-01-atoms-extraction` ➔ `develop`

### Scope
1. **Create New Atoms**:
   - `SituacaoIndicator.tsx`: Extract dot status component.
   - `SituacaoBadge.tsx`: Extract badge status component.
   - `PaginacaoLink.tsx`: Extract individual page links wrapping Inertia links/spans.
   - `UserAvatar.tsx`: Reusable avatar initials fallback component calling the `useInitials` hook.
2. **Refactor Initial Consumers**:
   - Update `app-header.tsx`, `app-sidebar.tsx`, `UsuariosSetor.tsx`, and `UserSearchComboBox.tsx` to consume the new `UserAvatar` Atom.
   - Update `DashboardGestorPage.tsx` and `tabs-item-reserva.tsx` to import `SituacaoBadge` from atoms.
   - Update `paginacao-listas.tsx` to map links to the `PaginacaoLink` Atom.
   - Update `ReservasList.tsx` to remove duplicate local definitions, import new status Atoms, and render `PaginacaoListas` molecule instead of raw inline map.
3. **TypeScript & Test Verification**:
   - Solve all TypeScript compiler errors introduced by or related to these new atoms.
   - Run tests: `npm run test`.

---

## Phase 2: Move and Re-categorize Molecules
* **Git Branch**: `refactor/08-02-molecules-recategorization`
* **Target PR**: `refactor/08-02-molecules-recategorization` ➔ `refactor/08-01-atoms-extraction` (or `develop` depending on PR merge order)

### Scope
1. **Re-categorize and Relocate Components**:
   Move the following simple components from `presentation/organisms/` to `presentation/molecules/`:
   - `UnidadeFilters.tsx` ➔ `presentation/molecules/UnidadeFilters.tsx`
   - `InstituicaoFilter.tsx` ➔ `presentation/molecules/InstituicaoFilter.tsx`
   - `GestoresEspaco.tsx` ➔ `presentation/molecules/GestoresEspaco.tsx` (Update to use `UserAvatar` Atom)
   - `EspacoFormFields.tsx` ➔ `presentation/molecules/EspacoFormFields.tsx`
   - `ReservasFilters.tsx` ➔ `presentation/molecules/ReservasFilters.tsx`
2. **Remove Unused Components**:
   - Delete `presentation/organisms/HeaderSetor.tsx` (completely unused, replaced by `GenericHeader` molecule).
3. **Update Import References**:
   - Update `TabelaEspacos.tsx` to import `GestoresEspaco` from molecules.
   - Update pages (`Unidades.tsx`, `Instituicoes.tsx`, `CadastroEspaco.tsx`, `ReservasPage.tsx`, `ReservasGestorPage.tsx`) to import filters/fields from molecules.
4. **TypeScript & Test Verification**:
   - Resolve all import and reference TypeScript errors.
   - Run tests: `npm run test`.

---

## Phase 3: Label Standardization, Props Alignment & Full TS Resolution
* **Git Branch**: `refactor/08-03-labels-and-ts-resolution`
* **Target PR**: `refactor/08-03-labels-and-ts-resolution` ➔ `refactor/08-02-molecules-recategorization`

### Scope
1. **Form Label Standardization**:
   - Replace raw HTML `<label>` elements with the Shadcn `<Label />` Atom in `LocationSelector.tsx`, `RoleFormModal.tsx`, `PermissionModal.tsx`, `FiltrosSetor.tsx`, `FiltrosEspacos.tsx`, and `GerenciarGestoresDialog.tsx`.
2. **Align Component Props and Hooks**:
   - Harmonize interface declarations in `AndaresGrid.tsx` and `AndarFormCard.tsx` (e.g. passing `todosAndares` prop, correcting click/change callbacks).
   - Align `useReservationSlots` call parameters in `AvaliarReservaPage.tsx`.
3. **Resolve all remaining TypeScript Errors**:
   - Resolve implicit any warnings (e.g., in state maps inside `ModuloForm.tsx` and `ImageUpload.tsx`).
   - Fix typescript types inside layout files (e.g. `auth-split-layout.tsx`).
4. **Production Readiness Validation**:
   - Ensure `npm run types` compiles with **0 errors**.
   - Ensure `npm run lint` has **0 warnings/errors**.
   - Ensure `npm run test` passes **100%**.
   - Ensure production assets build successfully via `npm run build`.
