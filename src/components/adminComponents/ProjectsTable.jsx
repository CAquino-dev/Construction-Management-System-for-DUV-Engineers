import React, { useState } from "react";
import { Eye } from "@phosphor-icons/react";
import Pagination from "./Pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"; // Ensure correct path

export const ProjectsTable = ({ projects = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / 10);
  const currentProjects = projects.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#3b5d47] text-white hover:bg-[#3b5d47]">
              <TableHead className="text-center text-white">Project Name</TableHead>
              <TableHead className="text-center text-white">Client</TableHead>
              <TableHead className="text-center text-white">Start Date</TableHead>
              <TableHead className="text-center text-white">End Date</TableHead>
              <TableHead className="text-center text-white">Status</TableHead>
              <TableHead className="text-center text-white">Budget</TableHead>
              <TableHead className="text-center text-white">Progress</TableHead>
              <TableHead className="text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProjects.length > 0 ? (
              currentProjects.map((project, index) => (
                <TableRow key={project.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center">{project.name}</TableCell>
                  <TableCell className="text-center">{project.client}</TableCell>
                  <TableCell className="text-center">{project.startDate}</TableCell>
                  <TableCell className="text-center">{project.endDate}</TableCell>
                  <TableCell
                    className={`text-center font-semibold ${
                      project.status === "Completed"
                        ? "text-green-600"
                        : project.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {project.status}
                  </TableCell>
                  <TableCell className="text-center">₱{project.budget}</TableCell>
                  <TableCell className="text-center">{project.progress}%</TableCell>
                  <TableCell className="text-center">
                    <button className="text-black hover:text-gray-600 cursor-pointer">
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="p-4 text-center text-gray-500">
                  No projects available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};
