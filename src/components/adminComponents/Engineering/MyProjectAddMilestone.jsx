import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import ConfirmationModal from "../ConfirmationModal";
import { toast } from "sonner";

export const MyProjectAddMilestone = ({ onSave, onCancel, project }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [boqs, setBoqs] = useState([]);
  const [selectedBoqs, setSelectedBoqs] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/${project.id}/boq`
    )
      .then((res) => res.json())
      .then((data) => setBoqs(data))
      .catch((err) => console.error("Error fetching BOQ items:", err));
  }, [project.id]);

  const validateForm = () => {
    if (!title.trim() || !details.trim()) {
      toast.error("Please fill in milestone title and details.");
      return false;
    }
    if (!selectedBoqs.length) {
      toast.error("Please select at least one BOQ item.");
      return false;
    }
    return true;
  };

  const handleConfirmation = async () => {
    if (!validateForm()) return;

    const payload = {
      project_id: project.id,
      title,
      details,
      start_date: startDate || "",
      due_date: dueDate || "",
      boq_item_ids: selectedBoqs,
    };

    console.log("payload:", payload);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/createMilestones/${
          project.id
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Milestone Added Successfully");
        onSave(data);
      } else {
        toast.error("An error occurred while adding the milestone");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting milestone");
    }

    setIsConfirmationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[800px] h-auto sm:h-[600px] overflow-y-auto flex flex-col relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-600 text-xl"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Milestone</h2>

        {/* Title */}
        <label className="block text-sm font-semibold mb-2">
          Milestone Title
        </label>
        <input
          type="text"
          placeholder="Enter milestone title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full text-sm border p-2 mb-4"
        />

        {/* Details */}
        <div>
          <label className="block text-sm font-semibold mb-2">Details</label>
          <textarea
            placeholder="Enter milestone details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="block w-full text-sm border p-2 mb-4 h-40 resize-none overflow-y-auto"
          ></textarea>
        </div>

        {/* Dates */}
        <label className="block text-sm font-semibold mb-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full text-sm border p-2 mb-4"
        />

        <label className="block text-sm font-semibold mb-2">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="block w-full text-sm border p-2 mb-4"
        />

        {/* BOQ Items Selection */}
        <h3 className="text-lg font-semibold mb-2">Select BOQ Items</h3>
        {boqs.length ? (
          boqs.map((boq) => (
            <div key={boq.id} className="mb-4 border p-2 rounded">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  value={boq.id}
                  checked={selectedBoqs.includes(boq.id)}
                  onChange={(e) => {
                    const id = boq.id;
                    setSelectedBoqs((prev) =>
                      e.target.checked
                        ? [...prev, id]
                        : prev.filter((i) => i !== id)
                    );
                  }}
                  className="mr-2"
                />
                <span>
                  {boq.description} ({boq.unit}, {boq.quantity})
                </span>
              </label>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No BOQ items found for this project.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={() => setIsConfirmationModalOpen(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={handleConfirmation}
          actionType="Save Milestone"
        />
      )}
    </div>
  );
};
