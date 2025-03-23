import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';

export const AddEmployeeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    department: '',
    email: '',
  });

  const departments = ['Engineer', 'Architect', 'Finance',];

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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold text-gray-800">Add Employee</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="" disabled>Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-700 cursor-pointer">
              Add Employee
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
