export const groupTasksByStatus = (tasks) => {
  const grouped = {
    BACKLOG: [],
    IN_PROGRESS: [],
    IN_TESTING: [],
    DONE: [],
  };

  tasks.forEach((task) => {
    const status = task.status || "BACKLOG";
    grouped[status].push(task);
  });

  return grouped;
};

export const withLoading = async (operation, setIsLoading, toast) => {
  setIsLoading(true);
  try {
    await operation();
    toast.success("Operation completed successfully!");
  } catch (err) {
    toast.error(err.message || "An error occurred");
  } finally {
    setIsLoading(false);
  }
};
