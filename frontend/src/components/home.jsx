import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  return (
    <div className={`min-h-screen flex flex-col ${darkModeClasses}`}>
      {/* Navbar Component */}
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Hero Section */}
      <section
        className={`relative py-24 flex-grow flex items-center justify-center ${
          isDarkMode
            ? "bg-gray-800"
            : "bg-gradient-to-r from-teal-600 via-teal-500 to-orange-400"
        } bg-fixed bg-cover bg-center`}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center max-w-3xl flex flex-col items-center justify-center">
          <h1 className="text-5xl font-extrabold mb-6">Welcome to</h1>
          <img
            src={tikiLogo}
            alt="TikiTask Logo"
            className="w-auto h-20 mb-6 animate__animated animate__fadeIn animate__delay-1s"
          />
          <p className="text-xl mb-6">
            Your task paradise awaits. Get organized and boost your
            productivity!
          </p>
          <Link to="/register">
            <button className="py-3 px-6 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 focus:outline-none transition-all">
              Start Your Journey
            </button>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className={`py-16 px-6 text-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-900 text-white"
        }`}
      >
        <h2
          className={`text-4xl font-bold ${
            isDarkMode ? "text-teal-300" : "text-teal-600"
          } mb-12`}
        >
          What Our Users Say
        </h2>
        <div className="testimonial-carousel overflow-hidden relative">
          <div
            className="testimonial-slider flex transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(-${
                (currentIndex % totalTestimonials) * (100 / itemsToShow)
              }%)`,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-item flex-shrink-0 w-full md:w-1/3 p-4"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Time Offer Section */}
      <section
        className={`py-16 px-6 text-center ${
          isDarkMode ? "bg-teal-900" : "bg-teal-600"
        } text-white`}
      >
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
      </section>

      {/* Footer Section */}
      <footer
        className={`py-6 text-center ${
          isDarkMode ? "bg-teal-800" : "bg-teal-500"
        } text-white`}
      >
        <p className="text-sm">&copy; 2025 TikiTask Project - Y-Jacob Mlo</p>
      </footer>
    </div>
  );
};

export default HomePage;
