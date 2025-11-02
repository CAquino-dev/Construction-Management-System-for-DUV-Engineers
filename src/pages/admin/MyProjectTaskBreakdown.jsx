import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export const MyProjectTaskBreakdown = () => {
  const userId = localStorage.getItem("userId");
  const { projectId, milestoneId } = useParams();
  const [milestone, setMilestone] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("");
  const [reportId, setReportId] = useState("");
  const permissions = JSON.parse(localStorage.getItem("permissions"));

  const [newTask, setNewTask] = useState({
    title: "",
    details: "",
    start_date: "",
    due_date: "",
    status: "Pending",
    priority: "Medium",
  });

  const [editTaskData, setEditTaskData] = useState(null);
  const navigate = useNavigate();

  // Fetch milestone + tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/project/getMilestoneTasks/${milestoneId}`
        );
        if (res.ok) {
          const data = await res.json();
          setMilestone(data.milestone);
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error("Failed to fetch task breakdown", err);
      }
    };
    fetchData();
  }, [milestoneId]);

  // Fetch reports for this milestone
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/project/getMilestoneTaskReports/${milestoneId}`
        );
        if (res.ok) {
          const data = await res.json();
          setReports(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }
    };
    fetchReports();
  }, [milestoneId]);

  // Add a task
  const handleAddTask = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/project/addTask/${milestoneId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        }
      );

      if (res.ok) {
        const task = await res.json();
        setTasks((prev) => [...prev, task]);
      }

      setNewTask({
        title: "",
        details: "",
        start_date: "",
        due_date: "",
        status: "Pending",
        priority: "Medium",
      });
      setIsAddingTask(false);
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  // Edit a task
  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTaskData({ ...task });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/project/deleteTask/${taskId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Save updated task
  const handleUpdateTask = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/project/updateTask/${editingTaskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editTaskData),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? updated.task : t))
        );
      }

      setEditingTaskId(null);
      setEditTaskData(null);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const openPopup = (action, reportId) => {
    setIsOpen(true);
    setAction(action);
    setReportId(reportId);
  };

  const handleReport = async () => {
    try {
      const res = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/engr/updateForemanReports/${reportId}`,
        {
          status: action,
          engineer_id: userId,
          comment: comment,
        }
      );

      setAction("");
      setComment("");
      setReportId("");
      setIsOpen(false);
    } catch (err) {
      console.error("Error handling the report:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Task Breakdown
            </h2>
            {milestone && (
              <p className="text-gray-600 mt-1">
                Milestone:{" "}
                <span className="font-semibold text-[#4c735c]">
                  {milestone.title}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "tasks"
                ? "border-b-2 border-[#4c735c] text-[#4c735c]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "reports"
                ? "border-b-2 border-[#4c735c] text-[#4c735c]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Task Reports
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks created yet.</p>
                {permissions?.role_name === "Engineer" && (
                  <p className="text-sm mt-2">
                    Click "Add Task" to create your first task.
                  </p>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingTaskId === task.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTaskData.title}
                        onChange={(e) =>
                          setEditTaskData({
                            ...editTaskData,
                            title: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                        placeholder="Task title"
                      />
                      <textarea
                        value={editTaskData.details}
                        onChange={(e) =>
                          setEditTaskData({
                            ...editTaskData,
                            details: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                        placeholder="Task details"
                        rows="3"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={editTaskData.start_date}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              start_date: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                        />
                        <input
                          type="date"
                          value={editTaskData.due_date}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              due_date: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={editTaskData.priority}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              priority: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                        </select>
                        <select
                          value={editTaskData.status}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              status: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleUpdateTask}
                          className="flex-1 bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{task.details}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            Dates:
                          </span>
                          <span className="text-gray-600">
                            {task.start_date
                              ? `${new Date(
                                  task.start_date
                                ).toLocaleDateString()} - `
                              : ""}
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            Status:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "Blocked"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            Priority:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}

            {/* Add Task Section */}
            {permissions?.role_name === "Engineer" && (
              <div className="mt-6">
                {!isAddingTask ? (
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="w-full sm:w-auto bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>+</span>
                    <span>Add New Task</span>
                  </button>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-semibold text-gray-800">
                      Create New Task
                    </h3>
                    <input
                      type="text"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                    />
                    <textarea
                      placeholder="Task details"
                      value={newTask.details}
                      onChange={(e) =>
                        setNewTask({ ...newTask, details: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                      rows="3"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={newTask.start_date}
                        onChange={(e) =>
                          setNewTask({ ...newTask, start_date: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) =>
                          setNewTask({ ...newTask, due_date: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                      />
                    </div>
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({ ...newTask, priority: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAddTask}
                        className="flex-1 bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        Create Task
                      </button>
                      <button
                        onClick={() => setIsAddingTask(false)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reports submitted yet.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {report.task_title}
                      </h3>
                      <h4 className="text-gray-600 font-medium">
                        {report.title}
                      </h4>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {report.report_type}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{report.summary}</p>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
                    <div className="text-gray-500">
                      Submitted:{" "}
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>

                    {report.file_url && (
                      <a
                        href={`${import.meta.env.VITE_REACT_APP_API_URL}${
                          report.file_url
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <span>📄</span>
                        <span>View Proposal PDF</span>
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => openPopup("accepted", report.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => openPopup("rejected", report.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {action === "accepted" ? "Accept Report" : "Reject Report"}
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent outline-none"
                placeholder="Write your comment..."
                rows={4}
              ></textarea>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  className="flex-1 bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
