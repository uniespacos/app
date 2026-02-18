# Development Server

The Vite development server is configured to work within the Docker environment.

## Configuration (`vite.config.ts`)

```typescript
server: {
    host: '0.0.0.0', // Listen on all network interfaces (required for Docker)
    port: 5173,      // Standard Vite port
    hmr: {
        host: 'localhost', // Browser connects to localhost (host machine)
    }
}
```

## Docker Compose
Port `5173` must be forwarded in `docker-compose.yml`:
```yaml
ports:
  - '${VITE_PORT:-5173}:5173'
```
