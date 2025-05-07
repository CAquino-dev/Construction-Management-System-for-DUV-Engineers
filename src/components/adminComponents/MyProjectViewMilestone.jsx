import React, { useState } from 'react';
import { X } from '@phosphor-icons/react'; // Importing the close icon

export const MyProjectViewMilestone = ({ milestone, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false); // State to control fullscreen view
  const [fullscreenImage, setFullscreenImage] = useState(null); // Store image for fullscreen view

  // Handle opening picture in fullscreen
  const openFullscreen = (image) => {
    setFullscreenImage(image);
    setIsFullscreen(true);
  };

  // Handle closing fullscreen view
  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage(null);
  };

  // Handle file download
  const handleFileDownload = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[800px] h-auto sm:h-[600px] overflow-y-auto flex flex-col relative">
        
        {/* Close Button (X) */}
        <button
          onClick={onClose} // onClose to close the modal
          className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-500 cursor-pointer"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-semibold mb-4">Milestone Details</h2>

        <p className="text-sm text-gray-600 mb-4">{milestone.timestamp}</p>

        {/* Milestone Details */}
        <p className="text-xl font-bold mb-2">{milestone.status}</p>
        <p className="text-md mb-4">{milestone.details}</p>

        {/* Pictures Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pictures</h3>
          {/* Display pictures if there are any */}
          <div className="flex overflow-x-auto space-x-2 py-2">
            {milestone.pictures && milestone.pictures.length > 0 ? (
              milestone.pictures.map((picture, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(picture)}
                    alt="Uploaded"
                    className="w-24 h-24 object-cover rounded-md cursor-pointer"
                    onClick={() => openFullscreen(picture)} // Open picture in fullscreen
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No pictures uploaded.</p>
            )}
          </div>
        </div>

        {/* Files Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Files</h3>
          {/* Display files if there are any */}
          <div className="space-y-2">
            {milestone.files && milestone.files.length > 0 ? (
              milestone.files.map((file, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => handleFileDownload(file)} // Trigger file download
                    className="text-blue-500 text-sm"
                  >
                    Download
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No files uploaded.</p>
            )}
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
            <div className="relative bg-white p-4 rounded-lg max-w-[90%] sm:max-w-[800px]">
              <img
                src={URL.createObjectURL(fullscreenImage)}
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
