import React, { useState } from 'react';
import { ProjectsTable } from '../../components/adminComponents/ProjectsTable';
import { AddProject } from '../../components/adminComponents/AddProject';
import { ViewMyProject } from '../../components/adminComponents/ViewMyProject';

export const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  // Handler to show add project form
  const handleAddProject = () => {
    setSelectedProject('add'); // special value to show AddProject form
  };

  // Handler to go back to project list
  const handleBack = () => {
    setSelectedProject(null);
  };

  return (
    <div className="p-6 mt-15 bg-white rounded-lg shadow-sm">
      {selectedProject === 'add' ? (
        <AddProject />
      ) : selectedProject ? (
        // selectedProject is an object here, show project details
        <ViewMyProject selectedProject={selectedProject} onBack={handleBack} />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>{/* Optional: Search etc. */}</div>
            <button
              className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer mt-4 mr-4"
              onClick={handleAddProject}
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
