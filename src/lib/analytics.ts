/**
 * Privacy-Conscious Analytics for Rotaract Club of Lead India Ahead (LIA)
 * 
 * Guiding Principles:
 * 1. Zero third-party tracker scripts, zero marketing pixels, zero cookies.
 * 2. Never collects IP addresses, geolocation, device fingerprints, or PII.
 * 3. Never tracks auth tokens, form inputs, query strings, or administrative routes.
 * 4. Strictly respects Do Not Track (DNT) header and navigator preference.
 * 5. Minimal rolling retention window (30 days maximum, capped at 500 local entries).
 */

export interface PageViewEvent {
  id: string;
  path: string;
  timestamp: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  referrerCategory: 'direct' | 'search' | 'social' | 'internal';
}

export interface AnalyticsSummary {
  totalViews: number;
  topPages: { path: string; count: number }[];
  devices: { desktop: number; mobile: number; tablet: number };
  sources: { direct: number; search: number; social: number; internal: number };
  recentViews: PageViewEvent[];
  dntActive: boolean;
}

const STORAGE_KEY = 'lia_privacy_analytics_v1';
const MAX_EVENTS = 500;
const RETENTION_DAYS = 30;

function isDNTEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    navigator.doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  );
}

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getReferrerCategory(): 'direct' | 'search' | 'social' | 'internal' {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';
  try {
    const refUrl = new URL(document.referrer);
    const currentHost = window.location.hostname;
    if (refUrl.hostname === currentHost) return 'internal';

    const searchEngines = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'ecosia.', 'baidu.'];
    if (searchEngines.some(se => refUrl.hostname.includes(se))) return 'search';

    const socialNetworks = ['instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 't.co', 'youtube.com', 'whatsapp.com'];
    if (socialNetworks.some(sn => refUrl.hostname.includes(sn))) return 'social';

    return 'direct';
  } catch {
    return 'direct';
  }
}

function normalizePath(rawPath: string): string {
  // Strip query strings and hashes to prevent leaking sensitive params
  const clean = rawPath.split('?')[0].split('#')[0] || '/';
  // Standardize trailing slash
  return clean === '' ? '/' : clean;
}

export function recordPageView(rawPath: string): void {
  if (typeof window === 'undefined') return;
  if (isDNTEnabled()) {
    return;
  }

  const path = normalizePath(rawPath);

  // Exclude admin and internal auth routes from public analytics
  if (path.startsWith('/admin') || path.startsWith('/api')) {
    return;
  }

  const defer = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));

  defer(() => {
    try {
      const now = new Date();
      const cutoffTime = now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: PageViewEvent[] = raw ? JSON.parse(raw) : [];

      // Filter expired events
      const valid = existing.filter(e => new Date(e.timestamp).getTime() > cutoffTime);

      const newEvent: PageViewEvent = {
        id: Math.random().toString(36).substring(2, 9),
        path,
        timestamp: now.toISOString(),
        deviceType: getDeviceType(),
        referrerCategory: getReferrerCategory(),
      };

      valid.push(newEvent);

      // Enforce rolling buffer cap
      const trimmed = valid.slice(-MAX_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Storage unavailable or full, fail silently
    }
  });
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const dntActive = isDNTEnabled();
  if (typeof window === 'undefined') {
    return {
      totalViews: 0,
      topPages: [],
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      sources: { direct: 0, search: 0, social: 0, internal: 0 },
      recentViews: [],
      dntActive,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events: PageViewEvent[] = raw ? JSON.parse(raw) : [];

    const pathCounts: Record<string, number> = {};
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    const sources = { direct: 0, search: 0, social: 0, internal: 0 };

    for (const evt of events) {
      pathCounts[evt.path] = (pathCounts[evt.path] || 0) + 1;
      if (evt.deviceType in devices) {
        devices[evt.deviceType]++;
      }
      if (evt.referrerCategory in sources) {
        sources[evt.referrerCategory]++;
      }
    }

    const topPages = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalViews: events.length,
      topPages,
      devices,
      sources,
      recentViews: events.slice(-20).reverse(),
      dntActive,
    };
  } catch {
    return {
      totalViews: 0,
      topPages: [],
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      sources: { direct: 0, search: 0, social: 0, internal: 0 },
      recentViews: [],
      dntActive,
    };
  }
}

export function clearAnalyticsData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore error
  }
}
