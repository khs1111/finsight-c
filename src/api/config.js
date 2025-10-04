// Centralize API base resolution for consistency across modules
export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8081/api';

// Optional separate base for the News service; falls back to API_BASE if not provided
export const NEWS_API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEWS_API_BASE) ||
  process.env.REACT_APP_NEWS_API_BASE ||
  API_BASE;
