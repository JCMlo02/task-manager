import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

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

const About = ({ userPool }) => {
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

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? THEME.dark.bg
          : "bg-gradient-to-br from-teal-500/20 to-indigo-600"
      }`}
    >
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-20 px-4 max-w-4xl mx-auto"
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
            } mb-6 text-center`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            About TikiTask
          </motion.h1>

          <div
            className={`space-y-6 ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <p>
              TikiTask is a modern task management solution designed to help
              teams collaborate effectively and manage projects with ease. Born
              from the need for a simpler, more intuitive project management
              tool, TikiTask combines powerful features with a user-friendly
              interface.
            </p>

            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? THEME.dark.text : THEME.light.text
              } mt-8`}
            >
              Our Mission
            </h2>
            <p>
              Our mission is to simplify project management and enhance team
              collaboration through intuitive tools and seamless workflows. We
              believe that effective task management should be accessible to
              everyone, from small teams to large organizations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
