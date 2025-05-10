import React, { useState } from 'react';

export const MyProjectSupplyRequest = ({ closeModal, handleAddNewRequest }) => {
  const [items, setItems] = useState([
    {
      itemName: '',
      quantity: 0,
      unit: '',
      amount: 0,
      total: 0,
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [title, setTitle] = useState(''); // State to store title input

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // If quantity or amount is changed, recalculate total for the row
    if (field === 'quantity' || field === 'amount') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].amount;
    }

    // If total is manually customized, set it directly
    if (field === 'total') {
      updatedItems[index].total = parseFloat(value);  // Ensure it's a number
    }

    setItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        itemName: '',
        quantity: 0,
        unit: '',
        amount: 0,
        total: 0, // Start new row with total 0
      },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      title,
      items,
      total_budget: totalAmount, // Send the total amount as part of the request
      status: "Pending",
      date: new Date().toLocaleDateString(),
      date_needed: new Date().toLocaleDateString(), // You can modify this as per your needs
    };

    handleAddNewRequest(newRequest); // Pass the new request to the parent
    closeModal();
  };

  const calculateTotal = (updatedItems) => {
    // Recalculate total amount by summing up all item totals
    const total = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setTotalAmount(total);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[900px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Supply Request</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-black">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Update title state
              className="mt-2 p-2 border border-gray-300 rounded w-full"
              placeholder="Enter title for the request"
              required
            />
          </div>

          <div className="mb-4 max-h-60 h-60 overflow-y-auto space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleChange(index, 'itemName', e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleChange(index, 'unit', e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Amount (per qty) (₱)</label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleChange(index, 'amount', e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Total (₱)</label>
                  <input
                    type="number"
                    value={item.total}
                    onChange={(e) => handleChange(index, 'total', e.target.value)} // Customizable total input
                    className="mt-2 p-2 border border-gray-300 rounded w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-[#3b5d47] text-white px-4 py-2 rounded-md"
            >
              Add Row
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-md font-medium text-gray-700">Total Amount: <strong>₱{totalAmount}</strong></label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#3b5d47] text-white px-4 py-2 rounded-md"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
