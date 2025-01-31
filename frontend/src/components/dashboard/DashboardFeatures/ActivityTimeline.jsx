import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { isToday, isYesterday, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz"; // Add this import
import {
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaCalendar,
  FaList,
  FaUsers,
  FaPlusCircle,
} from "react-icons/fa";
import BackButton from "../../common/BackButton";

// Constants for timeline
const TIME_GROUPS = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  OLDER: "Older",
};

const getTimeGroup = (timestamp) => {
  if (isToday(new Date(timestamp))) return TIME_GROUPS.TODAY;
  if (isYesterday(new Date(timestamp))) return TIME_GROUPS.YESTERDAY;
  return TIME_GROUPS.OLDER;
};


const ActivityTimeline = ({ projects, tasks, isDarkMode, onClose }) => {
  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("week");

  const getDateRange = (range) => {
    const now = new Date();
    const ranges = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
    };
    return ranges[range] || ranges.week;
  };

  const filteredActivities = useMemo(() => {
    const startDate = getDateRange(timeRange);
    let allActivities = [];

    if (filter === "all" || filter === "tasks") {
      // Task activities
      allActivities.push(
        ...tasks.flatMap((task) => {
          if (!task) return []; // Skip if task is invalid

          const projectName =
            projects.find((p) => p.project_id === task.project_id)?.name ||
            "Unknown Project";
          const activities = [];

          // Only add activities if we have valid task data
          if (task.task_id && task.name) {
            // Task creation
            if (task.created_at) {
              activities.push({
                id: `task_created_${task.task_id}`,
                type: "task",
                subtype: "task_created",
                timestamp: task.created_at,
                description: `Created task "${task.name}" in "${projectName}"`,
                projectId: task.project_id,
                creator: task.creator_username,
                taskId: task.task_id,
                taskName: task.name,
              });
            }

            // Task status changes
            if (task.status_updates && Array.isArray(task.status_updates)) {
              activities.push(
                ...task.status_updates
                  .filter(
                    (update) => update && update.timestamp && update.status
                  )
                  .map((update) => ({
                    id: `task_updated_${task.task_id}_${update.timestamp}`,
                    type: "task",
                    subtype: "task_updated",
                    timestamp: update.timestamp,
                    description: `Updated task "${task.name}" status to ${update.status}`,
                    projectId: task.project_id,
                    taskId: task.task_id,
                    taskName: task.name,
                    status: update.status,
                  }))
              );
            }

            // Task completion
            if (task.status === "DONE" && task.updated_at) {
              activities.push({
                id: `task_completed_${task.task_id}`,
                type: "task",
                subtype: "task_completed",
                timestamp: task.updated_at,
                description: `Completed task "${task.name}"`,
                projectId: task.project_id,
                taskId: task.task_id,
                taskName: task.name,
              });
            }
          }

          return activities;
        })
      );
    }

    if (filter === "all" || filter === "projects") {
      allActivities.push(
        ...projects.flatMap((project) => {
          if (!project || !project.project_id || !project.name) return [];

          const activities = [];

          if (project.created_at) {
            activities.push({
              id: `project_created_${project.project_id}`,
              type: "project",
              subtype: "project_created",
              timestamp: project.created_at,
              description: `Created project "${project.name}"`,
              projectId: project.project_id,
              creator: project.creator_username,
              projectName: project.name,
            });
          }

          if (project.members && Array.isArray(project.members)) {
            activities.push(
              ...project.members
                .filter(
                  (member) =>
                    member &&
                    member.user_id &&
                    member.username &&
                    member.joined_at
                )
                .map((member) => ({
                  id: `member_joined_${project.project_id}_${member.user_id}`,
                  type: "project",
                  subtype: "member_joined",
                  timestamp: member.joined_at,
                  description: `${member.username} joined "${project.name}"`,
                  projectId: project.project_id,
                  memberId: member.user_id,
                  memberName: member.username,
                  projectName: project.name,
                }))
            );
          }

          return activities;
        })
      );
    }

    return allActivities
      .filter((activity) => {
        if (!activity || !activity.timestamp) return false;
        const activityDate = new Date(activity.timestamp);
        return !isNaN(activityDate) && activityDate >= startDate;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [filter, timeRange, tasks, projects]);

  const groupedActivities = useMemo(() => {
    const groups = {
      [TIME_GROUPS.TODAY]: [],
      [TIME_GROUPS.YESTERDAY]: [],
      [TIME_GROUPS.OLDER]: [],
    };

    filteredActivities.forEach((activity) => {
      const group = getTimeGroup(activity.timestamp);
      groups[group].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 overflow-hidden flex justify-center"
      style={{ marginTop: '64px' }} // Add top margin to account for navbar
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${
          isDarkMode ? "bg-black/70" : "bg-black/50"
        } backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Main container - Adjust position and overflow */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
        <div
          className={`
            sticky top-0 z-10 p-4
            ${isDarkMode ? "bg-gray-900/95" : "bg-gray-50/95"}
            backdrop-blur-md border-b
            ${isDarkMode ? "border-gray-700" : "border-gray-200"}
          `}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <BackButton onClick={onClose} isDarkMode={isDarkMode} />
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Activity Timeline
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div
            className={`flex flex-wrap gap-4 items-center ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaFilter />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`
                  rounded-lg px-3 py-2
                  ${
                    isDarkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-800 border-gray-200"
                  }
                  border
                `}
              >
                <option value="all">All Activities</option>
                <option value="tasks">Tasks Only</option>
                <option value="projects">Projects Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FaCalendar />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`
                  rounded-lg px-3 py-2
                  ${
                    isDarkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-800 border-gray-200"
                  }
                  border
                `}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable content - Adjust height */}
        <div className="flex-1 overflow-y-auto p-4 h-full">
          <div
            className={`
              rounded-lg h-full
              ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}
              shadow-lg
            `}
          >
            <div className="p-6 space-y-6">
              {Object.entries(groupedActivities).map(
                ([timeGroup, groupActivities]) =>
                  groupActivities.length > 0 ? (
                    <TimelineGroup
                      key={timeGroup}
                      date={timeGroup}
                      activities={groupActivities}
                      isDarkMode={isDarkMode}
                    />
                  ) : null
              )}

              {Object.values(groupedActivities).every(
                (group) => group.length === 0
              ) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <p>No activities found for the selected filters</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TimelineGroup = ({ date, activities, isDarkMode }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <FaClock />
      {date}
    </h3>
    <div className="space-y-3 pl-6">
      {activities.map((activity, index) => (
        <TimelineItem key={index} activity={activity} isDarkMode={isDarkMode} />
      ))}
    </div>
  </div>
);

const TimelineItem = ({ activity, isDarkMode }) => {
  const getActivityIcon = (activity) => {
    switch (activity.subtype) {
      case "project_created":
        return <FaList className="text-blue-500" />;
      case "member_joined":
        return <FaUsers className="text-green-500" />;
      case "task_created":
        return <FaPlusCircle className="text-purple-500" />;
      case "task_completed":
        return <FaCheckCircle className="text-green-500" />;
      case "task_updated":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  // Add safe date parsing with timezone handling
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      // Get user's timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Format the date in user's local timezone
      return formatInTimeZone(date, timeZone, "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Date parsing error:", error);
      return "Invalid date";
    }
  };

  return (
    <div
      className={`
      p-4 rounded-lg
      ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}
    `}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex items-start gap-4 p-4 rounded-lg
          ${isDarkMode ? "bg-gray-800" : "bg-white"}
          ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}
          transition-colors duration-200
        `}
      >
        <div
          className={`
          p-2 rounded-full
          ${
            isDarkMode
              ? "bg-gray-700 text-teal-400"
              : "bg-teal-100 text-teal-600"
          }
        `}
        >
          {getActivityIcon(activity)}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {activity.description}
          </p>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formatDate(activity.timestamp)}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityTimeline;
