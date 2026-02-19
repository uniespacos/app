# Security & CSP

## Content Security Policy (CSP)
If you implement a Content Security Policy, you will likely need to allow inline scripts and styles for Vite's HMR to work in development.

### Nonce Generation
To use a nonce with Vite and Laravel:

1.  **Generate Nonce**: In your `AppServiceProvider` or middleware.
    ```php
    use Illuminate\Support\Facades\Vite;
    
    Vite::useCspNonce();
    ```

2.  **Blade Template**: The `@vite` directive will automatically handle the nonce attribute.

## Current Project Status
- **CSP**: No strict CSP headers observed in default configuration.
- **Nonce**: Not currently active in `app.blade.php`.

## Recommendations
- For production, consider implementing a strict CSP.
- Ensure `VITE_` env variables do not expose sensitive keys (only public keys like Pusher).
