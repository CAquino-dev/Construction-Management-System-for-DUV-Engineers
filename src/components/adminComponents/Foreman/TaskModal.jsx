import React, { useEffect, useState } from "react";

const TaskModal = ({ task, teams, project, onClose }) => {
  const [status, setStatus] = useState(task.status);
  const [assignedTeam, setAssignedTeam] = useState(task.assigned_team || []);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const getMaterials = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getMaterials/${task.task_id}`
        );
        if (res.ok) {
          const data = await res.json();
          setMaterials(data);
        }
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    getMaterials();
  }, [task.task_id]);

  const handleSave = () => {
    // Call API to update task status + assigned teams
    console.log("Updated task:", {
      id: task.task_id,
      status,
      assignedTeam,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">{task.title}</h2>
        <p className="text-gray-600 mb-4">{task.details}</p>

        {/* Dates */}
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>
            <strong className="text-gray-700">Start:</strong>{" "}
            {new Date(task.start_date).toLocaleDateString()}
          </span>
          <span>
            <strong className="text-gray-700">Due:</strong>{" "}
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>

        {/* Status update */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Team assignment */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Assign Team
          </label>
          <select
            multiple
            value={assignedTeam}
            onChange={(e) =>
              setAssignedTeam(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
            className="w-full border rounded-lg p-2"
          >
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.team_name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold CTRL (Windows) or CMD (Mac) to select multiple
          </p>
        </div>

        {/* Materials */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Materials</h3>
          {materials?.length > 0 ? (
            <ul className="space-y-1">
              {materials.map((mat) => (
                <li
                  key={mat.id}
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>{mat.name}</span>
                  <span>
                    {mat.quantity} {mat.unit}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No materials listed.</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
