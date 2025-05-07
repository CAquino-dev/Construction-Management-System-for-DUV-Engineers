import React, { useState } from 'react';
import { X } from '@phosphor-icons/react'; // Importing the close icon
import  ConfirmationModal  from './ConfirmationModal'; // Assuming your modal component

export const MyProjectAddMilestone = ({ onSave, onCancel }) => {
  const [status, setStatus] = useState('');
  const [details, setDetails] = useState('');
  const [pictures, setPictures] = useState([]);
  const [files, setFiles] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // Manage confirmation modal visibility
  const [remark, setRemark] = useState(''); // For rejection remark

  // Handle picture file selection
  const handlePictureChange = (e) => {
    const selectedPictures = Array.from(e.target.files);
    setPictures((prevPictures) => [...prevPictures, ...selectedPictures]);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  // Handle removing a picture or file
  const handleRemove = (index, type) => {
    if (type === 'picture') {
      setPictures((prevPictures) => prevPictures.filter((_, i) => i !== index));
    } else if (type === 'file') {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }
  };

  // Handle saving the new milestone
  const handleSave = () => {
    const newMilestone = { status, details, pictures, files };
    onSave(newMilestone); // Pass the new milestone to the parent component
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true); // Show confirmation modal
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false); // Close confirmation modal
  };

  const handleConfirmation = () => {
    handleSave(); // Save the milestone
    closeConfirmationModal(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[800px] h-auto sm:h-[600px] overflow-y-auto flex flex-col relative">
        {/* Close Button (X) */}
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-600 text-xl"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Milestone</h2>

        {/* Milestone Details */}
        <div>
          <label className="block text-sm font-semibold mb-2">Title</label>
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
          ></textarea>
        </div>

        {/* Picture Upload */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Add Pictures</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePictureChange}
            className="block w-full text-sm border p-2 mb-4"
          />
          {/* Display selected pictures */}
          <div className="flex overflow-x-auto space-x-2 py-2">
            {pictures.map((picture, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(picture)}
                  alt="Uploaded"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  onClick={() => handleRemove(index, 'picture')}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Add Files</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm border p-2 mb-4"
          />
          {/* Display selected files */}
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={() => handleRemove(index, 'file')}
                  className="bg-red-500 text-white text-sm px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={openConfirmationModal} // Open confirmation modal on save
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeConfirmationModal}
          onConfirm={handleConfirmation} // Confirm action to save milestone
          actionType="Save Milestone" // Customize actionType for clarity
          setRemark={setRemark} // Optional remark for rejection if necessary
        />
      )}
    </div>
  );
};
