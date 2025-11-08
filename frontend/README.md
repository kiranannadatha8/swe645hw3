# SWE 645 Frontend

React + Vite single-page application that powers the GMU student survey experience. This
document describes how to run the frontend locally, configure it for production, and build
container images that integrate with AWS + Kubernetes.

## Local Development

```bash
cd frontend
npm install  # use npm ci in CI for reproducible installs
npm run dev  # serves http://localhost:5173
```

Override the backend API target during development by creating a `.env` file and setting
`VITE_API_BASE_URL`. Example:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT_MS=15000
```

## Runtime Configuration (Production)

The UI reads `window.__SURVEY_CONFIG__` from `public/runtime-config.js`. This file ships in
the container image and is safe to override using a ConfigMap/volume without rebuilding the
image.

```js
window.__SURVEY_CONFIG__ = {
  apiBaseUrl: "https://api.example.com/api",
  apiTimeoutMs: 15000,
};
```

Kubernetes example (`k8s/frontend-configmap.yaml`) projects this file into the Nginx
document root so each environment can point at a different backend URL.

## Docker Image

The multi-stage Dockerfile installs dependencies with `npm ci`, builds the production bundle,
and serves it from Nginx with security headers, gzip, and a `/healthz` endpoint.

```
docker build -t ghcr.io/your-org/survey-frontend:latest frontend \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api
```

At runtime you can still override the API endpoint via `runtime-config.js` if you prefer not
to bake the value at build time.

## Kubernetes

1. Apply the runtime config map: `kubectl apply -f k8s/frontend-configmap.yaml`.
2. Deploy the workload/service: `kubectl apply -f k8s/frontend-deployment.yaml`.
3. Ensure your ingress routes traffic to the `survey-frontend` service on port 80.

The deployment mounts `runtime-config.js` through a ConfigMap, allowing per-environment API
targets and timeout tuning without triggering a new image build.
