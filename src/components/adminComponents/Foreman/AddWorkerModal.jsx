import React, { useState } from "react";

const AddWorkerModal = ({ team, onClose, onSave }) => {
  const [worker, setWorker] = useState({
    name: "",
    contact: "",
    skill_type: "",
    status: "active",
  });

  console.log(team.id);

  const handleChange = (e) => {
    setWorker({ ...worker, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!worker.name.trim()) return;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/addWorker/${team.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(worker),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to add worker");
    }

    const data = await res.json();

    // Pass the worker back with teamId and backend id
    onSave({ ...data, team_id: team.id });

    // Reset form
    setWorker({
      name: "",
      contact: "",
      skill_type: "",
      status: "active",
    });

    onClose();
  } catch (error) {
    console.error("Error adding worker:", error);
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Add Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={worker.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              value={worker.contact}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="0917-xxxxxxx"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Skill Type
            </label>
            <input
              type="text"
              name="skill_type"
              value={worker.skill_type}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Mason / Carpenter"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Status
            </label>
            <select
              name="status"
              value={worker.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;
