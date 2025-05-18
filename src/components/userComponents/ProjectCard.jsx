import React from 'react';
import duvLogo from '../../assets/duvLogo.jpg';

export const ProjectCard = ({ project }) => {
  return (
    <div className="card bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl">
      <div className="flex flex-col sm:flex-row">
        {/* Left side: Project Image */}
        <div className="w-full sm:w-1/3 p-2">
          <img
            src={duvLogo}
            alt={project.projectname_}
            className="w-full h-full object-cover rounded-lg"
            style={{ maxWidth: '100%' }} // Ensure image scales nicely
          />
        </div>

        {/* Right side: Project Details */}
        <div className="w-full sm:w-2/3 p-4">
          <h3 className="text-lg font-semibold text-gray-800">{project.project_name}</h3>
          <p className="text-sm text-gray-600">
            <strong>Engineer:</strong> {project.engineer_name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            <strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
