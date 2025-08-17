import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

export const MyProjectViewMilestone = ({ milestone, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [items, setItems] = useState(milestone.items || []);

  const openFullscreen = (image) => {
    setFullscreenImage(image);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto compute totals
    if (field === 'quantity' || field === 'unit_cost') {
      const qty = parseFloat(updated[index].quantity) || 0;
      const unit = parseFloat(updated[index].unit_cost) || 0;
      updated[index].total_cost = qty * unit;
      updated[index].estimated_cost = qty * unit; // adjust if different formula
    }

    setItems(updated);
  };

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[800px] h-auto sm:h-[600px] overflow-y-auto flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-500 cursor-pointer"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Milestone Info */}
        <h2 className="text-xl font-semibold mb-4">Milestone Details</h2>
        <p className="text-sm text-gray-600 mb-4">Created on: {formatDate(milestone.timestamp)}</p>
        <p className="text-xl font-bold mb-1">{milestone.title}</p>
        <p className="text-md mb-4 whitespace-pre-line">{milestone.details}</p>

        <div className="mb-4 space-y-1">
          <p><span className="font-semibold">Status:</span> <span className="capitalize">{milestone.status || 'N/A'}</span></p>
          <p><span className="font-semibold">Due Date:</span> {formatDate(milestone.due_date)}</p>
          <p><span className="font-semibold">Start Date:</span> {formatDate(milestone.start_date)}</p>
        </div>

        {/* Editable Milestone Items */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Milestone Items</h3>
          {items.length > 0 ? (
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-1 text-left">Item Name</th>
                  <th className="border border-gray-300 px-3 py-1 text-left">Category</th>
                  <th className="border border-gray-300 px-3 py-1 text-right">Quantity</th>
                  <th className="border border-gray-300 px-3 py-1 text-right">Unit Cost</th>
                  <th className="border border-gray-300 px-3 py-1 text-right">Total Cost</th>
                  <th className="border border-gray-300 px-3 py-1 text-right">Estimated Cost</th>
                  <th className="border border-gray-300 px-3 py-1 text-right">Actual Cost</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-1">
                      <input
                        type="text"
                        value={item.item_name || ''}
                        onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                        className="w-full border px-2 py-1"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-1">
                      <input
                        type="text"
                        value={item.category || ''}
                        onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                        className="w-full border px-2 py-1"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-right">
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full border px-2 py-1 text-right"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-right">
                      <input
                        type="number"
                        value={item.unit_cost || ''}
                        onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                        className="w-full border px-2 py-1 text-right"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-right">
                      {item.total_cost || 0}
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-right">
                      {item.estimated_cost || 0}
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-right">
                      <input
                        type="number"
                        value={item.actual_cost || ''}
                        onChange={(e) => handleItemChange(idx, 'actual_cost', e.target.value)}
                        className="w-full border px-2 py-1 text-right"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-600">No milestone items found.</p>
          )}
        </div>

      </div>
    </div>
  );
};
