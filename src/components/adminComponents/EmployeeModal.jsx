import React from 'react';
import { X } from '@phosphor-icons/react';

const EmployeeModal = ({ selectedUser, closeModal }) => {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[40rem] animate-fadeIn"> {/* Adjusted to normal big size */}
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
        </div>

        {/* Info Section */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-gray-700">
          {/* Left Column */}
          <div>
            <p className='mb-4'><strong>Email:</strong> {selectedUser.email}</p>
            <p className='mb-4'><strong>Department:</strong> {selectedUser.department_name}</p>
            <p className='mb-4'><strong>Contact No:</strong> {selectedUser.contactNo}</p>
          </div>

          {/* Right Column */}
          <div>
            <p className='mb-4'><strong>Name:</strong> {selectedUser.full_name}</p>
            <p className='mb-4'><strong>Gender:</strong> {selectedUser.gender}</p>
            <p className='mb-4'><strong>Birthday:</strong> {selectedUser.birthday}</p>
            <p className='mb-4'><strong>Address:</strong> {selectedUser.address}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer">
            Deactivate
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            Edit
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
            View attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
