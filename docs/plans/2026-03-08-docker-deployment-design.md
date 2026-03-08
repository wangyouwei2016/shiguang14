# Docker Deployment Design

## Goal

Provide a production-oriented Docker deployment for the current Next.js application, while keeping runtime JSON data outside the container image and mounted from the host.

## Confirmed Scope

- Provide `Dockerfile`
- Provide `docker run` usage
- Persist runtime data through a host mount
- Do not add `docker-compose.yml`

## Current Project Facts

- Framework: Next.js 15 with `output: 'standalone'`
- Runtime persistence: file-based JSON storage
- Task file path: `data/tasks.json`
- Goal file path: `data/goals.json`
- API code resolves storage from `process.cwd()/data`

## Options Considered

### Option 1 — Multi-stage build with standalone output (selected)

Use a multi-stage Docker build, compile the app in a builder stage, and run the generated standalone server in a minimal runtime image.

**Pros**
- Best fit for current Next.js config
- Smaller runtime image
- Clear separation between build-time and runtime concerns
- Minimal code changes

**Cons**
- Requires careful handling of traced files in standalone output

### Option 2 — Single-stage Node image

Copy the whole project into one image and run `npm start`.

**Pros**
- Simpler Dockerfile

**Cons**
- Larger image
- Slower builds
- Less aligned with existing standalone setup

### Option 3 — Extra entrypoint bootstrap script

Add a startup script that initializes the `data` directory and files before launching the app.

**Pros**
- Explicit initialization flow

**Cons**
- Extra moving parts
- Unnecessary because the API layer already creates files on demand

## Selected Design

### Image Strategy

- Use `node:20-alpine`
- Install dependencies in a dedicated `deps` stage with `npm ci`
- Build the app in a `builder` stage with `npm run build`
- Run the compiled standalone server in a `runner` stage

### Runtime Working Directory

- Set `WORKDIR` to `/app`
- This keeps `process.cwd()` aligned with the existing API implementation

### Persistence Strategy

- Mount host directory `./data` to container path `/app/data`
- The container should not keep user runtime data inside the image layer
- Because Next.js standalone tracing may include `data/*.json`, explicitly remove `/app/data` in the runtime image and recreate it empty

### Container Startup

- Expose port `3000`
- Run `node server.js`
- Use `HOSTNAME=0.0.0.0` and `PORT=3000`

## Validation Plan

- Verify `npm run build` succeeds
- Verify the standalone server can run with an empty `/app/data`
- Verify `GET /api/tasks` and `GET /api/goals` auto-create JSON files when missing
- Verify mounted-style writes succeed through the API

## Documentation Deliverables

- Add `Dockerfile`
- Add `.dockerignore`
- Update `README.md` with build, run, logs, restart, and persistence notes
