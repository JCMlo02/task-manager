import { useState } from 'react';

export const useDashboardState = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("isDarkMode") === "true"
  );
  const [error, setError] = useState(null);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [analyticsView, setAnalyticsView] = useState('weekly');
  const [selectedMetrics, setSelectedMetrics] = useState([
    'taskCompletion',
    'projectProgress'
  ]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  return {
    isDarkMode,
    setIsDarkMode,
    error,
    setError,
    isFetchingProjects,
    setIsFetchingProjects,
    analyticsView,
    setAnalyticsView,
    selectedMetrics,
    setSelectedMetrics,
    dateRange,
    setDateRange,
  };
};
