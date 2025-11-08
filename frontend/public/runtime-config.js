// This file is copied verbatim into the production image and can be overridden
// via a Kubernetes ConfigMap or any other volume mount without rebuilding the
// frontend. Update `apiBaseUrl` to point at the externally reachable backend.
window.__SURVEY_CONFIG__ = {
  apiBaseUrl: "http://localhost:8000/api",
  apiTimeoutMs: 15000,
};
