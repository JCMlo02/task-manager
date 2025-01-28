import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Countdown from "react-countdown";
import { testimonials } from "../assets/testimonials";
import Navbar from "./Navbar";
import tikiLogo from "../assets/nobgLogo.png";
import Analytics from "../assets/Analytics.png";
import Projects from "../assets/Projects.png";
import TaskBoard from "../assets/TaskBoard.png";
import { FaArrowDown, FaMouse } from "react-icons/fa";

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

const screenshots = [
  {
    image: TaskBoard,
    title: "Task Board View",
    description: "Organize tasks with our intuitive kanban board interface",
  },
  {
    image: Analytics,
    title: "Progress Tracking",
    description:
      "Monitor project progress with detailed analytics about overall tasks",
  },
  {
    image: Projects,
    title: "Project Management",
    description: "Manage projects, invite members and assign tasks efficiently",
  },
];

const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const currentRef = elementRef.current; // Store ref value
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]); // Add options to dependencies

  return [elementRef, isInView];
};

const getIconForTitle = (title) => {
  const iconStyle = "text-2xl text-teal-500"; // Consistent color instead of gradient

  switch (title) {
    case "Task Board View":
      return (
        <span role="img" aria-label="kanban" className={iconStyle}>
          📋
        </span>
      );
    case "Progress Tracking":
      return (
        <span role="img" aria-label="analytics" className={iconStyle}>
          📊
        </span>
      );
    case "Project Management":
      return (
        <span role="img" aria-label="project" className={iconStyle}>
          🎯
        </span>
      );
    default:
      return null;
  }
};

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
    const currentUser = userPool?.getCurrentUser();
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
      <HeroSection
        isDarkMode={isDarkMode}
        scale={scale}
        variants={{
          hero: heroVariants,
          stagger: staggerVariants,
          item: itemVariants,
        }}
      />
      <ShowcaseSection isDarkMode={isDarkMode} />
      <TestimonialsSection
        testimonials={testimonials}
        currentIndex={currentIndex}
        isDarkMode={isDarkMode}
      />
      <PricingSection
        countdownDate={countdownDate.current}
        renderer={renderer}
        isDarkMode={isDarkMode}
      />
      <Footer isDarkMode={isDarkMode} />
    </motion.div>
  );
};

const HeroSection = ({ isDarkMode, scale, variants }) => {
  const [scrollRef, isScrollVisible] = useInView({ threshold: 0.1 });

  return (
    <motion.section
      style={{ scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={variants.hero}
    >
      <div className="absolute inset-0 bg-gradient-radial from-teal-500/20 to-transparent dark:from-teal-900/20" />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        variants={variants.stagger}
      >
        <motion.div variants={variants.item}>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to
          </h1>
        </motion.div>

        <motion.div variants={variants.item} className="mb-8">
          <img
            src={tikiLogo}
            alt="TikiTask Logo"
            className="w-auto h-32 mx-auto drop-shadow-2xl"
          />
        </motion.div>

        <motion.p
          variants={variants.item}
          className="text-xl md:text-2xl mb-8 text-slate-600 dark:text-slate-300"
        >
          Transform your productivity journey with our intelligent task
          management solution
        </motion.p>

        <motion.div variants={variants.item} className="space-x-4">
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

        <motion.div
          ref={scrollRef}
          animate={{
            y: isScrollVisible ? [0, 10, 0] : 0,
            opacity: isScrollVisible ? 1 : 0,
          }}
          transition={{
            y: { repeat: Infinity, duration: 2 },
            opacity: { duration: 0.5 },
          }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <FaArrowDown
            className={`text-2xl ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          />
        </motion.div>
      </motion.div>

      <FloatingElements isDarkMode={isDarkMode} />
    </motion.section>
  );
};

const ShowcaseSection = ({ isDarkMode }) => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className={`py-24 px-4 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
  >
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="In Action"
        subtitle="Discover how our platform can transform your workflow"
        isDarkMode={isDarkMode}
      />

      <div className="mt-16 space-y-32">
        {" "}
        {/* Increased spacing */}
        {screenshots.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`
              relative flex flex-col lg:flex-row items-center gap-8 
              ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}
              max-w-6xl mx-auto
            `}
          >
            {/* Image Container with hover effect */}
            <div className="w-full lg:w-2/3 relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`
                  rounded-2xl overflow-hidden shadow-xl
                  ${isDarkMode ? "bg-slate-700" : "bg-white"}
                  transform transition-all duration-300
                  group-hover:shadow-2xl
                `}
              >
                <div className="relative p-4">
                  {/* Replace gradient bar with subtle border */}
                  <div
                    className={`
                    absolute top-0 left-0 right-0 h-px
                    ${isDarkMode ? "bg-slate-600" : "bg-slate-200"}
                  `}
                  />
                  <div
                    className={`
                    rounded-lg overflow-hidden
                    ${isDarkMode ? "bg-slate-800" : "bg-gray-50"}
                    p-2
                  `}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto object-contain rounded-md"
                      style={{ maxHeight: "400px" }}
                    />

                    {/* Interactive overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    >
                      <div className="absolute bottom-4 left-4 flex items-center text-white">
                        <FaMouse className="mr-2" />
                        <span className="text-sm font-medium">
                          Hover to explore
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Text Content with animated line */}
            <div className="w-full lg:w-1/3 space-y-6">
              {/* Replace gradient line with subtle separator */}
              <div
                className={`h-px w-16 ${
                  isDarkMode ? "bg-teal-500/30" : "bg-teal-500/20"
                }`}
              />
              <h3
                className={`
                text-3xl font-bold
                ${isDarkMode ? "text-white" : "text-slate-800"}
                flex items-center gap-3
              `}
              >
                {getIconForTitle(item.title)}
                {item.title}
              </h3>
              <p
                className={`
                text-xl leading-relaxed
                ${isDarkMode ? "text-slate-300" : "text-slate-600"}
              `}
              >
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

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
      <div className="bg-white/10 backdrop-blur-sm rounded-xl text-white p-6 inline-block mb-8">
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
