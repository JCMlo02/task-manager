import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = ({ tasks, projects, isDarkMode }) => {
  // Remove unused state
  const [tasksByStatus, setTasksByStatus] = useState({});
  const [tasksTrend, setTasksTrend] = useState([]);
  const [projectMetrics, setProjectMetrics] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Move useCallback definition to top level
  const processData = useCallback(() => {
    if (!tasks || !projects) return;

    // Process tasks by status
    const statusCount = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    setTasksByStatus(statusCount);

    // Process tasks trend (last 7 days)
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      })
      .reverse();

    const trendData = last7Days.map((date) => ({
      date,
      count: tasks.filter(
        (task) =>
          task.created_at?.startsWith(date) || task.updated_at?.startsWith(date)
      ).length,
    }));
    setTasksTrend(trendData);

    // Process project metrics
    const metrics = projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.project_id === project.project_id
      );
      return {
        name: project.name,
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter((task) => task.status === "DONE")
          .length,
        inProgress: projectTasks.filter((task) => task.status === "IN_PROGRESS")
          .length,
      };
    });
    setProjectMetrics(metrics);

    setIsLoading(false);
  }, [tasks, projects]);

  // Move chart data preparation to useEffect
  useEffect(() => {
    if (!tasksTrend.length) return;

    const data = {
      labels: tasksTrend.map((item) => item.date),
      datasets: [
        {
          label: "Task Activity",
          data: tasksTrend.map((item) => item.count),
          borderColor: isDarkMode ? "rgb(99, 102, 241)" : "rgb(59, 130, 246)",
          backgroundColor: isDarkMode
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(59, 130, 246, 0.5)",
        },
      ],
    };
    setChartData(data);
  }, [tasksTrend, isDarkMode]);

  // Process data when tasks or projects change
  useEffect(() => {
    processData();
  }, [processData]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#e2e8f0" : "#1e293b",
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: isDarkMode ? "#e2e8f0" : "#1e293b",
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? "#e2e8f0" : "#1e293b",
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Task Status Distribution */}
      <div
        className={`p-6 rounded-xl shadow-lg ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          Task Distribution
        </h3>
        {Object.keys(tasksByStatus).length > 0 && (
          <Pie
            data={{
              labels: Object.keys(tasksByStatus),
              datasets: [
                {
                  data: Object.values(tasksByStatus),
                  backgroundColor: [
                    "rgba(99, 102, 241, 0.5)",
                    "rgba(59, 130, 246, 0.5)",
                    "rgba(245, 158, 11, 0.5)",
                    "rgba(16, 185, 129, 0.5)",
                  ],
                },
              ],
            }}
            options={options}
          />
        )}
      </div>

      {/* Task Trend */}
      <div
        className={`p-6 rounded-xl shadow-lg ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          Task Activity Trend
        </h3>
        {chartData && <Line data={chartData} options={options} />}
      </div>

      {/* Project Progress */}
      <div
        className={`p-6 rounded-xl shadow-lg ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          Project Progress
        </h3>
        {projectMetrics.length > 0 && (
          <Bar
            data={{
              labels: projectMetrics.map((p) => p.name),
              datasets: [
                {
                  label: "Total Tasks",
                  data: projectMetrics.map((p) => p.totalTasks),
                  backgroundColor: "rgba(99, 102, 241, 0.5)",
                },
                {
                  label: "Completed",
                  data: projectMetrics.map((p) => p.completedTasks),
                  backgroundColor: "rgba(16, 185, 129, 0.5)",
                },
              ],
            }}
            options={options}
          />
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
