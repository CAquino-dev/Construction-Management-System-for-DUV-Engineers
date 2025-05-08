import React, { useState } from 'react';
import { X } from '@phosphor-icons/react'; // Importing the close icon
import  ConfirmationModal  from './ConfirmationModal'; // Assuming your modal component
import { format } from 'date-fns';

export const MyProjectAddMilestone = ({ onSave, onCancel, project }) => {
  console.log('details', project)
  const [status, setStatus] = useState('');
  const [details, setDetails] = useState('');
  const [milestonePhoto, setMilestonePhoto] = useState(null); // State for storing the selected photo
  const [photoPreview, setPhotoPreview] = useState(null); // State for photo preview
  const [files, setFiles] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // Manage confirmation modal visibility
  const [remark, setRemark] = useState(''); // For rejection remark

  // Handle picture file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setMilestonePhoto(file);
  
    // Generate preview of the selected photo
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result); // Set the preview URL
    };
    if (file) {
      reader.readAsDataURL(file); // Read the file as a base64 URL
    }
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
    const newMilestone = { status, details, milestonePhoto};
    onSave(newMilestone); // Pass the new milestone to the parent component
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true); // Show confirmation modal
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false); // Close confirmation modal
  };

  const handleConfirmation = async () => {
    handleSave(); // Save the milestone

    const formData = new FormData();
    formData.append('status', status);
    formData.append('details', details);
    formData.append('project_photo', milestonePhoto);

    try {
      const response = await fetch(`http://localhost:5000/api/engr/createMilestones/${project.id}`,{
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Milestone Added Successfully');
      } else {
        alert('An error occurred while adding the milestone');
      }
    } catch (error) {
      console.log('Error message:', error);
    }

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
          <label className="block text-sm font-semibold mb-2">Status</label>
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

        <div>
          <label htmlFor="projectPhoto" className="block text-sm font-medium text-gray-700">
            Add Contract Photo
          </label>
          <div>
              <input id="projectPhoto" 
              name="project_photo"  // Add this to match backend expectation
              type="file" 
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-teal-500 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60" />
          </div>
          {photoPreview && (
            <div className="mt-2">
              <img
                src={photoPreview}
                alt="Project Photo Preview"
                className="w-32 h-auto object-cover"
              />
            </div>
          )}
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
