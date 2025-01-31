import toast from "react-hot-toast";
export const validateProjectForm = (formData) => {
  const errors = {};
  if (!formData.name?.trim()) {
    errors.name = "Project name is required";
  }
  if (formData.name?.length > 100) {
    errors.name = "Project name must be less than 100 characters";
  }
  if (formData.description?.length > 500) {
    errors.description = "Description must be less than 500 characters";
  }
  return errors;
};

export const withLoading = async (operation, handleLoading, setError) => {
  handleLoading(true);
  try {
    await operation();
  } catch (err) {
    toast.error(err.message || "An error occurred");
    setError(err.message);
  } finally {
    handleLoading(false);
  }
};

export const handleApiError = (error, defaultMessage, setError, navigate) => {
  console.error("API Error:", error);
  if (error.message === "Failed to fetch") {
    toast.error("Network error. Please check your connection.");
  } else if (error.status === 401 || error.status === 403) {
    navigate("/");
  } else {
    toast.error(error.message || defaultMessage);
  }
  setError(error.message || defaultMessage);
};

export const handleLoading = (isLoading, setShowLoading, loadingTimeout) => {
  if (loadingTimeout.current) {
    clearTimeout(loadingTimeout.current);
  }

  if (isLoading) {
    loadingTimeout.current = setTimeout(() => {
      setShowLoading(true);
    }, 500); // Only show loading if operation takes more than 500ms
  } else {
    setShowLoading(false);
  }
};
