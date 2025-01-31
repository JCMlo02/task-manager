// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/Home";
import About from "./components/About";
import Features from "./components/Features";
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
