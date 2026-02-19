# Deployment

## Build Process
1. **Run Build**: `npm run build`
   - Generates assets in `public/build`.
   - Generates `public/build/manifest.json`.

2. **Docker Image**:
   - The contents of `public/build` are copied into the Nginx container.
   - See `docker/production/nginx/Dockerfile`.

## Important
- Ensure `npm run build` is run *before* building the Docker image or as a stage within the Docker build.
- Do not commit `public/build` to version control (it is ignored).
