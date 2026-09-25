async function apiRequest(path, options = {}) {
  const response = await fetch(`${window.API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.mensaje || 'No se pudo completar la solicitud.');
  return payload;
}

window.api = {
  health: () => apiRequest('/api/health'),
  missions: () => apiRequest('/api/misiones'),
  students: () => apiRequest('/api/estudiantes'),
  student: (carnet) => apiRequest(`/api/estudiantes/${encodeURIComponent(carnet)}`),
  save: (body) => apiRequest('/api/registro', { method: 'POST', body: JSON.stringify(body) })
};
