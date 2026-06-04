/**
 * API Service — Real HTTP client for backend communication.
 * Uses fetch with JWT Bearer token from localStorage.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Token helpers ───
export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

// ─── Core fetch wrapper ───
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ───────────────────────────────────────────
//  AUTH
// ───────────────────────────────────────────

export async function apiRegister(email, password, name) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  if (data.data?.token) {
    setToken(data.data.token);
  }
  return data;
}

export async function apiLogin(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.data?.token) {
    setToken(data.data.token);
  }
  return data;
}

export async function apiGetMe() {
  return request('/auth/me');
}

export function apiLogout() {
  removeToken();
}

// ───────────────────────────────────────────
//  WORKFLOWS
// ───────────────────────────────────────────

export async function apiGetWorkflows() {
  return request('/workflows');
}

export async function apiGetWorkflow(id) {
  return request(`/workflows/${id}`);
}

export async function apiCreateWorkflow(workflowData) {
  return request('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflowData),
  });
}

export async function apiUpdateWorkflow(id, workflowData) {
  return request(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workflowData),
  });
}

export async function apiDeleteWorkflow(id) {
  return request(`/workflows/${id}`, {
    method: 'DELETE',
  });
}

// ───────────────────────────────────────────
//  RUNS (Execution)
// ───────────────────────────────────────────

export async function apiStartRun(workflowId) {
  return request(`/runs/${workflowId}/run`, {
    method: 'POST',
  });
}

export async function apiStepRun(runId) {
  return request(`/runs/${runId}/step`, {
    method: 'POST',
  });
}

export async function apiPauseRun(runId) {
  return request(`/runs/${runId}/pause`, {
    method: 'POST',
  });
}

export async function apiResetRun(runId) {
  return request(`/runs/${runId}/reset`, {
    method: 'POST',
  });
}

export async function apiGetRun(runId) {
  return request(`/runs/${runId}`);
}

export async function apiGetRunHistory(workflowId) {
  return request(`/runs/workflow/${workflowId}`);
}

// ───────────────────────────────────────────
//  TOOLS
// ───────────────────────────────────────────

export async function apiGetTools() {
  return request('/tools');
}

export async function apiGetToolById(id) {
  return request(`/tools/${id}`);
}

// ───────────────────────────────────────────
//  HEALTH
// ───────────────────────────────────────────

export async function apiHealthCheck() {
  return request('/health');
}
