import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import ConfirmationModal from './ConfirmationModal';

export const MyProjectAddMilestone = ({ onSave, onCancel, project }) => {
  const [status, setStatus] = useState('');
  const [details, setDetails] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(''); // Expected payment amount
  const [budgetAmount, setBudgetAmount] = useState(''); // Budget amount
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleSave = () => {
    // Basic validation
    if (!status.trim() || !details.trim()) {
      alert('Please fill in both milestone title and details.');
      return false;
    }
    if (paymentAmount && isNaN(paymentAmount)) {
      alert('Please enter a valid number for Payment Amount');
      return false;
    }
    if (budgetAmount && isNaN(budgetAmount)) {
      alert('Please enter a valid number for Budget Amount');
      return false;
    }
    return true;
  };

  const handleConfirmation = async () => {
    if (!handleSave()) return;

    const body = {
      status,
      details,
      payment_amount: paymentAmount || '0',
      budget_amount: budgetAmount || '0',
      due_date: dueDate || null,
      start_date: startDate || null,
      completion_date: completionDate || null,
      // progress_status is set by backend to 'For Payment' by default
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/createMilestones/${project.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Milestone Added Successfully');
        onSave(body); // Notify parent if needed
      } else {
        alert('An error occurred while adding the milestone');
      }
    } catch (error) {
      console.error('Error message:', error);
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

        <div>
          <label className="block text-sm font-semibold mb-2">Milestone Title</label>
          <input
            type="text"
            placeholder="Enter milestone title"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full text-sm border p-2 mb-4"
          />
          <label className="block text-sm font-semibold mb-2">Details</label>
          <textarea
            placeholder="Enter milestone details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="block w-full text-sm border p-2 mb-4 h-24"
          />
          <label className="block text-sm font-semibold mb-2">Payment Amount (₱)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter expected payment amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="block w-full text-sm border p-2 mb-4"
          />
          <label className="block text-sm font-semibold mb-2">Budget Amount (₱)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter budget amount"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            className="block w-full text-sm border p-2 mb-4"
          />
          <label className="block text-sm font-semibold mb-2">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="block w-full text-sm border p-2 mb-4"
          />
          <label className="block text-sm font-semibold mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full text-sm border p-2 mb-4"
          />
          <label className="block text-sm font-semibold mb-2">Completion Date</label>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            className="block w-full text-sm border p-2 mb-4"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={() => setIsConfirmationModalOpen(true)} className="bg-blue-500 text-white py-2 px-4 rounded mr-2">
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
