import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Dashboard = ({ userPool }) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [sub, setSub] = useState(null);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("isDarkMode") === "true"
  );

  const history = useNavigate();

  useEffect(() => {
    const currentUser = userPool.getCurrentUser();

    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err) {
          console.error("Error getting session", err);
          setError(err.message || "Error getting session");
          return;
        }
        setUser(currentUser);
        let sub = session.getIdToken().payload.sub;
        setSub(sub);
        fetchProjects();
      });
    } else {
      history("/"); // Redirect to home page if no user is logged in
    }
  }, [userPool, history]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err.message || "");
    }
  };

  const createProject = async (e) => {
    e.preventDefault();

    if (!newProjectName || !newProjectDescription) {
      alert("Please provide both project name and description.");
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          userId: sub,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      setProjects((prevProjects) => [...prevProjects, data.project]);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || "Error creating project");
    }
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("isDarkMode", newDarkMode); // Save to localStorage
  };

  const darkModeClasses = isDarkMode
    ? "bg-gray-800 text-teal-600"
    : "bg-gradient-to-br from-teal-500 to-orange-400 text-teal-600";

  return (
    <section className={`${darkModeClasses} min-h-screen`}>
      {/* Navbar Component */}
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="p-6 flex justify-center items-center">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-4xl font-semibold text-center text-teal-700">
            Dashboard
          </h2>

          {error && (
            <div className="text-red-500 mt-4 text-center">
              <p></p>
            </div>
          )}

          {user ? (
            <div className="mt-8">
              <div className="text-center">
                <h3 className="text-xl text-gray-700">
                  Welcome,{" "}
                  <span className="font-semibold text-teal-600">
                    {user.getUsername()}
                  </span>
                </h3>
              </div>

              {/* Create Project Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
                >
                  Create Project
                </button>
              </div>

              {/* Project List */}
              <div className="mt-8">
                <h4 className="text-2xl font-semibold text-teal-700">
                  Your Projects
                </h4>
                {projects.length > 0 ? (
                  <ul className="mt-6 space-y-6">
                    {projects.map((project, index) => (
                      <li
                        key={index}
                        className="bg-teal-50 p-4 rounded-lg shadow-lg hover:bg-teal-100 transition-all duration-300"
                      >
                        <p className="text-lg font-medium text-teal-600">
                          {project.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-gray-500">
                    No projects found. Create some projects!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-500">
              <p>Please log in to view your dashboard.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full sm:w-96">
            <h3 className="text-2xl font-semibold text-teal-700 text-center mb-6">
              Create New Project
            </h3>
            <form onSubmit={createProject}>
              <div className="mb-6">
                <label
                  htmlFor="projectName"
                  className="block text-teal-700 font-semibold mb-2"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="projectDescription"
                  className="block text-teal-700 font-semibold mb-2"
                >
                  Project Description
                </label>
                <textarea
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter project description"
                  rows="4"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
