import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import ConfirmationModal from '../ConfirmationModal';

export const MyProjectAddMilestone = ({ onSave, onCancel, project }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [items, setItems] = useState([{ item_name: '', category: 'Materials', quantity: '' }]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { item_name: '', category: 'Materials', quantity: '' }]);
  };

  const removeItemRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim() || !details.trim()) {
      alert('Please fill in milestone title and details.');
      return false;
    }
    if (!items.length || items.some(item => !item.item_name.trim() || !item.category.trim() || !item.quantity)) {
      alert('Please fill in all item details.');
      return false;
    }
    return true;
  };

  const handleConfirmation = async () => {
    if (!validateForm()) return;

    const payload = {
      project_id: project.id,
      title,
      details,
      start_date: startDate || '',
      due_date: dueDate || '',
      items: items.map(i => ({
        item_name: i.item_name,
        category: i.category,
        quantity: Number(i.quantity)
      }))
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/createMilestone`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert('Milestone Added Successfully');
        onSave(data);
      } else {
        alert('An error occurred while adding the milestone');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting milestone');
    }

    setIsConfirmationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[800px] h-auto sm:h-[600px] overflow-y-auto flex flex-col relative">
        <button onClick={onCancel} className="absolute top-2 right-2 text-gray-600 text-xl">
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Milestone</h2>

        <label className="block text-sm font-semibold mb-2">Milestone Title</label>
        <input
          type="text"
          placeholder="Enter milestone title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full text-sm border p-2 mb-4"
        />

        <label className="block text-sm font-semibold mb-2">Details</label>
        <textarea
          placeholder="Enter milestone details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="block w-full text-sm border p-2 mb-4 h-24"
        />

        <label className="block text-sm font-semibold mb-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full text-sm border p-2 mb-4"
        />

        <label className="block text-sm font-semibold mb-2">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="block w-full text-sm border p-2 mb-4"
        />

        <h3 className="text-lg font-semibold mb-2">Milestone Items</h3>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Item Name"
              value={item.item_name}
              onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
              className="flex-1 border p-2 text-sm"
            />
            <select
              value={item.category}
              onChange={(e) => handleItemChange(index, 'category', e.target.value)}
              className="flex-1 border p-2 text-sm"
            >
              <option value="Materials">Materials</option>
              <option value="Labor">Labor</option>
              <option value="Equipment">Equipment</option>
              <option value="Misc">Misc</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              className="w-24 border p-2 text-sm"
            />
            {items.length > 1 && (
              <button
                onClick={() => removeItemRow(index)}
                className="bg-red-500 text-white px-2 rounded"
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addItemRow}
          className="bg-green-500 text-white py-1 px-3 rounded text-sm mb-4"
        >
          + Add Item
        </button>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsConfirmationModalOpen(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
          >
            Save
          </button>
          <button onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>

      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={handleConfirmation}
          actionType="Save Milestone"
        />
      )}
    </div>
  );
};
