import React, { useState } from 'react';
import { ProjectsTable } from '../../components/adminComponents/ProjectsTable';
import { AddProject } from '../../components/adminComponents/AddProject'; // Import AddProject component

export const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null); // State to toggle between table and form

  return (
    <div className="p-6 mt-15 bg-white rounded-lg shadow-sm">
      {/* Conditional rendering: Show AddProject form or ProjectsTable */}
      {selectedProject ? (
        <AddProject />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              {/* Other content such as search can be added here */}
            </div>
            {/* Show Add Project button */}
            <button
              className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer mt-4 mr-4"
              onClick={() => setSelectedProject(true)} // Show AddProject form
            >
              Add Project
            </button>
          </div>

          <ProjectsTable setSelectedProject={setSelectedProject} />
        </div>
      )}
    </div>
  );
};
