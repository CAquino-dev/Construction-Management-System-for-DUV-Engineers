import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

export const MyProjectSupplyView = ({ item, onClose, onSave }) => {
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);

  const handleSave = () => {
    onSave({ ...item, quantity: editedQuantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit Inventory Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-2">
          <p><strong>Date Bought:</strong> {item.date_buy}</p>
          <p><strong>Item Name:</strong> {item.item_name}</p>
          <div>
            <p><strong>Quantity:</strong></p>
            <input
              type="number"
              value={editedQuantity}
              onChange={(e) => setEditedQuantity(Number(e.target.value))}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <p><strong>Unit:</strong> {item.unit}</p>
          <p><strong>Last Date Updated:</strong> {item.date_update}</p>
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
