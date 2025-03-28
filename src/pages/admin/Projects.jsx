import React from 'react';
import { ProjectsTable } from '../../components/adminComponents/ProjectsTable';
import { SearchProject } from '../../components/adminComponents/SearchProject';

export const Projects = () => {
  const dummyProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      client: 'Acme Corp',
      startDate: '2023-01-15',
      endDate: '2023-02-15',
      status: 'Completed',
      budget: '$10,000',
      progress: 100,
    },
  ];

  return (
    <div className="mt-10 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <SearchProject />
        </div>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div>
        <ProjectsTable projects={dummyProjects} />
      </div>
    </div>
  );
};
