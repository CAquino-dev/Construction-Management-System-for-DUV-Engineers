import React from "react";
import duvLogo from "../../../assets/duvLogo.jpg";

export const MyProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer w-full h-48 sm:h-52">
      {" "}
      {/* Fixed height */}
      <div className="flex flex-col sm:flex-row h-full">
        {" "}
        {/* Make flex container full height */}
        {/* Image Section */}
        <div className="sm:w-1/3 p-4 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src={duvLogo}
              alt={project.project_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Content Section */}
        <div className="sm:w-2/3 p-4 sm:pl-0 sm:pr-6 sm:py-4 flex flex-col justify-between h-full">
          {" "}
          {/* Flex column with justify-between */}
          <div>
            {/* Project Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
              {" "}
              {/* Fixed min-height for title */}
              {project.project_name}
            </h3>
          </div>
          {/* Project Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">👤</span>
              <div className="min-w-0 flex-1">
                {" "}
                {/* Added for better text handling */}
                <p className="text-xs text-gray-500">Client</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {" "}
                  {/* Truncate long client names */}
                  {project.client_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-gray-400">📅</span>
              <div className="min-w-0 flex-1">
                {" "}
                {/* Added for better text handling */}
                <p className="text-xs text-gray-500">Timeline</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {" "}
                  {/* Truncate if needed */}
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
