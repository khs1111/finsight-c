// Centralize API base resolution for consistency across modules
const fromVite = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || '';
const fromNext = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) || '';
const fromCra  = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) || '';

const PROD_DEFAULT = 'https://finsight.o-r.kr/api';
const DEV_DEFAULT  = 'http://localhost:8081/api';

// Detect local environment (best-effort)
const isLocal = typeof window !== 'undefined'
  ? /^(localhost|127\.0\.0\.1)/.test(window.location.hostname)
  : false;

const resolvedBase = (fromVite || fromNext || fromCra || '').replace(/\/$/, '');
export const API_BASE = resolvedBase || (isLocal ? DEV_DEFAULT : PROD_DEFAULT);

// Optional separate base for the News service; falls back to API_BASE if not provided
const fromViteNews = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEWS_API_BASE) || '';
const fromNextNews = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_NEWS_API_BASE) || '';
const fromCraNews  = (typeof process !== 'undefined' && process.env?.REACT_APP_NEWS_API_BASE) || '';

const resolvedNews = (fromViteNews || fromNextNews || fromCraNews || '').replace(/\/$/, '');
export const NEWS_API_BASE = resolvedNews || API_BASE;
