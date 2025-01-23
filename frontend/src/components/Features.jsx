import React from "react";
import { motion } from "framer-motion";
import {
  FaTasks,
  FaUsers,
  FaMoon,
  FaBell,
  FaGripVertical,
} from "react-icons/fa";
import Navbar from "./Navbar";

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
  >
    <div className="text-4xl text-teal-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-teal-600 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Features = ({ userPool }) => {
  const isDarkMode = localStorage.getItem("isDarkMode") === "true";
  const toggleDarkMode = () => {}; // Empty function as we don't need dark mode toggle here

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
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-teal-500 to-orange-400"
      }`}
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
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 mt-8">
          <motion.h1
            className="text-4xl font-bold text-teal-600 mb-8 text-center"
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
              />
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of teams already using TikiTask to improve their
              productivity.
            </p>
            <a href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-teal-500 text-white rounded-lg shadow-lg hover:bg-teal-600 transition-colors"
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
