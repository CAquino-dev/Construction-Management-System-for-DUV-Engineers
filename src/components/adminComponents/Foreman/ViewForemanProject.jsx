import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import TaskModal from "./TaskModal";
import AddTeamModal from "./AddTeamModal";      // ⬅️ your modal
import AddWorkerModal from "./AddWorkerModal";  // ⬅️ your modal

// Main Component
export const ViewForemanProject = ({ selectedProject, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [milestones, setMilestones] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null); // for modal

  // modal states
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null); // team to add worker into
  const [teams, setTeams] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getTasks/${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          setMilestones(data); // [{ milestone_id, milestone_title, tasks: [] }]
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchTeams = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getTeams/${userId}`)
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams); 
        }
      } catch (error) {
         console.error("Error fetching tasks:", error);
      }
    }

    fetchTeams();
    fetchTasks();
  }, []);

  const handleSaveTask = (updatedTask) => {
    // TODO: Call API to update task
    console.log("Saving task update:", updatedTask);

    // Optimistically update local state
    setMilestones((prev) =>
      prev.map((ms) => ({
        ...ms,
        tasks: ms.tasks.map((t) =>
          t.task_id === updatedTask.task_id ? updatedTask : t
        ),
      }))
    );
  };

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

      {/* selectedProject Header */}
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {selectedProject?.name}
        </h1>
        <p className="text-gray-600">Site: {selectedProject?.location}</p>
        <p className="text-sm text-gray-500">
          Start Date:{" "}
          {new Date(selectedProject?.start_date).toLocaleDateString()}
        </p>
      </header>

      {/* Important Details Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Deadline</h3>
          <p className="text-gray-800">
            {new Date(selectedProject?.end_date).toLocaleDateString() || "TBD"}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Budget</h3>
          <p className="text-gray-800">
            {selectedProject?.budget
              ? `₱${selectedProject.budget}`
              : "Not Assigned"}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Client</h3>
          <p className="text-gray-800">{selectedProject?.client || "N/A"}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow md:col-span-3">
          <h3 className="font-semibold text-gray-700">Notes / Safety</h3>
          <p className="text-gray-800">
            {selectedProject?.notes || "No notes provided for this project."}
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        {["overview", "tasks", "workers"].map((tab) => (
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
            <p className="text-gray-700 mb-2">
              Status: {selectedProject?.status}
            </p>
            <p className="text-gray-700">
              Deadline: {selectedProject?.deadline}
            </p>
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Assigned Tasks</h2>

            {milestones.map((ms) => (
              <div key={ms.milestone_id} className="mb-8">
                {/* Milestone Title */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  {ms.milestone_title}
                </h3>

                {/* Tasks inside milestone */}
                <div className="space-y-4">
                  {ms.tasks.map((task) => (
                    <div
                      key={task.task_id}
                      onClick={() => setExpandedTask(task)}
                      className="p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-3 cursor-pointer"
                    >
                      {/* Top Row: Title + Priority */}
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {task.title}
                        </h4>
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
                          <strong className="font-medium text-gray-700">
                            Start:
                          </strong>{" "}
                          {new Date(task.start_date).toLocaleDateString()}
                        </span>
                        <span>
                          <strong className="font-medium text-gray-700">
                            Due:
                          </strong>{" "}
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
            ))}
          </div>
        )}

        {activeTab === "workers" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Worker Management</h2>
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Team
              </button>
            </div>

            {/* Teams List */}
            <div className="space-y-6">
              {(teams || []).map((team) => (
                <div
                  key={team.id}
                  className="p-4 border rounded-xl bg-gray-50 shadow-sm"
                >
                  {/* Team Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {team.team_name}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAddWorkerModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                    >
                      + Add Worker
                    </button>
                  </div>

                  {/* Workers inside team */}
                  {team.workers && team.workers.length > 0 ? (
                    <ul className="space-y-2">
                      {team.workers.map((worker) => (
                        <li
                          key={worker.id}
                          className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {worker.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {worker.skill_type}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              worker.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {worker.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No workers in this team yet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {expandedTask && (
        <TaskModal
          task={expandedTask}
          workers={selectedProject?.workers || []}
          onClose={() => setExpandedTask(null)}
          onSave={handleSaveTask}
        />
      )}

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <AddTeamModal
          onClose={() => setShowAddTeamModal(false)}
          onSave={(team) => {
            console.log("New team saved:", team);
            setShowAddTeamModal(false);
          }}
        />
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && selectedTeam && (
        <AddWorkerModal
          team={selectedTeam}
          onClose={() => {
            setShowAddWorkerModal(false);
            setSelectedTeam(null);
          }}
          onSave={(worker) => {
            console.log("New worker saved:", worker);
            setShowAddWorkerModal(false);
            setSelectedTeam(null);
          }}
        />
      )}
    </div>
  );
};
