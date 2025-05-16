import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import ConfirmationModal from "./ConfirmationModal"; // Import ConfirmationModal

export const MyProjectViewPendingSupply = ({ data, closeModal, handleCancelRequest }) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal
  const [remark, setRemark] = useState(""); // State for the remark input

  // Open the confirmation modal
  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true); // Open modal
  };

  // Close the confirmation modal
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false); // Close modal
  };

  // Handle the cancellation confirmation
  const handleCancelConfirmation = () => {
    handleCancelRequest(); // Call the cancel request function passed from parent
    closeConfirmationModal(); // Close the confirmation modal
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
              Title: <strong>{data.title}</strong>
            </p>
            <p className="text-gray-700">
              Budget Needed: <strong>{data.total_budget}</strong>
            </p>
            <p className="text-gray-700">
              Date Needed: <strong>{data.date_needed}</strong>
            </p>
            <p className="text-gray-700">
              Status: <strong className="text-yellow-600">{data.status}</strong>
            </p>
          </div>
        </div>

        {/* Items Table Section */}
        <div className="mb-4 max-h-[300px] overflow-y-auto">
          <h3 className="text-lg font-semibold">Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Item Name</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Unit</TableHead>
                <TableHead className="text-center">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.itemName}</TableCell>
                  <TableCell className="text-center">{item.qty}</TableCell>
                  <TableCell className="text-center">{item.unit}</TableCell>
                  <TableCell className="text-center">₱{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Approve Request
          </button>
          <button
            onClick={openConfirmationModal} // Open the confirmation modal
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
          onConfirm={handleCancelConfirmation} // Handle the cancel confirmation
          actionType="Cancel Request"
        />
      )}
    </div>
  );
};
