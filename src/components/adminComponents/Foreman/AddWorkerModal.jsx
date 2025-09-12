import React, { useState } from "react";
import axios from "axios";
import { Form } from "react-router";

const AddWorkerModal = ({ team, onClose, onSave }) => {
  const [worker, setWorker] = useState({
    name: "",
    contact: "",
    skill_type: "",
    status: "active",
  });
  const [photo, setPhoto] = useState();
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setWorker({ ...worker, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // create a temporary preview URL
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!worker.name.trim()) return;

  const formData = new FormData();
  formData.append("name", worker.name);
  formData.append("contact", worker.contact);
  formData.append("skill_type", worker.skill_type);
  formData.append("status", worker.status);
  if (photo) formData.append("photo", photo);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/addWorker/${team.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert("Worker added successfully!");

    // Update parent with the new worker (backend response)
    onSave({ ...res.data, team_id: team.id });

    // Reset form
    setWorker({ name: "", contact: "", skill_type: "", status: "active" });
    setPhoto(null);
    setPreview(null);
    onClose();
  } catch (error) {
    console.error("Error adding worker:", error);
    alert("Failed to add worker. Please try again.");
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

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              ID Photo
            </label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="border p-2 w-full"
            />
          </div>

          {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full border"
            />
          </div>
        )}

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
