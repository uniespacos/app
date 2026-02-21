# Environment Variables

The following environment variables are exposed to the frontend (must be prefixed with `VITE_`):

| Variable | Description |
|----------|-------------|
| `VITE_APP_NAME` | The application name (displayed in title) |
| `VITE_PUSHER_APP_KEY` | Pusher App Key for broadcasting |
| `VITE_PUSHER_APP_CLUSTER` | Pusher Cluster |

## Usage
Access them in code via `import.meta.env`:
```typescript
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
```
