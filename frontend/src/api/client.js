const runtimeConfig = globalThis.window?.__SURVEY_CONFIG__ ?? {};

const DEFAULT_API_BASE_URL = "/api";
const apiBaseUrl = normalizeBaseUrl(
  runtimeConfig.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);

const requestTimeoutMs = Number(
  runtimeConfig.apiTimeoutMs ?? import.meta.env.VITE_API_TIMEOUT_MS ?? 15000,
);

function normalizeBaseUrl(value) {
  if (!value) return DEFAULT_API_BASE_URL;
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function withTimeout(options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
  return {
    ...options,
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const detail = errorBody?.detail ?? response.statusText;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function request(path, options = {}) {
  const { cleanup, ...requestOptions } = withTimeout(options);
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, requestOptions);
    return await handleResponse(response);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("API request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to reach the API. Check network connectivity.");
    }
    throw error;
  } finally {
    cleanup();
  }
}

export async function fetchSurveys() {
  return request("/surveys/");
}

export async function createSurvey(payload) {
  return request("/surveys/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateSurvey(id, payload) {
  return request(`/surveys/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteSurvey(id) {
  return request(`/surveys/${id}`, { method: "DELETE" });
}
