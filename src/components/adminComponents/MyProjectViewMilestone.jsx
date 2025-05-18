import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

<<<<<<< HEAD
export const MyProjectViewMilestone = ({ milestone, onClose }) => {
  console.log('mileee', milestone)

=======
export const MyProjectViewMilestone = ({ milestone, onClose, onManageExpenses }) => {
  console.log('milestone',)
>>>>>>> ca5010a09f6de701bd4711e5cd9a87192bc446c7
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const openFullscreen = (image) => {
    setFullscreenImage(image);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage(null);
  };

<<<<<<< HEAD
  // Helper to format date or show placeholder
=======
>>>>>>> ca5010a09f6de701bd4711e5cd9a87192bc446c7
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Construct base URL for serving files
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[800px] h-auto sm:h-[600px] overflow-y-auto flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-500 cursor-pointer"
        >
          <X size={24} />
        </button>

<<<<<<< HEAD
        {/* Header */}
        <h2 className="text-xl font-semibold mb-4">Milestone Details</h2>
        
        {/* Timestamp */}
        <p className="text-sm text-gray-600 mb-4">
          Created on: {formatDate(milestone.timestamp)}
        </p>

        {/* Milestone Description */}
        <p className="text-xl font-bold mb-1">{milestone.status}</p>
        <p className="text-md mb-4 whitespace-pre-line">{milestone.details}</p>

        {/* Progress & Payment Info */}
        <div className="mb-4 space-y-1">
          <p>
            <span className="font-semibold">Progress Status:</span>{' '}
            <span className="capitalize">{milestone.progress_status || 'N/A'}</span>
          </p>
          <p>
            <span className="font-semibold">Expected Payment Amount:</span>{' '}
            ₱{milestone.payment_amount ?? '0.00'}
          </p>
          <p>
            <span className="font-semibold">Budget Amount:</span>{' '}
            ₱{milestone.budget_amount ?? '0.00'}
          </p>
          <p>
            <span className="font-semibold">Due Date:</span> {formatDate(milestone.due_date)}
          </p>
          <p>
            <span className="font-semibold">Start Date:</span> {formatDate(milestone.start_date)}
          </p>
          <p>
            <span className="font-semibold">Completion Date:</span> {formatDate(milestone.completion_date)}
          </p>
=======
        <h2 className="text-xl font-semibold mb-4">Milestone Details</h2>
        <p className="text-sm text-gray-600 mb-4">Created on: {formatDate(milestone.timestamp)}</p>
        <p className="text-xl font-bold mb-1">{milestone.status}</p>
        <p className="text-md mb-4 whitespace-pre-line">{milestone.details}</p>

        <div className="mb-4 space-y-1">
          <p><span className="font-semibold">Progress Status:</span> <span className="capitalize">{milestone.progress_status || 'N/A'}</span></p>
          <p><span className="font-semibold">Expected Payment Amount:</span> ₱{milestone.payment_amount ?? '0.00'}</p>
          <p><span className="font-semibold">Budget Amount:</span> ₱{milestone.budget_amount ?? '0.00'}</p>
          <p><span className="font-semibold">Due Date:</span> {formatDate(milestone.due_date)}</p>
          <p><span className="font-semibold">Start Date:</span> {formatDate(milestone.start_date)}</p>
          <p><span className="font-semibold">Completion Date:</span> {formatDate(milestone.completion_date)}</p>
>>>>>>> ca5010a09f6de701bd4711e5cd9a87192bc446c7
        </div>

        {/* Pictures Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pictures</h3>
          <div className="flex overflow-x-auto space-x-2 py-2">
            {milestone.project_photo ? (
              <img
<<<<<<< HEAD
                src={`http://localhost:5000${milestone.project_photo}`}
=======
                src={`${baseUrl}${milestone.project_photo}`}
>>>>>>> ca5010a09f6de701bd4711e5cd9a87192bc446c7
                alt="Milestone"
                className="w-24 h-24 object-cover rounded-md cursor-pointer"
                onClick={() => openFullscreen(milestone.project_photo)}
              />
            ) : (
              <p className="text-sm text-gray-600">No pictures uploaded.</p>
            )}
          </div>
        </div>

        {/* PDF Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Estimated Cost PDF</h3>
          {milestone.estimated_cost_pdf ? (
            <>
              {/* Link to open PDF in new tab */}
              <a
                href={milestone.estimated_cost_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View PDF
              </a>

              {/* Embedded PDF preview */}
              <div className="mt-2 border rounded-md overflow-hidden" style={{ height: '400px' }}>
                <iframe
                  src={milestone.estimated_cost_pdf}
                  title="Estimated Cost PDF"
                  className="w-full h-full"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600">No PDF uploaded for this milestone.</p>
          )}
        </div>

        {/* Fullscreen Image Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
            <div className="relative bg-white p-4 rounded-lg max-w-[90%] sm:max-w-[800px]">
              <img
<<<<<<< HEAD
                src={`http://localhost:5000${fullscreenImage}`}
=======
                src={`${fullscreenImage}`}
>>>>>>> ca5010a09f6de701bd4711e5cd9a87192bc446c7
                alt="Fullscreen"
                className="w-full h-auto object-contain"
              />
              <button
                onClick={closeFullscreen}
                className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-500 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}
<<<<<<< HEAD
=======

        <button
          onClick={() => {
            if (typeof onManageExpenses === 'function') {
              onManageExpenses(milestone.id);
            }
          }}
          className="mt-4 px-4 py-2 bg-[#4c735c] text-white rounded"
        >
          Manage Expenses
        </button>
>>>>>>> ca5010a09f6de701bd4711e5cd9a87192bc446c7
      </div>
    </div>
  );
};
