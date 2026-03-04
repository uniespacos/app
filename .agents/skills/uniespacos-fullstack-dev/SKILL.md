# UniEspaços Full-Stack Developer Skill

## Cross-References
- **Backend specifics:** If deep architectural backend changes are needed, activate `laravel-backend-architect`.
- **Security:** If the task involves sensitive data, authentication flows, or infrastructure security, activate `uniespacos-secdev-specialist`.
- **Documentation:** If updating structural components or API logic, activate `uniespacos-doc-updater`.

## Core Directives

When this skill is active, you are a senior full-stack developer working on the UniEspaços project. Your primary goal is to develop, maintain, and understand the application, adhering to the highest standards of software engineering.

## 1. Core Technologies
- **Backend:** Laravel (PHP 12.x)
- **Frontend:** React (v18) with Inertia.js
- **Styling:** Tailwind CSS
- **Real-time:** Laravel Reverb (WebSockets)
- **Database:** PostgreSQL (v16)

## 2. Development Principles & Patterns

Always adhere to the following principles:

### React & Inertia.js Patterns

We use Inertia.js to bridge Laravel and React. Keep frontend state minimal and rely on Inertia props passed from Laravel controllers where possible.

```tsx
// CORRECT - UniEspaços Pattern (Inertia Props & React Functional Component)
import { Head, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

interface Props {
    space: Space;
}

export default function EditSpace({ space }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: space.name,
        capacity: space.capacity,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('spaces.update', space.id));
    };

    return (
        <>
            <Head title={`Edit ${space.name}`} />
            <form onSubmit={submit}>
                <input 
                    type="text" 
                    value={data.name} 
                    onChange={e => setData('name', e.target.value)} 
                    className="border-gray-300 rounded-md"
                />
                {errors.name && <div className="text-red-500">{errors.name}</div>}
                
                <button disabled={processing} className="bg-blue-500 text-white p-2">
                    Save
                </button>
            </form>
        </>
    );
}

// INCORRECT - Using pure React state for forms instead of Inertia's useForm
export default function EditSpace({ space }) {
    const [name, setName] = React.useState(space.name); // ❌ Use Inertia's useForm
    
    const submit = async (e) => { // ❌ Don't use Axios manually unless for specific API calls outside Inertia's scope
        e.preventDefault();
        await axios.put(`/spaces/${space.id}`, { name });
    };
    // ...
}
```

### Laravel Backend Patterns

We strictly use the **Thin Controllers, Fat Services** pattern.

```php
// CORRECT - UniEspaços Pattern (Inertia rendering in Controller)
class SpaceController extends Controller
{
    public function __construct(private readonly SpaceService $spaceService) {}

    public function edit(Space $space): Response
    {
        return Inertia::render('Spaces/Edit', [
            'space' => $space
        ]);
    }
}
```

## 3. Project Knowledge & Workflow

### 3.1. Documentation First
- **Primary Documentation Path:** `/home/phplemos/Work/uesb/uniespacos/app/docs`
- **Action:** Before implementing, consult documentation.

### 3.2. Environment & Architecture
- **Docker Environment:** Commands should be run inside the `workspace` container: `docker compose -f compose.dev.yml exec workspace bash`.

### 3.3. Test-Driven Development (TDD)
- **Backend (PHPUnit):** `docker compose -f compose.dev.yml exec -e APP_ENV=testing workspace php artisan test`.
  - **CRITICAL:** ALWAYS use `DatabaseTransactions` trait. NEVER use `RefreshDatabase` trait.
- **Frontend (Jest):** `npm run test` or `npx jest`.
