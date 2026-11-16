// Production uses the host's API proxy (Vercel rewrites or nginx).
// Keep the explicit backend URL for local development only.
export const API_BASE = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_BASE_URL || "");
