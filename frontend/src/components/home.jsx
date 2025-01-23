import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Countdown from "react-countdown";
import { testimonials } from "../assets/testimonials";
import Navbar from "./Navbar";
import tikiLogo from "../assets/nobgLogo.png";

const HomePage = ({ userPool }) => {
  const navigate = useNavigate();
  const savedDarkMode = localStorage.getItem("isDarkMode") === "true";
  const [isDarkMode, setIsDarkMode] = useState(savedDarkMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 3;
  const totalTestimonials = testimonials.length;

  // Retrieve the stored date or calculate it if not found
  const storedDate = localStorage.getItem("countdownDate");
  const countdownDate = useRef(
    storedDate
      ? new Date(storedDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // If there's no stored countdown date, save the new calculated one
  useEffect(() => {
    if (!storedDate) {
      localStorage.setItem("countdownDate", countdownDate.current);
    }
  }, [storedDate]);

  // Check if the user is logged in
  useEffect(() => {
    const currentUser = userPool?.getCurrentUser(); // This method assumes you're using AWS Cognito
    if (currentUser) {
      navigate("/dashboard"); // Redirect to /dashboard if the user is logged in
    }
  }, [userPool, navigate]);

  // Toggle dark mode and save the state to localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("isDarkMode", newDarkMode); // Save to localStorage
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex + itemsToShow) % totalTestimonials
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentIndex]);

  const renderer = ({ days, hours, minutes, seconds }) => {
    const formatTime = (time) =>
      time.toString().length === 1 ? `0${time}` : time;
    return (
      <span>
        {days} Days, {formatTime(hours)}:{formatTime(minutes)}:
        {formatTime(seconds)}
      </span>
    );
  };

  const darkModeClasses = isDarkMode
    ? "bg-gray-800 text-teal-600"
    : "bg-gradient-to-br from-teal-500 to-orange-400 text-teal-600";

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col ${darkModeClasses}`}
    >
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Hero Section with improved spacing */}
      <motion.section
        style={{ scale }}
        className={`relative py-32 flex-grow flex items-center justify-center hero-bg-pattern min-h-[90vh]`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
        <motion.div
          className="relative z-10 text-center max-w-3xl px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-5xl font-extrabold mb-6">Welcome to</h1>
          <div className="flex justify-center items-center mb-6">
            <img
              src={tikiLogo}
              alt="TikiTask Logo"
              className="w-auto h-24 animate__animated animate__fadeIn animate__delay-1s"
            />
          </div>
          <p className="text-xl mb-6">
            Your task paradise awaits. Get organized and boost your
            productivity!
          </p>
          <Link to="/register">
            <button className="py-3 px-6 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 focus:outline-none transition-all">
              Start Your Journey
            </button>
          </Link>
        </motion.div>
      </motion.section>

      {/* New Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`py-24 px-8 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className={`text-4xl font-bold text-center mb-16 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Powerful Features for Enhanced Productivity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Task Management Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl overflow-hidden shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src="/path/to/task-management-image.jpg"
                  alt="Task Management"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Task Management
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Organize and track your tasks with our intuitive drag-and-drop
                  interface.
                </p>
              </div>
            </motion.div>

            {/* Project Collaboration Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl overflow-hidden shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src="/path/to/collaboration-image.jpg"
                  alt="Project Collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Project Collaboration
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Work seamlessly with your team in real-time with shared
                  workspaces.
                </p>
              </div>
            </motion.div>

            {/* Analytics Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl overflow-hidden shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src="/path/to/analytics-image.jpg"
                  alt="Analytics Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Analytics Dashboard
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Track progress and performance with detailed analytics and
                  reports.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Improved Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`py-24 px-8 ${
          isDarkMode ? "bg-gray-800" : "bg-gradient-to-b from-gray-100 to-white"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className={`text-4xl font-bold text-center mb-16 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            What Our Users Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {testimonials
                .slice(currentIndex, currentIndex + itemsToShow)
                .map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.2 }}
                    className="testimonial-item"
                  >
                    <div
                      className={`p-8 rounded-lg shadow-lg ${
                        isDarkMode
                          ? "bg-gray-700 text-teal-300"
                          : "bg-teal-200 text-teal-800"
                      } h-full flex flex-col justify-between`}
                    >
                      <p className="text-lg italic mb-4">{`"${testimonial.quote}"`}</p>
                      <p className="text-sm font-semibold mt-auto">
                        - {testimonial.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Limited Time Offer Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`py-24 px-8 relative ${
          isDarkMode
            ? "bg-gray-900"
            : "bg-gradient-to-r from-teal-500 to-orange-400"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Limited Time Offer</h2>
          <p className="text-xl mb-6">
            Sign up now and get exclusive access to premium features!
          </p>
          <div className="countdown-timer mb-6">
            <span className="text-3xl font-semibold">
              <Countdown date={countdownDate.current} renderer={renderer} />
            </span>
            <p className="text-lg">Time remaining</p>
          </div>
          <Link to="/register">
            <button className="py-3 px-6 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 focus:outline-none">
              Get Started
            </button>
          </Link>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`py-6 text-center ${
          isDarkMode ? "bg-teal-800" : "bg-teal-500"
        } text-white`}
      >
        <p className="text-sm">&copy; 2025 TikiTask Project - Y-Jacob Mlo</p>
      </motion.footer>
    </motion.div>
  );
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.3,
    },
  },
};

export default HomePage;
