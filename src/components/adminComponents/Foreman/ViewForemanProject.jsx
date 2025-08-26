import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const ViewForemanProject = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState([]);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/foremanTasks/${userId}`);
      if(res.ok){
        const data = await res.json();  
        setTasks(data);
      }
    };

    fetchTasks();
  },[])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={20} />
        <span>Back to Projects</span>
      </button>

      {/* Project Header */}
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">{project?.name}</h1>
        <p className="text-gray-600">Site: {project?.location}</p>
        <p className="text-sm text-gray-500">Start Date: {project?.start_date}</p>
      </header>

      {/* Important Details Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Deadline</h3>
          <p className="text-gray-800">{project?.deadline || "TBD"}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Budget</h3>
          <p className="text-gray-800">
            {project?.budget ? `₱${project.budget}` : "Not Assigned"}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Client</h3>
          <p className="text-gray-800">{project?.client || "N/A"}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow md:col-span-3">
          <h3 className="font-semibold text-gray-700">Notes / Safety</h3>
          <p className="text-gray-800">
            {project?.notes || "No notes provided for this project."}
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        {["overview", "tasks", "materials", "workers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <p className="text-gray-700 mb-2">Status: {project?.status}</p>
            <p className="text-gray-700">Deadline: {project?.deadline}</p>
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Assigned Tasks</h2>
            <div className="space-y-4">
              {tasks?.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-3"
                >
                  {/* Top Row: Title + Priority */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Details */}
                  <p className="text-gray-600 text-sm">{task.details}</p>

                  {/* Dates + Status */}
                  <div className="flex flex-wrap justify-between text-sm text-gray-500">
                    <span>
                      <strong className="font-medium text-gray-700">Start:</strong>{" "}
                      {new Date(task.start_date).toLocaleDateString()}
                    </span>
                    <span>
                      <strong className="font-medium text-gray-700">Due:</strong>{" "}
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab === "materials" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Materials Needed</h2>
            <ul className="space-y-2">
              {project?.materials?.map((mat) => (
                <li
                  key={mat.id}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <span>{mat.name}</span>
                  <span className="text-sm text-gray-600">
                    {mat.quantity} {mat.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "workers" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Assigned Workers</h2>
            <ul className="space-y-2">
              {project?.workers?.map((worker) => (
                <li
                  key={worker.id}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <span>{worker.name}</span>
                  <span className="text-sm text-gray-600">{worker.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
