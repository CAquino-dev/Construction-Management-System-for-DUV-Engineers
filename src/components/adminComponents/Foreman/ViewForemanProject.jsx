import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import TaskModal from "./TaskModal";
import AddTeamModal from "./AddTeamModal"; // ⬅️ your modal
import AddWorkerModal from "./AddWorkerModal"; // ⬅️ your modal
import Gantt from "frappe-gantt";
import { useRef } from "react";
import { WorkerIDCard } from "./WorkerIDCard";

// Main Component
export const ViewForemanProject = ({ selectedProject, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [milestones, setMilestones] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null); // for modal

  // modal states
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null); // team to add worker into
  const [teams, setTeams] = useState([]);
  const [reportTab, setReportTab] = useState("create"); // "create" | "sent"
  const [myReports, setMyReports] = useState([]);


  const ganttRef = useRef(null);

  const userId = localStorage.getItem("userId");

  // ⬇️ holds unsaved team selections per taskId
  const [draftTeamByTask, setDraftTeamByTask] = useState({});

  const [report, setReport] = useState({
    title: "",
    summary: "",
    task_id: "",
    report_type: "",
    file: null,
  });

  useEffect(() => {
    if (activeTab === "timeline" && ganttRef.current && milestones.length > 0) {
      const ganttTasks = milestones.flatMap((ms) =>
        ms.tasks.map((task) => ({
          id: task.task_id,
          name: task.title,
          start: task.start_date,
          end: task.due_date,
          progress: task.status === "Completed" ? 100 : 50, // adjust logic
        }))
      );

      new Gantt(ganttRef.current, ganttTasks, {
        view_mode: "Day",
        date_format: "YYYY-MM-DD",
      });
    }
  }, [activeTab, milestones]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/foreman/getTasks/${userId}`
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
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/foreman/getTeams/${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getReports/${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          setMyReports(data.reports || []);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
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

  // set ONLY draft selection; do NOT write into task.team_id yet
  const handleAssignTeam = (taskId, teamId) => {
    setDraftTeamByTask((prev) => ({ ...prev, [taskId]: teamId }));
  };

  const handleSaveAssignment = async (taskId, teamId) => {
    const toSave = parseInt(teamId, 10);
    if (!toSave) {
      console.warn("No team selected to assign.");
      return;
    }

    console.log("Sending:", taskId, toSave);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/assignTeam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: taskId, teamId: toSave }),
        }
      );

      if (res.ok) {
        console.log(`Team ${toSave} assigned to Task ${taskId}`);

        // commit to local state: set task.team_id, clear draft
        setMilestones((prevMilestones) =>
          prevMilestones.map((ms) => ({
            ...ms,
            tasks: ms.tasks.map((t) =>
              t.task_id === taskId ? { ...t, team_id: toSave } : t
            ),
          }))
        );
        setDraftTeamByTask((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      } else {
        console.error("Failed to assign team");
      }
    } catch (err) {
      console.error("Error assigning team:", err);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", report.title);
      formData.append("summary", report.summary);
      formData.append("taskId", report.task_id);
      formData.append("report_type", report.report_type);
      formData.append("created_by", userId);
      if (report.file) {
        formData.append("report_file", report.file); // field name must match backend multer field
      }

      // To console everything inside FormData:
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/foremanReport`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const createdReport = await res.json();
        setReport({ title: "", summary: "", task_id: "", file: null });
      } else {
        console.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#4c735c] hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={20} />
        <span>Back to Projects</span>
      </button>

      {/* selectedProject Header */}
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {selectedProject?.name}
        </h1>
        <p className="text-gray-600 ">Site: {selectedProject?.location}</p>
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
        {["overview", "tasks", "workers", "timeline", "reports"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-[#4c735c] text-white"
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
                  {ms.tasks.map((task) => {
                    const assigned =
                      task.team_id !== null && task.team_id !== undefined;
                    const draftVal = draftTeamByTask[task.task_id] ?? "";
                    const selectValue = assigned
                      ? String(task.team_id) // show assigned in the disabled select
                      : String(draftVal);

                    return (
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
                                : task.status === "For Review"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        {/* Assign Team */}
                        <div
                          className="flex items-center gap-2 mt-3"
                          onClick={(e) => e.stopPropagation()} // prevent modal when interacting here
                        >
                          <select
                            className="border rounded-lg px-2 py-1 text-sm"
                            value={selectValue}
                            onChange={(e) =>
                              handleAssignTeam(task.task_id, e.target.value)
                            }
                            disabled={assigned} // disable if already assigned
                          >
                            <option value="">-- Assign Team --</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.team_name}
                              </option>
                            ))}
                          </select>

                          <button
                            className={`px-3 py-1 rounded-lg text-sm ${
                              assigned
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : draftVal
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-700 cursor-not-allowed"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!assigned && draftVal) {
                                handleSaveAssignment(task.task_id, draftVal);
                              }
                            }}
                            disabled={assigned || !draftVal}
                          >
                            {assigned ? "Assigned" : "Save"}
                          </button>

                          {assigned && (
                            <span className="text-xs text-gray-600">
                              Assigned to team ID {task.team_id}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                className="px-4 py-2 bg-[#4c735c] text-white rounded-lg hover:bg-blue-700 transition"
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
                      className="px-3 py-1 bg-[#4c735c] text-white text-sm rounded-md hover:bg-green-700 transition"
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
                          {/* View ID button */}
                          <button
                            onClick={() => setSelectedWorker(worker.id)}
                            className="px-3 py-1 bg-[#4c735c] text-white text-xs rounded-md hover:bg-blue-700 transition"
                          >
                            View ID
                          </button>
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

        {activeTab === "timeline" && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Project Timeline
            </h2>
            <div
              ref={ganttRef}
              className="w-full h-[80vh] gantt-container"
            ></div>
          </div>
        )}

{activeTab === "reports" && (
  <div>
    {/* Reports Sub-Tab Navigation */}
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setReportTab("create")}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          reportTab === "create"
            ? "bg-[#4c735c] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Create Report
      </button>
      <button
        onClick={() => setReportTab("sent")}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          reportTab === "sent"
            ? "bg-[#4c735c] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        My Reports
      </button>
    </div>

    {/* Create Report Form */}
    {reportTab === "create" && (
      <div>
        <h2 className="text-2xl font-bold mb-6">Submit Report</h2>
        <form onSubmit={handleSubmitReport} className="space-y-4">
          {/* Task */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Task</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={report.task_id}
              onChange={(e) => setReport({ ...report, task_id: e.target.value })}
            >
              <option value="">-- Select Task --</option>
              {milestones.flatMap((ms) =>
                ms.tasks.map((task) => (
                  <option key={task.task_id} value={task.task_id}>
                    {ms.milestone_title} - {task.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Report Type
            </label>
            <select
              required
              className="w-full border rounded-lg px-3 py-2"
              value={report.report_type}
              onChange={(e) =>
                setReport({ ...report, report_type: e.target.value })
              }
            >
              <option value="">-- Select Report Type --</option>
              <option value="Update">Update</option>
              <option value="Final">Final</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={report.title}
              onChange={(e) => setReport({ ...report, title: e.target.value })}
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Details / Summary
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows="4"
              value={report.summary}
              onChange={(e) =>
                setReport({ ...report, summary: e.target.value })
              }
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              File Upload
            </label>
            <input
              name="report_file"
              type="file"
              className="w-full"
              onChange={(e) =>
                setReport({ ...report, file: e.target.files[0] })
              }
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit Report
          </button>
        </form>
      </div>
    )}

            {/* My Reports List */}
            {reportTab === "sent" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Reports</h2>
                {myReports.length > 0 ? (
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border-b text-left text-sm">Title</th>
                        <th className="px-4 py-2 border-b text-left text-sm">
                          Report Type
                        </th>
                        <th className="px-4 py-2 border-b text-left text-sm">Task</th>
                        <th className="px-4 py-2 border-b text-left text-sm">
                          Submitted At
                        </th>
                        <th className="px-4 py-2 border-b text-left text-sm">File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReports.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">{r.title}</td>
                          <td className="px-4 py-2 border-b">{r.report_type}</td>
                          <td className="px-4 py-2 border-b">{r.task_title}</td>
                          <td className="px-4 py-2 border-b">
                            {new Date(r.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {r.file_url ? (
                              <a
                                href={r.file_url}
                                target="_blank"
                                className="text-blue-600 underline"
                              >
                                View File
                              </a>
                            ) : (
                              "No File"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 italic">You haven’t submitted reports yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {expandedTask && (
        <TaskModal
          task={expandedTask}
          teams={teams}
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

      {/* Worker ID Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-10000">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-5xl w-full relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* ID Card Component */}
            <WorkerIDCard
              workerId={selectedWorker}
              onBack={() => setSelectedWorker(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
