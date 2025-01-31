// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/dashboard";
import HomePage from "./components/home";
import About from "./components/about";
import Features from "./components/features";
const App = ({ userPool }) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage userPool={userPool} />} />
        <Route path="/login" element={<Login userPool={userPool} />} />
        <Route path="/register" element={<Register userPool={userPool} />} />
        <Route path="/dashboard" element={<Dashboard userPool={userPool} />} />
        <Route path="/about" element={<About userPool={userPool} />} />
        <Route path="/features" element={<Features userPool={userPool} />} />
      </Routes>
    </Router>
  );
};

export default App;
