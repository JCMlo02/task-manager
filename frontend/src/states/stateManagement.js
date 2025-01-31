import { useState, useEffect, useCallback } from "react";
import { useDashboardState } from "./dashboardState";
import { useFormState } from "./formState";
import { useModalState } from "./modalState";
import { useSelectedState } from "./selectedState";

export const useAppState = () => {
  // Add auth state
  const [sub, setSub] = useState(null);
  const [user, setUser] = useState(null);
  const [isSessionValid, setIsSessionValid] = useState(false);

  // Get other state from custom hooks
  const dashboardState = useDashboardState();
  const formState = useFormState();
  const modalState = useModalState();
  const selectedState = useSelectedState();

  // Add last login check to avoid constant redirects
  useEffect(() => {
    const lastLoginCheck = localStorage.getItem('lastLoginCheck');
    const now = Date.now();
    
    if (lastLoginCheck && (now - parseInt(lastLoginCheck)) < 1000) {
      // Skip auth check if we just logged in
      return;
    }
    
    // Update last login check timestamp
    localStorage.setItem('lastLoginCheck', now.toString());
    
    const checkPersistedAuth = () => {
      try {
        const persistedSub = localStorage.getItem('userSub');
        const persistedUser = JSON.parse(localStorage.getItem('userData'));
        
        if (persistedSub && persistedUser) {
          console.log('Found persisted auth data');
          setSub(persistedSub);
          setUser(persistedUser);
          setIsSessionValid(true);
        }
      } catch (error) {
        console.error('Error checking persisted auth:', error);
      }
    };

    checkPersistedAuth();
  }, []);

  // Update session validation
  const validateSession = useCallback(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const persistedSub = localStorage.getItem('userSub');
    const persistedUser = localStorage.getItem('userData');
    const isValid = isAuthenticated && !!sub && !!user && !!persistedSub && !!persistedUser;
    setIsSessionValid(isValid);
    return isValid;
  }, [sub, user]);

  // Add effect to validate session on mount
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Return combined state
  return {
    // Auth state
    sub,
    setSub,
    user,
    setUser,
    isSessionValid,
    setIsSessionValid,
    validateSession,
    
    // Other state
    ...dashboardState,
    ...formState,
    ...modalState,
    ...selectedState,
  };
};
