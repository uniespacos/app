# UniEspaços Frontend Refactoring & API Migration Plan

This plan documents the step-by-step roadmap for refactoring the **UniEspaços** React frontend into a robust **3-Layer Architecture** (Domain, Application, Infrastructure) and migrating backend communications from server-side Inertia rendering/props to client-side REST API calls.

To ensure production stability, the refactoring is designed to be **incremental, backward-compatible, and thoroughly testable** using Git branches and Pull Requests (PRs).

---

## Table of Contents
1. [Architectural Vision & Layer Mapping](#1-architectural-vision--layer-mapping)
2. [Git Branching & PR Strategy](#2-git-branching--pr-strategy)
3. [Phase-by-Phase Roadmap with Risk Assessments](#3-phase-by-phase-roadmap-with-risk-assessments)
   - [Phase 1: Foundation & Shared Abstractions](#phase-1-foundation--shared-abstractions)
   - [Phase 2: Pilot Feature - Reservas (Minhas Reservas)](#phase-2-pilot-feature---reservas-minhas-reservas)
   - [Phase 3: Reservas Gestor & Evaluation Screens](#phase-3-reservas-gestor--evaluation-screens)
   - [Phase 4: Espacos & Favoritos Features](#phase-4-espacos--favoritos-features)
   - [Phase 5: Administrativo & Settings Refactoring](#phase-5-administrativo--settings-refactoring)
   - [Phase 6: Backend REST API Transition & Swap](#phase-6-backend-rest-api-transition--swap)
4. [Backend API Endpoint Delegation Protocol](#4-backend-api-endpoint-delegation-protocol)
5. [Verification & Rollback Strategy](#5-verification--rollback-strategy)

---

## 1. Architectural Vision & Layer Mapping

Currently, the pages receive all their data as props injected by Inertia.js controllers, and interact with the backend by executing direct calls to the Inertia `router` (e.g., `router.get`, `router.post`).

To decouple the UI from Inertia and prepare for REST API communication, we will wrap interactions behind **Ports and Adapters**:

```
resources/js/
├── domain/                      # LAYER 1: DOMAIN (Pure Business Rules)
│   └── [Feature]/
│       ├── [Feature].rules.ts   # Pure functions (e.g., calendar conflicts, validation)
│       └── [Feature].types.ts   # Typings specific to domain entities
│
├── application/                 # LAYER 2: APPLICATION (Use Cases & Repository Ports)
│   └── [Feature]/
│       ├── ports/               # Interfaces defining data operations (Repositories)
│       │   └── [Feature]Repository.interface.ts
│       └── use-cases/           # React hooks coordinating state and calling ports
│           └── use[UseCase]UseCase.ts
│
├── infrastructure/              # LAYER 3: INFRASTRUCTURE (Concrete Implementations)
│   ├── shared/                  # Common HTTP gateways and helpers
│   │   ├── http-gateway.ts      # Axios/Inertia abstraction
│   │   └── navigation.service.ts
│   └── [Feature]/
│       ├── Inertia[Feature]Repository.ts # Active adapter (wraps Inertia requests)
│       └── Api[Feature]Repository.ts     # Future adapter (calls Laravel API via HTTP)
│
└── presentation/                # LAYER 4: PRESENTATION (UI Views Only)
    ├── layouts/                 # Application layouts & shells
    └── pages/                   # Inertia page controllers (thin wrappers)
        └── [Feature]/
            └── components/      # UI components that consume hooks (use-cases)
```

### Swapping Protocol (The Bridge Pattern)
By separating the repository *interface* from its *implementation*, we can build and test pages using the `Inertia[Feature]Repository` first. When the backend REST endpoints are ready, we can swap the active implementation to `Api[Feature]Repository` without modifying a single line of UI rendering code.

---

## 2. Git Branching & PR Strategy

To prevent big-bang releases, all refactoring goes through dedicated branches merged into `development` (for staging QA) and finally `main` (for production release).

```
main (Production)
  ▲
  │ (After Staging QA approval)
development (Staging)
  ▲
  ├── refactor/01-foundation
  ├── refactor/02-reservas-pilot
  ├── refactor/03-reservas-gestor
  ├── refactor/04-espacos-favoritos
  ├── refactor/05-administrativo
  └── refactor/06-api-swap
```

---

## 3. Phase-by-Phase Roadmap with Risk Assessments

### Phase 1: Foundation & Shared Abstractions

#### 1. Scope & Branch
* **Git Branch**: `refactor/01-foundation`
* **Target PR**: `refactor/01-foundation` ➔ `development`
* **Changes**:
  - Setup core directories: `resources/js/domain`, `resources/js/application`, `resources/js/infrastructure`.
  - Create interfaces in `application/ports/`: `INavigationService`, `IHttpGateway`, `IFormHandler`.
  - Create concrete implementations in `infrastructure/shared/`:
    - `InertiaNavigationService` (wraps Ziggy `route()` and Inertia `router.visit`).
    - `InertiaHttpGateway` (wraps Inertia `router.get/post/put/delete`).
  - Create agnostic form hook: `useAgnosticForm`.

#### 2. Test Plan
* **Unit Tests**:
  - `InertiaNavigationService.test.ts`: Verify it calls `router.visit` with correct paths.
  - `useAgnosticForm.test.ts`: Test validation errors, submit calls, and dirty states.

#### 3. Possibilities of Crash & Regression Risks
* **Vite Import Errors**: If base files contain broken imports, the entire application will fail to compile, causing a complete frontend whiteout screen on load.
* **Ziggy Router Failure**: If the `route()` helper resolves incorrectly inside the agnostic navigation service, all redirected links will throw runtime JavaScript errors.
* **Inertia Bridge Mismatch**: Mismatches between standard Inertia headers and the new `InertiaHttpGateway` could intercept form submits and lead to raw JSON payloads returning in the browser.

#### 4. Mitigations & Safety Nets
* **Compile and Lint Check**: Run `npm run build` and `npm run lint` locally and in CI before merging.
* **Fallback Behavior**: Ensure the global Inertia router remains untouched so non-refactored pages function as usual.

---

### Phase 2: Pilot Feature - Reservas (Minhas Reservas)

#### 1. Scope & Branch
* **Git Branch**: `refactor/02-reservas-pilot`
* **Target PR**: `refactor/02-reservas-pilot` ➔ `development`
* **Changes**:
  - Extract reservation rules to `domain/reservas/reserva-rules.ts`.
  - Create repository interface `IReservasRepository.interface.ts`.
  - Create `InertiaReservasRepository.ts` (implementing `IReservasRepository` using Inertia routing).
  - Implement `useReservasUseCase.ts` (manages search, filter selection, and state triggers).
  - Refactor `ReservasPage.tsx` and fragments (`ReservasFilters.tsx`, `ReservasList.tsx`) to interact exclusively with `useReservasUseCase`.

#### 2. Test Plan
* **Unit Tests**:
  - `reserva-rules.test.ts`: Test date formatting, status mapping, and helper logic.
  - `useReservasUseCase.test.ts`: Verify changing filter state triggers navigation with correct parameters.

#### 3. Possibilities of Crash & Regression Risks
* **State Sync Issue (Filters)**: The booking list uses stateful query parameters. If state synchronization between the filter inputs and URL props lags or misses updates, filtering or paging could break, rendering an empty list or looping requests.
* **Type Safety Breakage**: The `Paginator<Reserva>` data structure passed by Inertia must remain intact. If any interface mapper mutates the properties, sub-components will read undefined keys and crash with `Cannot read property of undefined`.

#### 4. Mitigations & Safety Nets
* **Prop Fallbacks**: Always provide defaults (e.g. `paginator.data || []`) to prevent rendering crashes.
* **Strict Type Assertions**: Ensure that the Inertia page props mapping is covered by strict TypeScript interfaces.

---

### Phase 3: Reservas Gestor & Evaluation Screens

#### 1. Scope & Branch
* **Git Branch**: `refactor/03-reservas-gestor`
* **Target PR**: `refactor/03-reservas-gestor` ➔ `development`
* **Changes**:
  - Add methods to `IReservasRepository.interface.ts` (e.g., `avaliar(id, status, justificativa)`).
  - Implement these methods in `InertiaReservasRepository.ts`.
  - Create use cases: `useAvaliarReservaUseCase.ts` and `useReservasGestorUseCase.ts`.
  - Refactor `AvaliarReservaPage.tsx` and `ReservasGestorPage.tsx` under `pages/Reservas/Gestor/`.

#### 2. Test Plan
* **Unit/Integration Tests**:
  - Test validation rules for booking approvals/rejections (e.g., justification required only on rejection).
  - Mock the repository and assert that `avaliar` use case triggers correct redirect navigation.

#### 3. Possibilities of Crash & Regression Risks
* **Double Submissions**: If the user submits an approval/rejection twice before the server redirects, it can cause database Integrity Constraint violations (evaluating an already evaluated reservation) resulting in Laravel 500 error screens.
* **Reverb WebSocket Breaks**: The gestor screen listens to live Reverb broadcasts. If refactoring changes component lifecycles or props, listeners might fail to clean up or bind, stopping real-time updates.

#### 4. Mitigations & Safety Nets
* **Disable Submit State**: Ensure the submit button is strictly disabled (`loading` state) during the transition.
* **Real-time Isolation**: Verify Laravel Echo event listeners in local container environment before pushing.

---

### Phase 4: Espacos & Favoritos Features

#### 1. Scope & Branch
* **Git Branch**: `refactor/04-espacos-favoritos`
* **Target PR**: `refactor/04-espacos-favoritos` ➔ `development`
* **Changes**:
  - Create domain rules for spaces under `domain/espacos/espaco-rules.ts`.
  - Implement `IEspacosRepository.interface.ts` and `InertiaEspacosRepository.ts`.
  - Create use case hooks: `useEspacosUseCase.ts` and `useFavoritosUseCase.ts`.
  - Refactor `EspacosPage.tsx`, `FavoritosPage.tsx`, and `VisualizarEspacoPage.tsx`.

#### 2. Test Plan
* **Unit Tests**:
  - Test filtering and space sorting helpers.
  - Test favorites toggle updates the local state reactively.

#### 3. Possibilities of Crash & Regression Risks
* **Favorite Toggle Latency**: Swapping favorite status makes server calls. If local UI state does not reflect the change immediately or if error handling fails, the icon can desynchronize, causing confusing interactions or multiple database inserts.
* **Map / Calendar Render Failure**: Visualizing spaces utilizes calendar libraries or grids. Component refactoring could easily break visual coordinates or layouts if container sizes are modified.

#### 4. Mitigations & Safety Nets
* **Optimistic UI Updates**: Update the visual state immediately on toggle, rolling back if the request fails.
* **UI Layout Verification**: Verify components in browser viewports across desktop and mobile form factors.

---

### Phase 5: Administrativo & Settings Refactoring

#### 1. Scope & Branch
* **Git Branch**: `refactor/05-administrativo`
* **Target PR**: `refactor/05-administrativo` ➔ `development`
* **Changes**:
  - Apply 3-layer architecture to: `Instituicoes`, `Modulos`, `Roles`, `Setores`, and `Usuarios` pages.
  - Standardize forms using the abstract `useAgnosticForm` handler.
  - Establish unit tests for administrative rules and form validations.

#### 2. Test Plan
* **Unit Tests**:
  - Test validation schemas for creating/editing users, sectors, and roles.
  - Assert invalid email, missing names, or duplicated keys trigger expected validation messages.

#### 3. Possibilities of Crash & Regression Risks
* **Permission / Role Lockout**: Administrativo modules control system access. A bug in data validation or payload shape during role/user updates could corrupt user permissions, locking administrators or gestors out of the application.
* **Cascade Delete Failures**: Administrative entities have relations (e.g., deleting an institution that has modules/spaces). If the frontend fails to handle relational dependency errors returned by the server, the screen might crash instead of showing a friendly error.

#### 4. Mitigations & Safety Nets
* **Database Transactions on DB**: Ensure backend deletes are protected, and frontend intercepts all 422/409 HTTP error codes gracefully without breaking the React rendering context.

---

### Phase 6: Backend REST API Transition & Swap

#### 1. Scope & Branch
* **Git Branch**: `refactor/06-api-swap`
* **Target PR**: `refactor/06-api-swap` ➔ `development`
* **Changes**:
  - Agent defines the API contract; **USER** builds corresponding REST endpoints in Laravel under `/api/`.
  - Implement `AxiosHttpGateway.ts` (fetches using standard HTTP requests instead of page transitions).
  - Create `ApiReservasRepository.ts` and `ApiEspacosRepository.ts` using the new Axios gateway.
  - **The Switch**: Swap dependency injection bindings in hooks to use the `Api` repositories.

#### 2. Test Plan
* **Integration Tests**:
  - Verify `ApiReservasRepository` makes expected requests using Mock Axios.
  - Verify JSON parsing of the backend responses.

#### 3. Possibilities of Crash & Regression Risks
* **CSRF Token Mismatches**: Axios requests will reject with `419 Token Mismatch` if CSRF cookies are missing or expired, causing all form submissions to fail silently or display server errors.
* **Loading State Flash / White Screens**: In Inertia, pages are hydrated on the server. Swapping to client-side API requests means components mount *without data* (loading state). If components assume data is present at mount, they will throw runtime errors (`TypeError: Cannot read property 'map' of undefined`).
* **Route Redirect loop**: Swapping page transitions to API calls can break browser history (back/forward buttons) if not handled using a client router or careful location triggers.

#### 4. Mitigations & Safety Nets
* **Loading and Error Boundaries**: Implement React `<Suspense>` and error boundaries to capture async exceptions.
* **Feature Flag / Toggle**: Implement a flag (e.g., `import.meta.env.VITE_USE_API_GATEWAY`) to instantly toggle back to `Inertia` repositories in case of unexpected production issues.
* **CSRF Pre-flight**: Ensure Axios is configured to automatically fetch and attach the CSRF cookie (`X-XSRF-TOKEN`).

---

## 4. Backend API Endpoint Delegation Protocol

To keep the frontend independent and allow incremental progress:
1. **Contract Draft**: Before implementing any REST repository, the agent will document the contract in a markdown file or code definition, containing:
   - Method + Path
   - Headers (e.g., CSRF, Content-Type)
   - Payload JSON Schema
   - Response JSON Schema (for 200, 422, 500 status codes)
2. **USER Action**: The agent will request the USER to implement this contract in Laravel.
3. **Mock Adapter**: During backend development, the frontend will use mock repositories to maintain full testability.
4. **Integration**: Once confirmed by the USER, the API adapter will be enabled and tested in homolog.

---

## 5. Verification & Rollback Strategy

### Automated Safeguards
* Each PR merge requires passing all PHPUnit and Jest test suites:
  ```bash
  # Inside workspace container:
  npm run test
  npm run lint
  vendor/bin/pint --test
  php artisan test
  ```

### Rollback Protocol
If a crash occurs in production after a release:
1. **Frontend Toggle**: If the crash is in the API transport layer (Phase 6), flip the environment variable `VITE_USE_API_GATEWAY=false` in `.env` to revert immediately to Inertia adapters without re-deploying code.
2. **Git Revert**: If the crash is in the domain layer, checkout the last stable tag on `main`, or trigger the manual server rollback script:
   ```bash
   ssh <user>@<host>
   cd /home/operador/app
   ./scripts/rollback.sh
   ```
