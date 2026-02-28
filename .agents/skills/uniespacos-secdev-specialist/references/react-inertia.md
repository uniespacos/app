# React & Inertia Security Guidelines

## 1. Data Minimization (Inertia Props)
- **Never Over-fetch:** Only send the data explicitly required by the React component. Never pass complete Eloquent models to Inertia if they contain sensitive, unused relationships or hidden fields.
- **API Resources/Transformers:** Use Laravel API Resources or data transfer objects (DTOs) to shape data before passing it to `Inertia::render()`.

## 2. Cross-Site Scripting (XSS)
- **Dangerous HTML:** Avoid using `dangerouslySetInnerHTML`. If it is absolutely necessary (e.g., rendering markdown or rich text), the input MUST be sanitized on the backend first and verified on the frontend using a library like DOMPurify.
- **Component Injection:** Ensure user input cannot control which components are rendered or script tags that get executed.

## 3. Client-Side Authorization
- **Visibility vs. Security:** Hiding a button or a route on the frontend based on user roles is for User Experience, NOT security. The backend must always re-verify permissions.
- **Inertia Share:** Be careful with what is shared globally via Inertia middleware (e.g., `HandleInertiaRequests.php`). Only share safe user profile data.

## 4. Third-Party Dependencies
- Regularly audit `package.json` for known vulnerabilities using `npm audit`.
