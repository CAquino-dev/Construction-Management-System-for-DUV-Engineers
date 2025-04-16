import React, { useState } from 'react'
import { X } from "@phosphor-icons/react";

export const AddItemModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        item: "",
        category: "",
        quantity_available: "",
    });

    const catergories = ["steel", "nail", "wood"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50'>
        <div className='bg-white p-6 rounded-lg shadow-lg w-[38rem] overflow-y-auto max-h-[90vh]'>
            <div className='flex justify-between items-center border-b pb-2'>
                <h2 className='text-lg font-bold text-gray-800'>Add items</h2>
                <button
                onClick={onClose}
                className='text-gray-600 hover:text-red-500 cursor-pointer'
                >
                    <X size={20} />
                </button>
            </div>
            <form action="" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <input type="text" name='item' placeholder='Item' value={formData.item} onChange={handleChange} className='w-full px-3 py-2 border rounded-md' required />
                <select name="category" onChange={handleChange} className='w-full px-3 py-2 border rounded-md' required>
                    {catergories.map((category) => (<option key={category} value={category}>{category}</option>))}
                </select>
                <input type="number" name='quantity_available' placeholder='Quantity Available' value={formData.quantity_available} onChange={handleChange} className='w-full px-3 py-2 border rounded-md' required />
            </form>
        </div>
    </div>
  )
}
