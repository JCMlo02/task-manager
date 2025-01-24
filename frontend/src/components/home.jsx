import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Countdown from "react-countdown";
import { testimonials } from "../assets/testimonials";
import Navbar from "./Navbar";
import tikiLogo from "../assets/nobgLogo.png";

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

const features = [
  {
    title: "Smart Task Management",
    description: "Organize tasks with our intuitive drag-and-drop interface",
    icon: "📋",
    color: "from-teal-500 to-emerald-500",
  },
  {
    title: "Team Collaboration",
    description: "Work seamlessly with your team in real-time",
    icon: "👥",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Analytics Dashboard",
    description: "Track progress with detailed insights and reports",
    icon: "📊",
    color: "from-orange-500 to-red-500",
  },
];

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
  }, [currentIndex, totalTestimonials]); //

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

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${darkModeClasses}`}
    >
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Hero Section */}
      <motion.section
        style={{ scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="absolute inset-0 bg-gradient-radial from-teal-500/20 to-transparent dark:from-teal-900/20" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
          variants={staggerVariants}
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <img
              src={tikiLogo}
              alt="TikiTask Logo"
              className="w-auto h-32 mx-auto drop-shadow-2xl"
            />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-slate-600 dark:text-slate-300"
          >
            Transform your productivity journey with our intelligent task
            management solution
          </motion.p>

          <motion.div variants={itemVariants} className="space-x-4">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Your Journey
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Elements Animation */}
        <FloatingElements isDarkMode={isDarkMode} />
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`py-24 px-4 ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Powerful Features"
            subtitle="Everything you need to manage tasks effectively"
            isDarkMode={isDarkMode}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <TestimonialsSection
        testimonials={testimonials}
        currentIndex={currentIndex}
        isDarkMode={isDarkMode}
      />

      {/* Pricing Section with Countdown */}
      <PricingSection
        countdownDate={countdownDate.current}
        renderer={renderer}
        isDarkMode={isDarkMode}
      />

      {/* Enhanced Footer */}
      <Footer isDarkMode={isDarkMode} />
    </motion.div>
  );
};

const FloatingElements = ({ isDarkMode }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-64 h-64 rounded-full ${
          isDarkMode ? "bg-teal-900/10" : "bg-teal-500/10"
        }`}
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          delay: i * 2,
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

const SectionHeader = ({ title, subtitle, isDarkMode }) => (
  <div className="text-center max-w-3xl mx-auto">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-4xl md:text-5xl font-bold mb-4 ${
        isDarkMode ? "text-white" : "text-slate-800"
      }`}
    >
      {title}
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className={`text-xl ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
    >
      {subtitle}
    </motion.p>
  </div>
);

const FeatureCard = ({ feature, index, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.2 }}
    whileHover={{ y: -5 }}
    className={`p-6 rounded-2xl ${
      isDarkMode ? THEME.dark.card : THEME.light.card
    } shadow-xl`}
  >
    <div
      className={`text-4xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
    >
      {feature.icon}
    </div>
    <h3
      className={`text-xl font-semibold mb-2 ${
        isDarkMode ? "text-white" : "text-slate-800"
      }`}
    >
      {feature.title}
    </h3>
    <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
      {feature.description}
    </p>
  </motion.div>
);

const TestimonialsSection = ({ testimonials, currentIndex, isDarkMode }) => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className={`py-24 px-4 ${isDarkMode ? THEME.dark.bg : THEME.light.bg}`}
  >
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="What Our Users Say"
        subtitle="Trusted by professionals worldwide"
        isDarkMode={isDarkMode}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {testimonials
          .slice(currentIndex, currentIndex + 3)
          .map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              isDarkMode={isDarkMode}
              index={index}
            />
          ))}
      </div>
    </div>
  </motion.section>
);

const TestimonialCard = ({ testimonial, isDarkMode, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.2 }}
    className={`
      p-6 rounded-xl h-full flex flex-col justify-between
      ${isDarkMode ? THEME.dark.card : THEME.light.card} 
      shadow-lg hover:shadow-xl transition-all duration-300
    `}
  >
    <div className="flex-grow">
      <p
        className={`
          text-lg mb-4 line-clamp-4
          ${isDarkMode ? "text-slate-300" : "text-slate-600"}
        `}
      >
        "{testimonial.quote}"
      </p>
    </div>
    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <span
          className={`
            font-semibold
            ${isDarkMode ? "text-white" : "text-slate-800"}
          `}
        >
          {testimonial.name}
        </span>
      </div>
    </div>
  </motion.div>
);

const PricingSection = ({ countdownDate, renderer, isDarkMode }) => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className={`py-24 px-4 ${
      isDarkMode
        ? "bg-slate-900"
        : "bg-gradient-to-r from-teal-500 to-indigo-500"
    }`}
  >
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-white mb-6">Limited Time Offer</h2>
      <p className="text-xl text-white/90 mb-8">
        Get started today and enjoy premium features!
      </p>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block mb-8">
        <Countdown
          date={countdownDate}
          renderer={renderer}
          className="text-3xl font-bold text-white"
        />
      </div>
      <div>
        <Link to="/register">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Free Sign Up
          </motion.button>
        </Link>
      </div>
    </div>
  </motion.section>
);

const Footer = ({ isDarkMode }) => (
  <footer className={`py-8 ${isDarkMode ? "bg-slate-900" : "bg-slate-800"}`}>
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-slate-400">© 2025 TikiTask. All rights reserved.</p>
    </div>
  </footer>
);

export default HomePage;
