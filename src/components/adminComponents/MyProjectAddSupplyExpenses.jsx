import React, { useState } from 'react';
import { X } from "@phosphor-icons/react";

export const MyProjectAddSupplyExpenses = ({ closeModal, handleAddExpense, milestoneId }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [pricePerQty, setPricePerQty] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  // Dynamically update amount when quantity or pricePerQty changes
  const calculateAmount = () => {
    return Number(quantity) * Number(pricePerQty);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const calculatedAmount = Number(amount) || calculateAmount();

    // Build payload matching backend expectations
    const newExpense = {
      milestone_id: milestoneId,   // pass milestoneId prop to component
      expense_type: 'Supply',
      date: dateFrom,
      title: productName,    // map productName to description
      quantity: Number(quantity),
      unit,
      price_per_qty: Number(pricePerQty),
      amount: calculatedAmount,
      status: 'Requested'
    };

    console.log('data', newExpense)

    try {
      const res = await fetch('http://localhost:5000/api/project/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to add expense');
        return;
      }

      const data = await res.json();

      // Optionally pass the newly created expense back to parent component
      handleAddExpense({ ...newExpense, expense_id: data.expenseId });

      // Close modal after success
      closeModal();
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium">Date</label>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required className="w-full p-2 border rounded"/>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Product Name</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required className="w-full p-2 border rounded"/>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Quantity</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="w-full p-2 border rounded"/>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Unit</label>
        <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required className="w-full p-2 border rounded"/>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Price per Qty</label>
        <input type="number" value={pricePerQty} onChange={(e) => setPricePerQty(e.target.value)} required className="w-full p-2 border rounded"/>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Amount</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder={calculateAmount()} // Auto-calculate but allow edit 
          required 
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-[#3b5d47] text-white px-4 py-2 rounded-md">Add Expense</button>
      </div>
    </form>
  );
};
