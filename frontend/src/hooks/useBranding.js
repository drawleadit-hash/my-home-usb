import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * App branding (name, login logo, favicon) set in Super Admin → Settings →
 * Branding. Loaded once from the public /api/branding endpoint and shared by
 * every screen; Settings calls `publishBranding()` after a save so the
 * sidebar, login screen, tab title and favicon update without a reload.
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const DEFAULT_APP_NAME = 'Drawlead Construction ERP';

const DEFAULT_BRANDING = {
  app_name: DEFAULT_APP_NAME,
  logo_url: null,
  favicon_url: null,
  has_custom_logo: false,
  has_custom_favicon: false,
};

// Uploaded assets are served by the API (`/api/branding/asset/…`), which in
// local dev lives on a different origin than the frontend.
export function resolveBrandUrl(url) {
  if (!url) return url;
  return url.startsWith('/api/') ? `${BACKEND_URL}${url}` : url;
}

let cache = null;
let inflight = null;
const listeners = new Set();

function applyFavicon(url) {
  if (!url || typeof document === 'undefined') return;
  try {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  } catch { /* ignore */ }
}

export function publishBranding(data) {
  const next = {
    ...DEFAULT_BRANDING,
    ...(data || {}),
  };
  next.app_name = (next.app_name || '').trim() || DEFAULT_APP_NAME;
  next.logo_url = resolveBrandUrl(next.logo_url);
  next.favicon_url = resolveBrandUrl(next.favicon_url);
  next.favicon_512_url = resolveBrandUrl(next.favicon_512_url);
  cache = next;
  applyFavicon(next.favicon_url);
  listeners.forEach((fn) => fn(next));
  return next;
}

export function loadBranding() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = axios
    .get(`${BACKEND_URL}/api/branding`)
    .then((r) => publishBranding(r.data))
    .catch(() => cache || DEFAULT_BRANDING)
    .finally(() => { inflight = null; });
  return inflight;
}

export function useBranding() {
  const [branding, setBranding] = useState(cache || DEFAULT_BRANDING);
  useEffect(() => {
    listeners.add(setBranding);
    if (cache) setBranding(cache);
    else loadBranding();
    return () => { listeners.delete(setBranding); };
  }, []);
  return branding;
}
