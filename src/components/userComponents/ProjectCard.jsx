import React from "react";
import duvLogo from "../../assets/duvLogo.jpg";

export const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer">
      <div className="flex flex-col sm:flex-row p-4">
        {/* Image Section */}
        <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4 flex justify-center sm:justify-start">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src={duvLogo}
              alt={project.project_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {/* Project Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {project.project_name}
          </h3>

          {/* Project Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">👷</span>
              <div>
                <p className="text-xs text-gray-500">Engineer</p>
                <p className="text-sm font-semibold text-gray-800">
                  {project.engineer_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">📅</span>
              <div>
                <p className="text-xs text-gray-500">Timeline</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(project.start_date).toLocaleDateString()} -{" "}
                  {new Date(project.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
