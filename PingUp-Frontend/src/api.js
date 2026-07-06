const BASE_URL = import.meta.env.VITE_API_URL || 'https://pingup-backend-1.onrender.com';

export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${cleanEndpoint}`;
}

export function apiFetch(endpoint, options = {}) {
  options.credentials = 'credentials' in options ? options.credentials : 'include';
  return fetch(getApiUrl(endpoint), options);
}
