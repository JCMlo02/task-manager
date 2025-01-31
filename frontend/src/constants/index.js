import {
  FaInbox,
  FaSpinner,
  FaVial,
  FaCheckCircle,
  FaExclamation,
  FaFlag,
} from "react-icons/fa";

export const STATUS_DISPLAY_NAMES = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  IN_TESTING: "In Testing",
  DONE: "Done",
};

export const TASK_STATUSES = {
  BACKLOG: "BACKLOG",
  IN_PROGRESS: "IN_PROGRESS",
  IN_TESTING: "IN_TESTING",
  DONE: "DONE",
};

export const TASK_PRIORITIES = {
  HIGH: {
    label: "High",
    color: "bg-red-500",
    icon: <FaExclamation className="w-3 h-3 mr-1" />,
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-yellow-500",
    icon: <FaFlag className="w-3 h-3 mr-1" />,
  },
  LOW: {
    label: "Low",
    color: "bg-blue-500",
    icon: <FaFlag className="w-3 h-3 mr-1" />,
  },
};

export const STATUS_ICONS = {
  BACKLOG: FaInbox,
  IN_PROGRESS: FaSpinner,
  IN_TESTING: FaVial,
  DONE: FaCheckCircle,
};

export const TASK_COLORS = {
  BACKLOG: "bg-gray-100",
  IN_PROGRESS: "bg-blue-100",
  IN_TESTING: "bg-yellow-100",
  DONE: "bg-green-100",
};

export const THEME = {
  light: {
    bg: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
  },
  dark: {
    bg: "bg-gray-800",
    text: "text-white",
    border: "border-gray-700",
  },
};
