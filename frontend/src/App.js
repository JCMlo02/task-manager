// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/dashboard";
import ProjectDetails from "./components/projectdeets"; // Assuming you have a project details page
import HomePage from "./components/home";

const App = ({ userPool }) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage userPool={userPool} />} />
        <Route path="/login" element={<Login userPool={userPool} />} />
        <Route path="/register" element={<Register userPool={userPool} />} />
        <Route path="/dashboard" element={<Dashboard userPool={userPool} />} />
        <Route
          path="/project/:projectId"
          element={<ProjectDetails userPool={userPool} />}
        />{" "}
        {/* Project details page */}
      </Routes>
    </Router>
  );
};

export default App;
