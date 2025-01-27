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
import { THEME } from "../../constants";
export const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  onInvite,
  isDarkMode,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`
        ${isDarkMode ? THEME.dark.card : THEME.light.card}
        rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
        border border-slate-200 dark:border-slate-700
        p-6 flex flex-col gap-4
      `}
  >
    <div className="flex items-start justify-between">
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
    <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
      <MemberCount
        count={project.members?.length || 1}
        isDarkMode={isDarkMode}
      />
      <RoleBadge role={project.role} isDarkMode={isDarkMode} />
    </div>
  </motion.div>
);

export const ProjectMenu = ({
  onEdit,
  onDelete,
  onViewTasks,
  onInvite,
  isDarkMode,
}) => (
  <Menu
    menuButton={
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-lg ${
          isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
        }`}
      >
        <FaEllipsisV
          className={isDarkMode ? "text-slate-400" : "text-slate-600"}
        />
      </motion.button>
    }
    transition
    className="z-50"
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
      isDarkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"
    }
  `}
  >
    {role}
  </span>
);

export const EnhancedModal = ({
  title,
  children,
  onClose,
  maxWidth = "max-w-md",
  customStyles = "",
  isDarkMode,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center overflow-y-auto p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className={`
        ${isDarkMode ? THEME.dark.card : THEME.light.card}
        rounded-xl shadow-2xl w-full ${maxWidth} p-6 my-20 max-h-[85vh] overflow-y-auto ${customStyles}
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
    </motion.div>
  </motion.div>
);
