// Utilities to handle base path and asset URL resolution for nested routes and static hosting.

export const getBasePath = () => {
  if (typeof window === 'undefined') return '/';
  const host = window.location?.hostname || '';
  // When hosted on GitHub Pages under khs1111.github.io/finsight-c, serve under '/finsight-c/'
  if (/github\.io$/i.test(host)) return '/finsight-c/';
  // Default (Vercel, localhost): root
  return '/';
};

export const resolveAssetUrl = (u) => {
  if (!u) return u;
  // Leave full URLs untouched
  if (/^https?:\/\//i.test(u)) return u;
  const base = getBasePath();
  // Normalize to avoid duplicate slashes
  const trimmed = u.startsWith('/') ? u.slice(1) : u;
  // If already includes the base (e.g., '/finsight-c/static/...'), avoid double-prefix
  if (trimmed.startsWith(base.replace(/^\//, ''))) {
    return base + trimmed.slice(base.replace(/^\//, '').length);
  }
  return base + trimmed;
};
