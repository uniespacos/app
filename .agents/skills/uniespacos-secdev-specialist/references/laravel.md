# Laravel Security Guidelines

## 1. Authentication and Authorization
- **Policies & Gates:** Every endpoint that accesses or modifies a resource MUST have a corresponding Policy or Gate check (e.g., `$this->authorize('update', $model)`).
- **Route Protection:** Use the `auth` middleware for all protected routes. Avoid relying solely on frontend hiding.
- **Mass Assignment:** Use `$fillable` or `$guarded` strictly in Eloquent models. Never use `Model::create($request->all())`.

## 2. Input Validation
- **Form Requests:** Always use Form Request classes for validation to keep controllers clean and ensure validation runs before authorization.
- **Strict Typing:** Enforce strict typing in validation rules (e.g., `string`, `integer`, `boolean`). Use the `exists` and `unique` rules for database checks.
- **Sanitization:** Be careful with rich text input. If accepting HTML, use a robust sanitization library (like HTML Purifier).

## 3. Data Protection
- **Hidden Attributes:** Ensure sensitive fields (passwords, tokens, internal IDs) are added to the `$hidden` array in models to prevent accidental exposure in JSON responses or Inertia props.
- **SQL Injection:** Always use Eloquent or the query builder. If raw queries are unavoidable, use parameter binding (`DB::select('... ?', [$id])`). Never interpolate variables into queries.

## 4. Session & CSRF
- **CSRF Protection:** Laravel handles this automatically via the `@csrf` directive in Blade or the `X-XSRF-TOKEN` header in Axios/Inertia. Ensure middleware is enabled.
- **Session Security:** Use `secure`, `httponly`, and `samesite` attributes for session cookies (configured in `config/session.php`).
