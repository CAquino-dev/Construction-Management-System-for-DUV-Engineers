import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { Eye, X } from "@phosphor-icons/react";

export const FinanceBudgetSupplyRequestView = ({ data, onClose }) => {
  // API call to update finance approval status
  const updateFinanceApproval = async (newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/expenses/${data.id}/finance-approval`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update finance approval");
        return false;
      }

      alert(`Request ${newStatus.toLowerCase()} successfully!`);
      return true;
    } catch (error) {
      alert("Network error: " + error.message);
      return false;
    }
  };

  const handleApprove = async () => {
    const success = await updateFinanceApproval("Approved");
    if (success) onClose();
  };

  const handleReject = async () => {
    const success = await updateFinanceApproval("Rejected");
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[900px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Request</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Date: {data.date}</p>
          <p className="text-gray-700">
            Title: <strong>{data.title}</strong>
          </p>
          <p className="text-gray-700">
            Description: <em>{data.description}</em>
          </p>
          <p className="text-gray-700">
            Budget Needed: <strong>₱{data.total_budget}</strong>
          </p>
          <p className="text-gray-700">
            Date Needed: <strong>{data.date_needed}</strong>
          </p>
          <p className="text-gray-700">
            Status:{" "}
            <strong
              className={
                data.status === "Pending"
                  ? "text-yellow-600"
                  : data.status === "Approved"
                  ? "text-green-600"
                  : ""
              }
            >
              {data.status}
            </strong>
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve Request
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};
