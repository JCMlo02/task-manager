import { useCallback, useRef } from 'react';


export const useDataFetching = (API_URL, handleLoading, sub, handleApiError) => {
  const requestTracker = useRef({
    inFlight: new Set(),
    lastFetch: {
      projects: 0,
      tasks: 0,
      invites: 0,
    },
  });

  const fetchWithTracking = useCallback(async (key, force, fetchFn) => {
    if (requestTracker.current.inFlight.has(key)) {
      return null;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - requestTracker.current.lastFetch[key];
    if (!force && timeSinceLastFetch < 60000) { // 1 minute
      return null;
    }

    try {
      requestTracker.current.inFlight.add(key);
      handleLoading(true);
      const result = await fetchFn();
      return result;
    } finally {
      requestTracker.current.lastFetch[key] = Date.now();
      requestTracker.current.inFlight.delete(key);
      handleLoading(false);
    }
  }, [handleLoading]);

  return { fetchWithTracking };
};
