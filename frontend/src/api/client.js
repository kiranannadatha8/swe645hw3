const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const detail = errorBody?.detail ?? response.statusText;
    throw new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail)
    );
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function fetchSurveys() {
  const response = await fetch(`${API_BASE_URL}/surveys/`);
  return handleResponse(response);
}

export async function createSurvey(payload) {
  const response = await fetch(`${API_BASE_URL}/surveys/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateSurvey(id, payload) {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteSurvey(id) {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}
