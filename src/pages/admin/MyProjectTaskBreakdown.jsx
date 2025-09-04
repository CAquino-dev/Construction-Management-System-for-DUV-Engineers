import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const MyProjectTaskBreakdown = () => {
  const { projectId, milestoneId } = useParams();
  const [milestone, setMilestone] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks"); // NEW

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
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestoneTasks/${milestoneId}`
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
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestoneTaskReports/${milestoneId}`
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/addTask/${milestoneId}`,
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/deleteTask/${taskId}`,
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/updateTask/${editingTaskId}`,
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Task Breakdown</h2>
          {milestone && (
            <p className="text-gray-600">
              Milestone: <span className="font-medium">{milestone.title}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 px-4 py-2 rounded-md"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 ${
            activeTab === "tasks"
              ? "border-b-2 border-[#4c735c] font-semibold"
              : "text-gray-500"
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 ${
            activeTab === "reports"
              ? "border-b-2 border-[#4c735c] font-semibold"
              : "text-gray-500"
          }`}
        >
          Task Reports
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg shadow-sm bg-white space-y-2"
              >
                {editingTaskId === task.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTaskData.title}
                      onChange={(e) =>
                        setEditTaskData({
                          ...editTaskData,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <textarea
                      value={editTaskData.details}
                      onChange={(e) =>
                        setEditTaskData({
                          ...editTaskData,
                          details: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="date"
                      value={editTaskData.start_date}
                      onChange={(e) =>
                        setEditTaskData({
                          ...editTaskData,
                          start_date: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={editTaskData.priority}
                      onChange={(e) =>
                        setEditTaskData({
                          ...editTaskData,
                          priority: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <select
                      value={editTaskData.status}
                      onChange={(e) =>
                        setEditTaskData({
                          ...editTaskData,
                          status: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateTask}
                        className="bg-[#4c735c] text-white px-4 py-2 rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="bg-gray-300 px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.details}</p>
                    <p className="text-xs text-gray-500">
                      {task.start_date
                        ? `Start: ${new Date(
                            task.start_date
                          ).toLocaleDateString()}`
                        : ""}
                      {" | "}
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs">
                      <span className="font-medium">Status:</span> {task.status}{" "}
                      | <span className="font-medium">Priority:</span>{" "}
                      {task.priority}
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add Task button */}
          <div className="mt-6">
            {!isAddingTask ? (
              <button
                onClick={() => setIsAddingTask(true)}
                className="bg-[#4c735c] text-white px-6 py-3 rounded-md"
              >
                + Add Task
              </button>
            ) : (
              <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Task details"
                  value={newTask.details}
                  onChange={(e) =>
                    setNewTask({ ...newTask, details: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="date"
                  value={newTask.start_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, start_date: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="bg-[#4c735c] text-white px-4 py-2 rounded-md"
                  >
                    Save Task
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="bg-gray-300 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-gray-500">No reports submitted yet.</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <h4 className="font-semibold">{report.task_title}</h4>
                <p className="text-sm text-gray-600">{report.summary}</p>
                <p className="text-xs text-gray-500">
                  Submitted on:{" "}
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
                  {report.file_url && (
                    <div>
                      <strong>Attached Proposal PDF:</strong><br />
                      <a href={`${import.meta.env.VITE_REACT_APP_API_URL}${report.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        View/Download PDF
                      </a>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
