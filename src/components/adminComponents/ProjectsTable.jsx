import React from 'react';
import { Eye } from '@phosphor-icons/react';

export const ProjectsTable = ({ projects = [] }) => {
  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full border rounded-md text-sm">
          <thead>
            <tr className="bg-gray-700 text-white text-center">
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
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="border-t">
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
    </div>
  );
};
