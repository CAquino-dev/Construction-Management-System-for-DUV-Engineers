import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

export const MyProjectViewMilestone = ({ milestone, onClose }) => {
  console.log('mileee', milestone)

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

  // Helper to format date or show placeholder
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

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
        </div>

        {/* Pictures Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pictures</h3>
          <div className="flex overflow-x-auto space-x-2 py-2">
            {milestone.project_photo ? (
              <img
                src={`http://localhost:5000${milestone.project_photo}`}
                alt="Milestone"
                className="w-24 h-24 object-cover rounded-md cursor-pointer"
                onClick={() => openFullscreen(milestone.project_photo)}
              />
            ) : (
              <p className="text-sm text-gray-600">No pictures uploaded.</p>
            )}
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
            <div className="relative bg-white p-4 rounded-lg max-w-[90%] sm:max-w-[800px]">
              <img
                src={`http://localhost:5000${fullscreenImage}`}
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
      </div>
    </div>
  );
};
