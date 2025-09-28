import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import ConfirmationModal from "../ConfirmationModal";

export const MyProjectAddMilestone = ({ onSave, onCancel, project }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [boqs, setBoqs] = useState([]);
  const [selectedBoqs, setSelectedBoqs] = useState([]);
  const [mto, setMto] = useState({}); // { boqId: [{ material, quantity, unit_cost }] }
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
      alert("Please fill in milestone title and details.");
      return false;
    }
    if (!selectedBoqs.length) {
      alert("Please select at least one BOQ item.");
      return false;
    }
    // Check that each selected BOQ has MTO items
    for (let boqId of selectedBoqs) {
      if (!mto[boqId] || !mto[boqId].length) {
        alert("Please add MTO items for each selected BOQ.");
        return false;
      }
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
      mto_items: mto,
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
        alert("Milestone Added Successfully");
        onSave(data);
      } else {
        alert("An error occurred while adding the milestone");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting milestone");
    }

    setIsConfirmationModalOpen(false);
  };

  const addMtoItem = (boqId) => {
    setMto((prev) => ({
      ...prev,
      [boqId]: [
        ...(prev[boqId] || []),
        { description: "", unit: "", quantity: ""},
      ],
    }));
  };

  const updateMtoItem = (boqId, index, field, value) => {
    setMto((prev) => ({
      ...prev,
      [boqId]: prev[boqId].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeMtoItem = (boqId, index) => {
    setMto((prev) => ({
      ...prev,
      [boqId]: prev[boqId].filter((_, i) => i !== index),
    }));
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

              {/* MTO Section */}
              {selectedBoqs.includes(boq.id) && (
                <div className="pl-6 border-l-2 border-gray-300">
                  <h4 className="font-semibold mb-2">MTO Items</h4>
                  {(mto[boq.id] || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center mb-2 space-x-2"
                    >
                      <input
                        type="text"
                        placeholder="description"
                        value={item.description}
                        onChange={(e) =>
                          updateMtoItem(
                            boq.id,
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="border p-1 text-sm w-32"
                      />
                      <input
                        type="text"
                        placeholder="unit"
                        value={item.unit}
                        onChange={(e) =>
                          updateMtoItem(boq.id, index, "unit", e.target.value)
                        }
                        className="border p-1 text-sm w-32"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateMtoItem(
                            boq.id,
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="border p-1 text-sm w-20"
                      />
                      <button
                        type="button"
                        onClick={() => removeMtoItem(boq.id, index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addMtoItem(boq.id)}
                    className="text-blue-500 text-sm mt-1"
                  >
                    + Add MTO Item
                  </button>
                </div>
              )}
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
