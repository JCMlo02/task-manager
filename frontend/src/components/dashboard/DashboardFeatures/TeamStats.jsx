import React, { useMemo } from 'react';
import { FaUsers, FaTasks, FaCheckCircle, FaHourglass } from "react-icons/fa";
import BackButton from "../../common/BackButton";

const TeamStats = ({ projects, tasks, isDarkMode, onClose }) => {
  // Calculate stats with useMemo to prevent unnecessary recalculations
  const stats = useMemo(() => {
    // Get unique members across all projects
    const allMembers = new Set();
    projects.forEach(project => {
      if (project.members && Array.isArray(project.members)) {
        project.members.forEach(member => {
          if (member && member.user_id) {
            allMembers.add(member.user_id);
          }
        });
      }
    });

    // Calculate task statistics
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const inTestingTasks = tasks.filter(t => t.status === "IN_TESTING").length;
    const backlogTasks = tasks.filter(t => t.status === "BACKLOG").length;

    return {
      totalProjects: projects.length,
      totalMembers: allMembers.size,
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      inTestingTasks,
      backlogTasks,
      completionRate: tasks.length > 0 
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0
    };
  }, [projects, tasks]);

  const StatCard = ({ icon, title, value, subtitle }) => (
    <div className={`
      p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}
      shadow-lg border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}
    `}>
      <div className="flex items-center gap-4">
        <div className={`
          p-3 rounded-lg 
          ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}
        `}>
          {icon}
        </div>
        <div>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton onClick={onClose} isDarkMode={isDarkMode} />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team Statistics
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaUsers className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />}
          title="Team Members"
          value={stats.totalMembers}
          subtitle={`Across ${stats.totalProjects} projects`}
        />
        <StatCard
          icon={<FaTasks className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />}
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle={`${stats.backlogTasks} in backlog`}
        />
        <StatCard
          icon={<FaCheckCircle className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />}
          title="Completed Tasks"
          value={stats.completedTasks}
          subtitle={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          icon={<FaHourglass className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />}
          title="In Progress"
          value={stats.inProgressTasks + stats.inTestingTasks}
          subtitle={`${stats.inTestingTasks} in testing`}
        />
      </div>

      {/* Additional Statistics */}
      <div className={`
        mt-8 p-6 rounded-lg
        ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
        border
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Task Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Backlog', value: stats.backlogTasks },
            { label: 'In Progress', value: stats.inProgressTasks },
            { label: 'In Testing', value: stats.inTestingTasks },
            { label: 'Completed', value: stats.completedTasks },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.value}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamStats;
