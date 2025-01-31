import { useState, useEffect } from "react";

export const mobileStyles = {
  modal: {
    base: "fixed inset-0 z-50 overflow-y-auto",
    content: "relative w-full min-h-screen md:min-h-0 md:h-auto md:rounded-lg",
    header: "sticky top-0 z-10 px-4 py-3 md:py-4",
    body: "px-4 py-4 md:p-6",
    footer: "sticky bottom-0 px-4 py-3 md:py-4",
  },
  form: {
    field: "mb-4 md:mb-6",
    label: "block mb-2 text-sm font-medium",
    input: "w-full p-2 md:p-3 rounded-lg text-base md:text-sm",
    button: {
      base: "w-full md:w-auto px-4 py-2 md:py-2.5 rounded-lg text-base md:text-sm font-medium",
      primary: "bg-teal-500 text-white hover:bg-teal-600",
      secondary: "bg-gray-500 text-white hover:bg-gray-600",
    },
  },
  card: {
    base: "rounded-lg shadow-md overflow-hidden",
    header: "p-3 md:p-4",
    body: "p-3 md:p-4",
    footer: "p-3 md:p-4",
  },
};

export const getModalSize = (isMobile) => ({
  width: isMobile ? "100%" : "auto",
  maxWidth: isMobile ? "100%" : "500px",
  maxHeight: isMobile ? "100vh" : "85vh",
  margin: isMobile ? "0" : "2rem auto",
  borderRadius: isMobile ? "0" : "0.5rem",
});

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

export const buttonLayoutStyles = {
  dashboardButtons: {
    base: "flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
    mobile: "text-sm hidden md:flex md:w-[110px]", // Fixed width for consistency
    iconOnly: "md:hidden w-10 h-10 p-0", // Square aspect ratio for mobile
    label: "truncate",
  },
};
