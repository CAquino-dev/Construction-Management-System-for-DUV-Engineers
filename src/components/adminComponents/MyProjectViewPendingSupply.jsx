import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import ConfirmationModal from "./ConfirmationModal"; // Import ConfirmationModal

export const MyProjectViewPendingSupply = ({ data, closeModal, handleCancelRequest }) => {
  console.log(data);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal
  const [remark, setRemark] = useState(""); // State for the remark input
  const [actionType, setActionType] = useState(null);

  // Open the confirmation modal
  const openConfirmationModal = (type) => {
    setActionType(type)
    setIsConfirmationModalOpen(true); // Open modal
  };

  // Close the confirmation modal
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false); // Close modal
  };

  // Handle the cancellation confirmation
const handleConfirmation = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/project/expenses/${data.expense_id}/engineer-approval`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: actionType }),  // No remarks yet
    });

    if (res.ok) {
      alert('Approval status updated successfully');
      closeConfirmationModal();
      closeModal();
      // Optionally refresh list or trigger parent update here
    } else {
      const errorData = await res.json();
      alert('Failed to update status: ' + (errorData.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
};



  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[900px] max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">View Pending Supply</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-black">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Supply Details Section */}
        <div className="mb-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Date: {data.date}</p>
            <p className="text-gray-700">
              Title: <strong>{data.description}</strong>
            </p>
            <p className="text-gray-700">
              Budget Needed: <strong>{data.amount}</strong>
            </p>
            <p className="text-gray-700">
              Status: <strong className="text-yellow-600">{data.status}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => openConfirmationModal("Approved")} // Open the confirmation modal
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Approve Request
          </button>
          <button
            onClick={() => openConfirmationModal("Rejected")} // Open the confirmation modal
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Cancel Request
          </button>
          <button
            onClick={closeModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {/* Add mo na lang remarks. Hindi ko alam how ginawa mo e */}
      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeConfirmationModal}
          onConfirm={handleConfirmation}
          actionType={actionType}
          setRemark={setRemark}   // pass setRemark here
        />
      )}
    </div>
  );
};
