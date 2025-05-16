import React, { useState } from 'react';
import { X } from "@phosphor-icons/react";

export const MyProjectAddSupplyExpenses = ({ closeModal, handleAddExpense }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [pricePerQty, setPricePerQty] = useState('');
  const [amount, setAmount] = useState('');

  // Dynamically update amount when quantity or pricePerQty changes
  const calculateAmount = () => {
    return Number(quantity) * Number(pricePerQty);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExpense = {
      id: Date.now(),
      date: dateFrom,
      title: productName,
      quantity: Number(quantity),
      unit,
      pricePerQty: Number(pricePerQty),
      amount: Number(amount) || calculateAmount(), // Keep edited or default calculated value
    };

    handleAddExpense(newExpense);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium">Date From</label>
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
