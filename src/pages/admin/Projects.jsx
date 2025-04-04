import React, { useState } from 'react';
import { ProjectsTable } from '../../components/adminComponents/ProjectsTable';
import { SearchProject } from '../../components/adminComponents/SearchProject';
import AddProjectSideModal from '../../components/adminComponents/addProjectSideModal'; // Import modal

export const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const dummyProjects = [
    {
      id: 1,
      name: 'Apartment Renovation',
      client: 'Acme Corp',
      startDate: '2023-01-15',
      endDate: '2023-02-15',
      status: 'Completed',
      budget: '$10,000',
      progress: 100,
    },
  ];

  return (
    <div className="mt-15 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <SearchProject />
        </div>
        <button
          className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)} // Open modal
        >
          Add Project
        </button>
      </div>

      <div>
        <ProjectsTable projects={dummyProjects} />
      </div>

      {/* Render modal when isModalOpen is true */}
      <AddProjectSideModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
    </div>
  );
};
