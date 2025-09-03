import React, { useState } from "react";

const AddTeamModal = ({ onClose, onSave }) => {
  const [teamName, setTeamName] = useState("");

    const userId = localStorage.getItem('userId');

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!teamName.trim()) return;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/addTeam/${userId}`, // replace userId with actual foremanId
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team_name: teamName }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to create team:", data.error || data.message);
      return;
    }

    // Pass data back to parent with server response
    onSave(data);
  } catch (error) {
    console.error("Error creating team:", error);
  }

  setTeamName("");
  onClose();
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Add New Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Team A"
            />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
