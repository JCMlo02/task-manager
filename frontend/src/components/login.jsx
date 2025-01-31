import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import Logo from "../assets/nobgLogo.png";
import Navbar from "./navbar";
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useAppState } from "../states/stateManagement"; // Fix import path

const Login = ({ userPool }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    showPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("isDarkMode") === "true"
  );
  const { setSub, setUser, setIsSessionValid } = useAppState();
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    toast
      .promise(
        new Promise((resolve, reject) => {
          const user = new CognitoUser({
            Username: formData.username,
            Pool: userPool,
          });
          const authDetails = new AuthenticationDetails({
            Username: formData.username,
            Password: formData.password,
          });

          user.authenticateUser(authDetails, {
            onSuccess: async (result) => {
              const userData = result.getIdToken().payload;
              console.log(userData);
              // Store auth data
              localStorage.setItem("userSub", userData.sub);
              localStorage.setItem("userData", JSON.stringify(userData));
              localStorage.setItem("lastLoginCheck", Date.now().toString());
              localStorage.setItem("isAuthenticated", "true"); 

              // Update auth state
              setSub(userData.sub);
              setUser(userData);
              setIsSessionValid(true);

              resolve(result);
              // Add small delay before navigation
              setTimeout(() => {
                navigate("/dashboard");
              }, 100);
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        }),
        {
          loading: "Logging in...",
          success: "Welcome back! 🌴",
          error: (err) => `${err.message || "Failed to login"} 😥`,
        }
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-teal-400 via-teal-500 to-yellow-300"
      }`}
    >
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <Toaster position="top-right" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center min-h-screen pt-16 pb-12 px-4"
      >
        <motion.div
          className={`w-full max-w-md p-8 rounded-2xl shadow-2xl
            ${
              isDarkMode
                ? "bg-slate-800/90 backdrop-blur-sm border border-slate-700"
                : "bg-white/90 backdrop-blur-sm border border-teal-100"
            }`}
        >
          <div className="text-center mb-8">
            <Link to="/">
              <motion.img
                src={Logo}
                alt="TikiTask Logo"
                className="w-auto h-24 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>
            <motion.h2
              className={`text-3xl font-bold mt-6 mb-2 ${
                isDarkMode ? "text-white" : "text-teal-800"
              }`}
            >
              Welcome Back
            </motion.h2>
            <motion.p
              className={`text-lg ${
                isDarkMode ? "text-slate-400" : "text-teal-600"
              }`}
            >
              Your task paradise awaits!
            </motion.p>
          </div>

          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <div className="relative">
                <FaEnvelope
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 
                  ${isDarkMode ? "text-slate-400" : "text-teal-500"}`}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors
                    ${
                      isDarkMode
                        ? "bg-slate-700 text-white border-slate-600 focus:border-teal-500"
                        : "bg-white text-slate-800 border-teal-200 focus:border-teal-500"
                    }
                    border-2 focus:outline-none`}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <FaLock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 
                  ${isDarkMode ? "text-slate-400" : "text-teal-500"}`}
                />
                <input
                  type={formData.showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full pl-10 pr-12 py-3 rounded-lg transition-colors
                    ${
                      isDarkMode
                        ? "bg-slate-700 text-white border-slate-600 focus:border-teal-500"
                        : "bg-white text-slate-800 border-teal-200 focus:border-teal-500"
                    }
                    border-2 focus:outline-none`}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      showPassword: !formData.showPassword,
                    })
                  }
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 
                    ${
                      isDarkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-teal-500 hover:text-teal-700"
                    }`}
                >
                  {formData.showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white
                  ${
                    isDarkMode
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                      : "bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500"
                  }
                  transition-all duration-200 transform`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Don't have an account?{" "}
              <Link
                to="/register"
                className={`font-semibold hover:underline
                  ${
                    isDarkMode
                      ? "text-teal-400 hover:text-teal-300"
                      : "text-teal-600 hover:text-teal-700"
                  }`}
              >
                Register here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
