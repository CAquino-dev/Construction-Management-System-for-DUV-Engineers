import React, { useState } from 'react';
import { X } from "@phosphor-icons/react"; // Import the X icon

export const MyProjectAddExpenses = ({ closeModal, handleAddExpense }) => { // Receive handleAddExpense function as prop
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [pricePerQty, setPricePerQty] = useState('');
  const [amount, setAmount] = useState(''); // New state for manual amount

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure we check if the custom amount is provided
    const newExpense = {
      id: Date.now(), // Unique ID based on current timestamp
      date,
      title,
      quantity,
      unit,
      pricePerQty,
      amount: amount !== '' ? parseFloat(amount) : pricePerQty * quantity, // Use custom amount if available, otherwise calculate it
    };

    handleAddExpense(newExpense); // Add the new expense using the parent function
    closeModal(); // Close the modal after submission
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Price per Qty (₱)</label>
            <input
              type="number"
              value={pricePerQty}
              onChange={(e) => setPricePerQty(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount (₱)</label>
            <input
              type="number"
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              value={amount} // Bind the amount to state
              onChange={(e) => setAmount(e.target.value)} // Allow the user to change the amount manually
              placeholder={`₱${pricePerQty * quantity}`} // Show calculated value as placeholder
            />
          </div>

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
