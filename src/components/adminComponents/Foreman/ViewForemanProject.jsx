import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

export const ViewForemanProject = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");

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
            <h2 className="text-xl font-semibold mb-4">Assigned Tasks</h2>
            <ul className="space-y-2">
              {project?.tasks?.map((task) => (
                <li
                  key={task.id}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <span>{task.name}</span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      task.status === "Completed"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
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
