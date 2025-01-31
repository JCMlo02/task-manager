import React from "react";
import { MenuItem, Menu } from "@szhsin/react-menu";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrashAlt,
  FaUserPlus,
  FaEllipsisV,
  FaPlusCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { THEME } from "../../../constants";
import { mobileStyles } from "../../../styles/responsive";

export const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  onInvite,
  isDarkMode,
  isMobile,
}) => {
  return (
    <motion.div
      className={`
        relative
        rounded-lg 
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-100 border-slate-200"
        }
        transform transition-all duration-200
        hover:shadow-lg 
        ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-200/50"}
        border
        isolate
      `}
    >
      <div className={mobileStyles.card.header}>
        <div
          className={`
          flex items-start justify-between
          ${isMobile ? "gap-2" : "gap-4"}
        `}
        >
          <div>
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? THEME.dark.text : THEME.light.text
              }`}
            >
              {project.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {project.description}
            </p>
          </div>
          <ProjectMenu
            onEdit={onEdit}
            onDelete={onDelete}
            onViewTasks={onViewTasks}
            onInvite={onInvite}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      <div className={mobileStyles.card.body}>
        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <MemberCount
            count={project.members?.length || 1}
            isDarkMode={isDarkMode}
          />
          <RoleBadge role={project.role} isDarkMode={isDarkMode} />
        </div>
      </div>
    </motion.div>
  );
};

export const ProjectMenu = ({
  onEdit,
  onDelete,
  onViewTasks,
  onInvite,
  isDarkMode,
}) => (
  <div className="relative">
    <Menu
      portal={true}
      align="end"
      offsetY={5}
      menuButton={
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative z-[1] p-2 rounded-lg ${
            isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
          }`}
        >
          <FaEllipsisV
            className={isDarkMode ? "text-slate-400" : "text-slate-600"}
          />
        </motion.button>
      }
      transition
      menuStyle={{
        zIndex: 1000,
        position: 'relative',
        minWidth: '150px'
      }}
      containerProps={{
        style: { zIndex: 1000 }
      }}
    >
      <MenuItem onClick={onEdit}>
        <FaEdit className="mr-2" /> Edit
      </MenuItem>
      <MenuItem onClick={onDelete}>
        <FaTrashAlt className="mr-2" /> Delete
      </MenuItem>
      <MenuItem onClick={onViewTasks}>
        <FaPlusCircle className="mr-2" /> Tasks
      </MenuItem>
      <MenuItem onClick={onInvite}>
        <FaUserPlus className="mr-2" /> Invite
      </MenuItem>
    </Menu>
  </div>
);

export const MemberCount = ({ count, isDarkMode }) => (
  <div
    className={`flex items-center gap-2 ${
      isDarkMode ? "text-slate-400" : "text-slate-600"
    }`}
  >
    <FaUserPlus />
    <span>
      {count} member{count !== 1 ? "s" : ""}
    </span>
  </div>
);

export const RoleBadge = ({ role, isDarkMode }) => (
  <span
    className={`
    px-3 py-1 rounded-full text-sm font-medium
    ${
      isDarkMode
        ? "bg-slate-700 text-slate-200"
        : "bg-emerald-100 text-emerald-800"
    }
  `}
  >
    {role}
  </span>
);

export const EnhancedModal = ({
  children,
  title,
  onClose,
  isDarkMode,
  isMobile,
}) => {
  return (
    <div className={mobileStyles.modal.base}>
      <div
        className={`
        ${mobileStyles.modal.content}
        ${isDarkMode ? "bg-slate-900" : "bg-white"}
      `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl font-semibold ${
              isDarkMode ? THEME.dark.text : THEME.light.text
            }`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            } hover:text-red-500`}
          >
            <FaTimesCircle size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
