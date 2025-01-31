import React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { TASK_STATUSES } from "../../../constants";
import { FaChartBar, FaChartPie, FaChartLine } from "react-icons/fa";
import BackButton from "../../common/BackButton";
import { useMediaQuery, BREAKPOINTS } from '../../../styles/responsive';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AnalyticsDashboard = ({
  tasks,
  projects,
  isDarkMode,
  onClose,
}) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);
  const [activeTab, setActiveTab] = React.useState("overview");

  const calculateMetrics = () => {
    // Calculate tasks by status
    const statusCounts = {
      BACKLOG: tasks.filter((task) => task.status === "BACKLOG").length,
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      IN_TESTING: tasks.filter((task) => task.status === "IN_TESTING").length,
      DONE: tasks.filter((task) => task.status === "DONE").length,
    };

    const totalTasks = tasks.length;

    // Calculate task distribution by project with all statuses
    const tasksByProject = projects.map((project) => ({
      name:
        project.name.substring(0, 15) + (project.name.length > 15 ? "..." : ""),
      total: tasks.filter((task) => task.project_id === project.project_id)
        .length,
      backlog: tasks.filter(
        (task) =>
          task.project_id === project.project_id && task.status === "BACKLOG"
      ).length,
      inProgress: tasks.filter(
        (task) =>
          task.project_id === project.project_id &&
          task.status === "IN_PROGRESS"
      ).length,
      inTesting: tasks.filter(
        (task) =>
          task.project_id === project.project_id && task.status === "IN_TESTING"
      ).length,
      completed: tasks.filter(
        (task) =>
          task.project_id === project.project_id && task.status === "DONE"
      ).length,
    }));

    // Calculate trend data including all statuses
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      })
      .reverse();

    const statusTrends = last7Days.map((date) => ({
      date,
      backlog: tasks.filter(
        (task) =>
          task.status === "BACKLOG" && task.created_at?.split("T")[0] === date
      ).length,
      inProgress: tasks.filter(
        (task) =>
          task.status === "IN_PROGRESS" &&
          task.updated_at?.split("T")[0] === date
      ).length,
      inTesting: tasks.filter(
        (task) =>
          task.status === "IN_TESTING" &&
          task.updated_at?.split("T")[0] === date
      ).length,
      completed: tasks.filter(
        (task) =>
          task.status === "DONE" && task.updated_at?.split("T")[0] === date
      ).length,
    }));

    // Calculate velocities for different stages
    const velocities = {
      completion: statusTrends.reduce((sum, day) => sum + day.completed, 0) / 7,
      testing: statusTrends.reduce((sum, day) => sum + day.inTesting, 0) / 7,
      progress: statusTrends.reduce((sum, day) => sum + day.inProgress, 0) / 7,
    };

    return {
      totalTasks,
      statusCounts,
      tasksByProject,
      statusTrends,
      velocities,
      completionRate: totalTasks
        ? Math.round((statusCounts.DONE / totalTasks) * 100)
        : 0,
    };
  };

  const metrics = calculateMetrics();

  const getTaskStatusData = () => {
    return Object.entries(TASK_STATUSES).map(([key, value]) => ({
      name: value,
      value: tasks.filter((task) => task.status === key).length,
    }));
  };

  const StatCard = ({ title, value, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${isDarkMode ? "bg-slate-800" : "bg-white"}
        rounded-lg shadow-lg
        ${isMobile ? "p-4" : "p-6"}
      `}
    >
      <h3
        className={`text-sm font-medium ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {title}
      </h3>
      <p
        className={`
        ${isMobile ? "text-2xl" : "text-3xl"}
        font-bold mt-2
        ${isDarkMode ? "text-white" : "text-gray-900"}
      `}
      >
        {value}
      </p>
      {subtitle && (
        <p
          className={`text-sm mt-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );

  const tabStyle = (isActive) => `
    ${
      isDarkMode
        ? isActive
          ? "bg-gray-700 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        : isActive
        ? "bg-teal-500 text-white"
        : "bg-white text-gray-600 hover:bg-gray-50"
    }
    px-4 py-2 rounded-lg flex items-center gap-2 transition-all
  `;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 overflow-hidden flex justify-center"
      style={{ marginTop: '64px' }} 
    >
      {/* Semi-transparent backdrop */}
      <div
        className={`absolute inset-0 ${
          isDarkMode ? "bg-black/70" : "bg-black/50"
        } backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Main modal container */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
        {/* Fixed header */}
        <div
          className={`
            sticky top-0 z-20 border-b
            ${
              isDarkMode
                ? "bg-gray-900/95 border-gray-700"
                : "bg-gray-50/95 border-gray-200"
            }
            backdrop-blur-md
          `}
        >
          <div className="px-6 py-4">
            {/* Header content */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <BackButton onClick={onClose} isDarkMode={isDarkMode} />
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Analytics Dashboard
                </h2>
              </div>
            </div>

            {/* Tabs */}
            <div
              className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`}
            >
              <button
                className={tabStyle(activeTab === "overview")}
                onClick={() => setActiveTab("overview")}
              >
                <FaChartBar /> Overview
              </button>
              <button
                className={tabStyle(activeTab === "performance")}
                onClick={() => setActiveTab("performance")}
              >
                <FaChartLine /> Performance Metrics
              </button>
              <button
                className={tabStyle(activeTab === "distribution")}
                onClick={() => setActiveTab("distribution")}
              >
                <FaChartPie /> Task Distribution
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 h-full">
          <div
            className={`
              rounded-lg h-full
              ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}
              shadow-lg
            `}
          >
            {activeTab === "overview" && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Tasks"
                  value={metrics.totalTasks}
                  subtitle="Across all projects"
                />
                <StatCard
                  title="Completion Rate"
                  value={`${metrics.completionRate}%`}
                  subtitle={`${metrics.statusCounts.DONE} tasks completed`}
                />
                <StatCard
                  title="In Progress"
                  value={metrics.statusCounts.IN_PROGRESS}
                  subtitle={`${metrics.velocities.progress.toFixed(
                    1
                  )} tasks/day`}
                />
                <StatCard
                  title="In Testing"
                  value={metrics.statusCounts.IN_TESTING}
                  subtitle={`${metrics.velocities.testing.toFixed(
                    1
                  )} tasks/day`}
                />
              </div>
            )}

            {activeTab === "performance" && (
              <div className="p-6 space-y-8">
                <div
                  className={`bg-opacity-50 rounded-lg p-6 border border-opacity-10
                  ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-6 ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Task Status Trends
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.statusTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="backlog"
                          fill="#FF8042"
                          name="Backlog"
                        />
                        <Bar
                          dataKey="inProgress"
                          fill="#FFBB28"
                          name="In Progress"
                        />
                        <Bar
                          dataKey="inTesting"
                          fill="#00C49F"
                          name="In Testing"
                        />
                        <Bar
                          dataKey="completed"
                          fill="#0088FE"
                          name="Completed"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div
                  className={`bg-opacity-50 rounded-lg p-6 border border-opacity-10
                  ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-6 ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Project Status Distribution
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.tasksByProject}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="backlog"
                          fill="#FF8042"
                          name="Backlog"
                          stackId="stack"
                        />
                        <Bar
                          dataKey="inProgress"
                          fill="#FFBB28"
                          name="In Progress"
                          stackId="stack"
                        />
                        <Bar
                          dataKey="inTesting"
                          fill="#00C49F"
                          name="In Testing"
                          stackId="stack"
                        />
                        <Bar
                          dataKey="completed"
                          fill="#0088FE"
                          name="Completed"
                          stackId="stack"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "distribution" && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    ${isDarkMode ? "bg-slate-800" : "bg-white"}
                    rounded-lg shadow-lg
                    ${isMobile ? "p-4" : "p-6"}
                    h-[300px]
                  `}
                >
                  <h3
                    className={`text-sm font-medium mb-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Task Status Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTaskStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getTaskStatusData().map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    ${isDarkMode ? "bg-slate-800" : "bg-white"}
                    rounded-lg shadow-lg
                    ${isMobile ? "p-4" : "p-6"}
                    h-[300px]
                  `}
                >
                  <h3
                    className={`text-sm font-medium mb-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Tasks by Project
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metrics.tasksByProject}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#0088FE"
                        name="Total Tasks"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#00C49F"
                        name="Completed"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="inProgress"
                        stroke="#FFBB28"
                        name="In Progress"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
