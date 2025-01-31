import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTasks,
  FaUsers,
  FaMoon,
  FaBell,
  FaGripVertical,
} from "react-icons/fa";
import Navbar from "./navbar";

const THEME = {
  light: {
    bg: "bg-gradient-to-br from-slate-50 to-gray-100",
    text: "text-slate-700",
    accent: "text-indigo-600",
    card: "bg-white",
    hover: "hover:bg-slate-50",
  },
  dark: {
    bg: "bg-gradient-to-br from-slate-800 to-slate-900",
    text: "text-slate-200",
    accent: "text-indigo-400",
    card: "bg-slate-800",
    hover: "hover:bg-slate-700",
  },
};

const FeatureCard = ({ icon, title, description, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`
      ${isDarkMode ? THEME.dark.card : THEME.light.card}
      rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow
      ${isDarkMode ? "border border-slate-700" : "border border-slate-200"}
    `}
  >
    <div
      className={`text-4xl ${
        isDarkMode ? "text-indigo-400" : "text-indigo-500"
      } mb-4`}
    >
      {icon}
    </div>
    <h3
      className={`text-xl font-semibold ${
        isDarkMode ? THEME.dark.text : THEME.light.text
      } mb-2`}
    >
      {title}
    </h3>
    <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
      {description}
    </p>
  </motion.div>
);

const Features = ({ userPool }) => {
  const navigate = useNavigate();
  const isDarkMode = localStorage.getItem("isDarkMode") === "true";

  useEffect(() => {
    const currentUser = userPool?.getCurrentUser();
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [userPool, navigate]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    localStorage.setItem("isDarkMode", newDarkMode);
    window.location.reload();
  };

  const features = [
    {
      icon: <FaTasks />,
      title: "Task Management",
      description:
        "Create, organize, and track tasks with ease. Set priorities, deadlines, and monitor progress in real-time.",
    },
    {
      icon: <FaUsers />,
      title: "Team Collaboration",
      description:
        "Invite team members, assign tasks, and collaborate efficiently with built-in communication tools.",
    },
    {
      icon: <FaGripVertical />,
      title: "Drag & Drop",
      description:
        "Intuitive drag-and-drop interface for easy task organization and status updates.",
    },
    {
      icon: <FaMoon />,
      title: "Dark Mode",
      description:
        "Easy on the eyes with a built-in dark mode option for comfortable viewing in any environment.",
    },
    {
      icon: <FaBell />,
      title: "Notifications",
      description:
        "Stay updated with real-time notifications for task assignments, updates, and project invitations.",
    },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? THEME.dark.bg : THEME.light.bg}`}
    >
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-20 px-4 max-w-6xl mx-auto"
      >
        <div
          className={`
          ${isDarkMode ? THEME.dark.card : THEME.light.card}
          backdrop-blur-sm rounded-xl shadow-2xl p-8 mt-8
          ${isDarkMode ? "border border-slate-700" : "border border-slate-200"}
        `}
        >
          <motion.h1
            className={`text-4xl font-bold ${
              isDarkMode ? THEME.dark.text : THEME.light.text
            } mb-8 text-center`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Features
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? THEME.dark.text : THEME.light.text
              } mb-4`}
            >
              Ready to get started?
            </h2>
            <p
              className={`${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              } mb-6`}
            >
              Join thousands of teams already using TikiTask to improve their
              productivity.
            </p>
            <a href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-8 py-3 rounded-lg shadow-lg transition-colors
                  ${
                    isDarkMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }
                `}
              >
                Try TikiTask Free
              </motion.button>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Features;
