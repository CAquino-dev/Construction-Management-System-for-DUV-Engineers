import React from "react";
import { useState } from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, actionType, setRemark }) => {
  if (!isOpen) return null;
  console.log('action', actionType)

  const handleChange = (event) => {
    setRemark(event.target.value); // Update the remark text as the user types
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800">Confirm Action</h2>
        <p className="mt-2 text-gray-600">
          Are you sure you want to <strong>{actionType}</strong>?
        </p>

        {(actionType === "Rejected by HR" || actionType === "Rejected by Finance" || actionType === "Rejected") && (
          <div className="mt-4">
            <textarea
              className="w-full p-2 border rounded-md"
              placeholder="Enter a remark for rejection"
              onChange={handleChange}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#4c735c] text-white rounded-md hover:bg-[#3a5b47]">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
