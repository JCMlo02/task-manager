import { useCallback, useEffect, useState } from "react";
import { projectService } from "../../services/apiService";
import { useDataLoading } from "./useDataLoading";
import { CacheService } from "../../services/cacheService";

export const useProjects = (userId) => {
  const { data, isLoading, error, load } = useDataLoading();
  const [projects, setProjects] = useState(() => {
    // Initialize from cache if available
    const cached = userId ? CacheService.getProjects(userId) : [];
    return Array.isArray(cached) ? cached : [];
  });

  // Update projects when data changes
  useEffect(() => {
    if (data) {
      const validProjects = Array.isArray(data) ? data : [];
      console.log("Projects data updated:", validProjects);
      setProjects(validProjects);
      if (userId) {
        CacheService.setProjects(validProjects, userId);
      }
    }
  }, [data, userId]);

  const fetchProjects = useCallback(async () => {
    try {
      const result = await load(() => projectService.getProjects(userId), {
        useCache: true,
        updateCache: true,
        cacheKey: CacheService.CACHE_KEYS.PROJECTS,
        userId,
      });
      console.log("Fetched projects:", result);
      return result;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }, [userId, load]);

  const updateProjects = useCallback(
    (newProjects) => {
      console.log("Updating projects:", newProjects);
      const validProjects = Array.isArray(newProjects) ? newProjects : [];
      setProjects(validProjects);
      if (userId) {
        CacheService.setProjects(validProjects, userId);
      }
    },
    [userId]
  );

  return {
    projects,
    setProjects: updateProjects,
    isFetchingProjects: isLoading,
    error,
    fetchProjects,
  };
};
