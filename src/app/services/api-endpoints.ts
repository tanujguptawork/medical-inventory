import { environment } from '../../environments/environment';

/**
 * Centralized API endpoints for the application.
 * Services should import from here instead of hardcoding URLs.
 */
export const API_BASE = environment.apiUrl;

export const API_ENDPOINTS = {
  base: API_BASE,
  auditLogs: `${API_BASE}/audit-logs`,
  users: `${API_BASE}/users`,
  medicines: `${API_BASE}/medicines`,
  auth: `${API_BASE}/auth`,
};

export default API_ENDPOINTS;
