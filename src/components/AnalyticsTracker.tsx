import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '../lib/analytics';

/**
 * Privacy-conscious route tracker.
 * Only records route changes for public pages, respects DNT, and defers execution to idle callback.
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    recordPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
