import { useState, useCallback } from 'react';
import { CacheService } from '../../services/cacheService';

export const useDataLoading = () => {
  const [state, setState] = useState({
    data: null,
    isLoading: false,
    error: null,
  });

  const load = useCallback(async (loadFn, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      useCache = true, 
      updateCache = true,
      cacheKey,
      userId 
    } = options;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try to get from cache first if enabled
      if (useCache && cacheKey && userId) {
        const cachedData = CacheService.getItem(cacheKey, userId);
        if (cachedData) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false
          }));
        }
      }

      // Call the load function
      const result = await loadFn();

      // Update cache if needed
      if (updateCache && cacheKey && userId) {
        CacheService.setItem(cacheKey, result, userId);
      }

      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        error: null
      }));

      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      console.error('Data loading error:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
      if (onError) onError(error);
      throw error;
    }
  }, []);

  return {
    ...state,
    load
  };
};
