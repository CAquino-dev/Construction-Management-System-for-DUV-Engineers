import React from 'react';
import { X } from '@phosphor-icons/react';

export const ClientModal = ({ selectedClient, closeModal }) => {
  if (!selectedClient) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold text-gray-800">Client Details</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center mt-4">
          <img
            src={selectedClient.image || '/default-profile.png'} // Use actual image or fallback
            alt="Profile"
            className="w-20 h-20 rounded-full border shadow-md"
          />
          <h3 className="mt-2 text-xl font-semibold">{selectedClient.fullname}</h3>
          <p className="text-gray-500 text-sm">{selectedClient.gmail}</p>
        </div>

        <div className="mt-4">
          <p><strong>Contact:</strong> {selectedClient.contact}</p>
          <p><strong>Status: </strong>
            <span className={selectedClient.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
              {selectedClient.status}
            </span>
          </p>
        </div>

        <div className='mt-4 flex justify-end'>
          <button className='bg-red-500 text-white px-4 py-2 rounded'>Deactivate</button>
        </div>
      </div>
    </div>
  );
};
