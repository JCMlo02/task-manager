import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const About = ({ userPool }) => {
  const isDarkMode = localStorage.getItem("isDarkMode") === "true";
  const toggleDarkMode = () => {}; // Empty function as we don't need dark mode toggle here

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-teal-500 to-orange-400'}`}>
      <Navbar userPool={userPool} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-20 px-4 max-w-4xl mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 mt-8">
          <motion.h1 
            className="text-4xl font-bold text-teal-600 mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            About TikiTask
          </motion.h1>

          <div className="space-y-6 text-gray-600">
            <p>
              TikiTask is a modern task management solution designed to help teams collaborate effectively
              and manage projects with ease. Born from the need for a simpler, more intuitive project
              management tool, TikiTask combines powerful features with a user-friendly interface.
            </p>

            <h2 className="text-2xl font-semibold text-teal-600 mt-8">Our Mission</h2>
            <p>
              Our mission is to simplify project management and enhance team collaboration through
              intuitive tools and seamless workflows. We believe that effective task management
              should be accessible to everyone, from small teams to large organizations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
