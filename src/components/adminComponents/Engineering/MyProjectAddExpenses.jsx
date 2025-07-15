import React, { useState } from 'react';
import { X } from "@phosphor-icons/react"; // Import the X icon

export const MyProjectAddExpenses = ({ closeModal, handleAddExpense }) => { // Receive handleAddExpense function as prop
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(''); // New state for manual amount

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure amount is converted to a valid number and handle empty value
    const newExpense = {
      id: Date.now(), // Unique ID based on current timestamp
      date_from: dateFrom,
      date_to: dateTo,
      title,
      amount: amount !== '' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : 0, // Remove non-numeric characters if any
    };

    handleAddExpense(newExpense); // Add the new expense using the parent function
    closeModal(); // Close the modal after submission
  };

  const handleAmountChange = (e) => {
    // Update amount state with formatted value (currency format)
    const value = e.target.value;
    const formattedValue = value.replace(/[^\d.-]/g, ''); // Allow only numbers and the decimal point
    setAmount(formattedValue);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Project Expense</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-black">
            <X size={24} /> {/* X icon */}
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Date From */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

          {/* Date To */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount (₱)</label>
            <input
              type="number" // Change type to text for better currency handling
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              onChange={handleAmountChange} // Handle change with formatted value
              placeholder="₱0.00"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#3b5d47] text-white px-4 py-2 rounded-md"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
