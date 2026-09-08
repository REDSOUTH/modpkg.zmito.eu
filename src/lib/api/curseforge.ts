/**
 * CurseForge Proxy API Client
 * Requests route through the /api/curseforge serverless proxy,
 * keeping the CURSEFORGE_API_KEY secure on the server (Vercel / Vite dev).
 */

export const CURSEFORGE_PROXY_BASE = "/api/curseforge";

export function getCurseforgeProxyUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${CURSEFORGE_PROXY_BASE}${cleanPath}`;
}
