import React, { useState } from 'react';
import { Eye } from '@phosphor-icons/react';
import Pagination from './Pagination';

export const ProjectsTable = ({ projects = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / 10);
  const currentProjects = projects.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#3b5d47] text-white text-center">
              <th className="p-2 text-center">Project Name</th>
              <th className="p-2 text-center">Client</th>
              <th className="p-2 text-center">Start Date</th>
              <th className="p-2 text-center">End Date</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Budget</th>
              <th className="p-2 text-center">Progress</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.length > 0 ? (
              projects.map((project, index) => (
                <tr key={project.id} className={index % 2 === 0 ? "bg-[#f4f6f5] text-center" : "bg-white text-center"}>
                  <td className="p-2 text-center">{project.name}</td>
                  <td className="p-2 text-center">{project.client}</td>
                  <td className="p-2 text-center">{project.startDate}</td>
                  <td className="p-2 text-center">{project.endDate}</td>
                  <td
                    className={`p-2 text-center ${
                      project.status === 'Completed'
                        ? 'text-green-600'
                        : project.status === 'In Progress'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {project.status}
                  </td>
                  <td className="p-2 text-center">{project.budget}</td>
                  <td className="p-2 text-center">{project.progress}%</td>
                  <td className="p-2 text-center">
                    <button
                      className="text-black hover:text-gray-600 cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="p-4 text-center text-gray-500"
                >
                  No projects available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};
