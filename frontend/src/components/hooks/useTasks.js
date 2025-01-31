import { useState, useCallback } from 'react';
import { taskService } from "../../services/apiService";
import { CacheService } from "../../services/cacheService";

export const useTasks = (userId) => {
  const [taskState, setTaskState] = useState({
    allTasks: [],
    isLoading: false,
    error: null
  });

  const fetchAllTasks = useCallback(async () => {
    try {
      setTaskState(prev => ({ ...prev, isLoading: true }));
      
      // Try cache first
      const cachedTasks = CacheService.getTasks(userId);
      if (cachedTasks) {
        setTaskState(prev => ({
          ...prev,
          allTasks: cachedTasks,
          isLoading: false
        }));
      }

      // Make API call
      const tasks = await taskService.getAllTasks(userId);
      
      // Merge with cache and update state
      const mergedTasks = CacheService.mergeWithCache(tasks || [], userId);
      setTaskState(prev => ({
        ...prev,
        allTasks: mergedTasks,
        isLoading: false,
        error: null
      }));

      return mergedTasks;
    } catch (error) {
      setTaskState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
      throw error;
    }
  }, [userId]);

  const updateTaskState = useCallback((newState) => {
    setTaskState(prev => {
      // If it's a function, call it with current state
      const nextState = typeof newState === 'function' 
        ? newState(prev)
        : newState;

      // Ensure we're not losing any tasks
      if (!nextState.allTasks || !Array.isArray(nextState.allTasks)) {
        console.warn('Invalid task state update:', nextState);
        return prev;
      }

      // Update cache with new tasks
      CacheService.setItem(
        CacheService.CACHE_KEYS.TASKS,
        nextState.allTasks,
        userId
      );

      return {
        ...prev,
        ...nextState,
        // Ensure allTasks is always an array
        allTasks: Array.isArray(nextState.allTasks) ? nextState.allTasks : []
      };
    });
  }, [userId]);

  return {
    taskState,
    setTaskState: updateTaskState,
    fetchAllTasks,
  };
};
