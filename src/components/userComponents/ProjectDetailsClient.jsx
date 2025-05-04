import React from 'react';

export const ProjectDetailsClient = ({ selectedProject }) => {
  // Check if selectedProject is available
  if (!selectedProject) {
    return <div>Loading...</div>; // Or any loading state or message
  }

  return (
    <div className="p-6">

      {/* Project Details */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Project Overview</h4>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Project Name:</span> {selectedProject.projectname_ || "No project name available"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Engineer:</span> {selectedProject.Engineer || "No engineer assigned"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Start Date:</span> {selectedProject.date_started || "No start date available"}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">End Date:</span> {selectedProject.date_end || "No end date available"}
        </p>
      </div>

      {/* Additional Project Information */}
      <div className="space-y-4 mt-6">
        <h4 className="text-lg font-semibold text-gray-800">Additional Information</h4>
        <p className="text-sm text-gray-600">
          {/* Add more project-related info here */}
          This section could contain any other details about the project, such as progress, funding, etc.
        </p>
      </div>

    </div>
  );
};
