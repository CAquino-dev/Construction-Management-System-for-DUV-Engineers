import React from 'react';
import { X } from '@phosphor-icons/react';

const EmployeeModal = ({ selectedUser, closeModal }) => {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold text-gray-800">Employee Details</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mt-4">
          <img
            src={`#`} 
            alt="Profile"
            className="w-20 h-20 rounded-full border shadow-md"
          />
          <h3 className="mt-2 text-xl font-semibold">{selectedUser.fullname}</h3>
          <p className="text-gray-500 text-sm">{selectedUser.department}</p>
        </div>

        {/* Info Section */}
        <div className="mt-4 space-y-2 text-gray-700">
          <p><strong>Email:</strong> {selectedUser.gmail}</p>
          <p><strong>Department:</strong> {selectedUser.department}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-1 px-2 py-1 rounded-full text-white text-sm 
              ${selectedUser.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
              {selectedUser.status}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button  className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Deactivate
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
