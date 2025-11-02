import React from "react";
import duvLogo from "../../../assets/duvLogo.jpg";

export const MyProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer w-full min-h-[140px] sm:h-52">
      {/* Removed fixed height for mobile, added min-height */}
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Section - Centered on mobile, left-aligned on larger screens */}
        <div className="w-full sm:w-1/3 p-3 sm:p-4 flex items-center justify-center sm:justify-start">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src={duvLogo}
              alt={project.project_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Section - Full width on mobile */}
        <div className="w-full sm:w-2/3 px-4 pb-4 sm:pl-0 sm:pr-6 sm:py-4 flex flex-col justify-between h-full">
          <div>
            {/* Project Title - Better mobile sizing */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
              {project.project_name}
            </h3>
          </div>

          {/* Project Details - Compact on mobile */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-gray-400 text-sm">👤</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Client</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {project.client_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-gray-400 text-sm">📅</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Timeline</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
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
