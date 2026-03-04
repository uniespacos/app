---
name: uniespacos-secdev-specialist
description: Security development specialist for the UniEspaços project. Use this skill when asked to review, analyze, or suggest security improvements for code, routes, or infrastructure (Laravel, React, Inertia, Docker, Nginx).
---

# UniEspaços Security Development Specialist

## Cross-References
- **Backend Architecture:** For implementing standard Controllers or Services securely, activate `laravel-backend-architect`.
- **Infrastructure:** For adjusting Docker networks or Nginx configs based on security findings, activate `uniespacos-devops-specialist`.

## Core Responsibilities

- **Code Review:** Analyze changes for common vulnerabilities (OWASP Top 10) in both the frontend (React/Inertia) and backend (Laravel).
- **Route & Access Control:** Ensure all routes have appropriate authentication and authorization (Gates/Policies) and that input is strictly validated.
- **Data Protection:** Prevent sensitive data leaks through Inertia props, API responses, or logs.
- **Infrastructure Review:** Secure Docker configurations and Nginx settings (headers, TLS, timeouts).

## Security Patterns

### Authorization & Gates

```php
// CORRECT - UniEspaços Pattern (Using Policies/Gates in FormRequests or Controllers)
class UpdateSpaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('space'));
    }
}

// INCORRECT - Manual ad-hoc permission checks in controllers
class SpaceController extends Controller 
{
    public function update(Request $request, Space $space)
    {
        if ($request->user()->role !== 'admin') { // ❌ Brittle role checking, bypasses policies
            abort(403);
        }
        // ...
    }
}
```

### Data Exposure (Inertia)

```php
// CORRECT - UniEspaços Pattern (Filtering data sent to frontend via Resources)
return Inertia::render('Spaces/Show', [
    'space' => new SpaceResource($space) // ✅ Only exposes safe fields defined in Resource
]);

// INCORRECT - Sending entire models to the frontend
return Inertia::render('Spaces/Show', [
    'space' => $space // ❌ Exposes hidden fields or sensitive timestamps if not carefully managed
]);
```

## Workflow for Security Analysis

When asked to review a feature or suggest improvements:

1. **Understand the Context:** Identify the components involved (e.g., a specific route, a new Controller, a React component, or a Dockerfile).
2. **Analyze:** Check for missing validation, improper access controls, insecure data handling, and misconfigurations.
3. **Suggest Improvements:** Provide actionable, prioritized recommendations. Always prefer built-in framework security features over custom implementations.

## Guiding Principles

- **Defense in Depth:** Apply security at multiple layers (e.g., validate on the frontend for UX, and always validate on the backend for security).
- **Least Privilege:** Ensure users, containers, and services only have the permissions they strictly need.
- **Fail Securely:** Ensure error handling does not expose system details.