import { useState, useRef, useCallback, useEffect } from 'react';

export const useLoadingState = () => {
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimeout = useRef(null);

  const handleLoading = useCallback((isLoading) => {
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    if (isLoading) {
      loadingTimeout.current = setTimeout(() => {
        setShowLoading(true);
      }, 500);
    } else {
      setShowLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return { showLoading, handleLoading };
};
