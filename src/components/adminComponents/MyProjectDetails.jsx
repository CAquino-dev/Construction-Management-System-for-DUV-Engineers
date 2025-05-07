import React, { useState } from 'react'

export const MyProjectDetails = ({ selectedProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    projectname_: selectedProject?.projectname_ || "",
    Client: selectedProject?.Client || "",
    date_started: selectedProject?.date_started || "",
    date_end: selectedProject?.date_end || ""
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // Here you can implement saving logic, such as sending data to a backend
    setIsEditing(false);
    // You can also trigger a save event here if needed
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (!selectedProject) {
    return <div>Loading...</div>; // Or any loading state or message
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Project Details</h4>

            <button
                onClick={isEditing ? handleSaveClick : handleEditClick}
                className='bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#3b5a4a] transition duration-200'
            >
                {isEditing ? 'Save' : 'Edit'}
            </button>
        </div>
      {/* Button to Edit or Save */}

      {/* Project Details */}
      <div className="space-y-4 mt-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Project Name:</span>
          {isEditing ? (
            <input
              type="text"
              name="projectname_"
              value={projectDetails.projectname_}
              onChange={handleInputChange}
              className="text-sm border border-gray-300 rounded p-1"
            />
          ) : (
            projectDetails.projectname_ || "No project name available"
          )}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Client:</span>
          {isEditing ? (
            <input
              type="text"
              name="Client"
              value={projectDetails.Client}
              onChange={handleInputChange}
              className="text-sm border border-gray-300 rounded p-1"
            />
          ) : (
            projectDetails.Client || "No client available"
          )}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Start Date:</span>
          {isEditing ? (
            <input
              type="date"
              name="date_started"
              value={projectDetails.date_started}
              onChange={handleInputChange}
              className="text-sm border border-gray-300 rounded p-1"
            />
          ) : (
            projectDetails.date_started || "No start date available"
          )}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">End Date:</span>
          {isEditing ? (
            <input
              type="date"
              name="date_end"
              value={projectDetails.date_end}
              onChange={handleInputChange}
              className="text-sm border border-gray-300 rounded p-1"
            />
          ) : (
            projectDetails.date_end || "No end date available"
          )}
        </p>
      </div>

      {/* Additional Project Information */}
      <div className="space-y-4 mt-6">
        <h4 className="text-lg font-semibold text-gray-800">Additional Information</h4>
        <p className="text-sm text-gray-600">
          This section could contain any other details about the project, such as progress, funding, etc.
        </p>
      </div>
    </div>
  );
};
