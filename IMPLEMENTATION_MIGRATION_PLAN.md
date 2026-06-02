# UniEspaços Frontend Refactoring & API Migration Plan (Presentation & Atomic Design Setup)

This plan documents the revised step-by-step roadmap for refactoring the **UniEspaços** React frontend. 

Per the updated instructions, we will **remove the Domain layer** (moving business helpers into the Application layer) and implement a dedicated **Presentation layer** organized using the **Atomic Design approach** (Atoms, Molecules, Organisms, Templates, Pages).

---

## Table of Contents
1. [Architectural Vision & Layer Mapping](#1-architectural-vision--layer-mapping)
2. [Git Branching & PR Strategy](#2-git-branching--pr-strategy)
3. [Phase-by-Phase Roadmap with Risk Assessments](#3-phase-by-phase-roadmap-with-risk-assessments)
   - [Phase 1: Domain Removal & Presentation Setup](#phase-1-domain-removal--presentation-setup)
   - [Phase 2: Atomic UI Migration & Page Relocation](#phase-2-atomic-ui-migration--page-relocation)
   - [Phase 3: Verification & Integration Validation](#phase-3-verification--integration-validation)
4. [Verification & Rollback Strategy](#4-verification--rollback-strategy)

---

## 1. Architectural Vision & Layer Mapping

The frontend code will be restructured into three clear directories under `resources/js/`:

```
resources/js/
├── presentation/                      # LAYER 1: PRESENTATION (Atomic UI Components)
│   ├── atoms/                         # Basic elements (Shadcn components under ui/ and custom atoms)
│   ├── molecules/                     # Combinations of atoms (custom dropdowns, indicators, navigation items)
│   ├── organisms/                     # Feature UI sections (filter forms, lists, grids, data tables)
│   ├── templates/                     # Layout shells (AppLayout, AuthLayout, AppShell)
│   └── pages/                         # Inertia resolved page orchestrators (ReservasPage, EspacosPage, Admin pages)
│
├── application/                       # LAYER 2: APPLICATION (Use Cases, Ports & Helpers)
│   ├── ports/                         # Repositories & HTTP abstractions
│   └── [Feature]/
│       ├── helpers/                   # Pure business/sorting logic (formerly in Domain)
│       └── use-cases/                 # Agnostic React hooks orchestrating states
│
└── infrastructure/                    # LAYER 3: INFRASTRUCTURE (Gateways & Concrete Adapters)
    ├── shared/                        # Axios & Inertia implementations of ports
    └── [Feature]/                     # Concrete repositories
```

---

## 2. Git Branching & PR Strategy

To maintain maximum safety and prevent production regressions, we will execute this transition in incremental branches and PRs:

1. **Branch 1: `refactor/07-presentation-setup`**
   - Focuses on setup of presentation directory structure, removing domain rules, migrating them to application helpers, updating page resolutions in `app.tsx`/`ssr.tsx`, moving layouts to templates, and moving page files to pages directory.
2. **Branch 2: `refactor/08-atomic-migration`**
   - Focuses on moving shared components and feature fragments from page folders into their respective Atomic presentation folders (Atoms, Molecules, Organisms) and updating imports.

---

## 3. Phase-by-Phase Roadmap with Risk Assessments

### Phase 1: Domain Removal & Presentation Setup

#### 1. Scope & Branch
* **Git Branch**: `refactor/07-presentation-setup`
* **Target PR**: `refactor/07-presentation-setup` ➔ `develop`
* **Changes**:
  - Delete `resources/js/domain/` directory completely.
  - Relocate pure status calculation and sorting rules from `domain/reservas/reserva-rules.ts` to `application/reservas/helpers/reserva-helpers.ts` (along with its unit tests).
  - Update imports in `ReservasList.tsx` to reference the relocated helper.
  - Create the presentation folder structure: `atoms`, `molecules`, `organisms`, `templates`, `pages`.
  - Move layouts/shells from `resources/js/layouts/` to `resources/js/presentation/templates/`.
  - Move pages from `resources/js/pages/` to `resources/js/presentation/pages/`.
  - Update `app.tsx` and `ssr.tsx` to resolve pages from `./presentation/pages/` instead of `./pages/`.

#### 2. Test Plan
* **Unit Tests**:
  - Run `npm run test` to verify helper tests and repository tests pass.
  - Confirm page compilation and resolution finishes successfully.

#### 3. Possibilities of Crash & Regression Risks
* **Inertia Glob Resolution Failure**: If the page folders are moved but `app.tsx`/`ssr.tsx` are not updated, or if some page file paths do not match the expected naming, Inertia routing will throw fatal Javascript errors on boot, resulting in a white screen for the user.
* **Mitigation**: Move the page folders and update `app.tsx`/`ssr.tsx` in a single unified set of changes. Immediately run `npm run build` and sanity test the dev server.

---

### Phase 2: Atomic UI Migration & Component Re-mapping

#### 1. Scope & Branch
* **Git Branch**: `refactor/08-atomic-migration`
* **Target PR**: `refactor/08-atomic-migration` ➔ `develop`
* **Changes**:
  - Map custom components inside `components/` to `presentation/atoms/` (custom atoms), `presentation/molecules/`, or `presentation/organisms/`.
  - Redistribute local component fragments currently nested in page directories (e.g. `presentation/pages/Reservas/fragments/`, `presentation/pages/Espacos/fragments/`) into global `presentation/molecules/` and `presentation/organisms/`.
  - Update all relative and alias import statements across the entire project.

#### 2. Test Plan
* **Integration Tests**:
  - Run ESLint: `npm run lint`.
  - Run TypeScript compiler: `npm run types` (`tsc --noEmit`) to verify all alias paths and component properties resolve with zero compile-time errors.
  - Run all unit and component tests: `npm run test`.
* **Build Check**:
  - Execute `npm run build` to confirm asset loader successfully bundles the code.

#### 3. Possibilities of Crash & Regression Risks
* **Broken Relative Imports**: Moving components around folders will break relative import paths (e.g. `../ui/button` vs `@/components/ui/button` or `@/presentation/atoms/button`). Broken imports lead to compiler crashes or runtime `undefined` component invocation errors.
* **Mitigation**: Standardize all imports to use path alias prefixes (`@/presentation/...`) rather than deep relative paths. Run `npm run types` and `npm run lint` continuously.

---

### Phase 3: Verification & Integration Validation

#### 1. Scope
* **Changes**:
  - Sanity check the refactored frontend inside the local dev environment.
  - Deploy to staging and check real-time notifications (Reverb connection) and Laravel Echo bindings.

---

## 4. Verification & Rollback Strategy

### Verification Checks
* Execute all tests, linters, and type checkers before merging:
  ```bash
  npm run lint
  npm run types
  npm run test
  npm run build
  ```

### Rollback Protocol
* Check out the previous tag or commit before the refactoring.
* Restore Inertia page routing glob in `app.tsx`/`ssr.tsx` to revert the page location setup.
