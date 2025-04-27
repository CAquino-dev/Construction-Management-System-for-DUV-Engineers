import React, { useState } from "react";
import { Eye } from "@phosphor-icons/react";
import Pagination from "./Pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"; // Ensure correct path

const initialProjectsData = [
  {
    id: 1,
    projectCode: "P001",
    projectName: "Project A",
    client: "Client A",
    location: "Location A",
    projectType: "Residential",
    description: "Description A",
    projectManager: "John Doe",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    completionDate: "2023-11-30",
    contractValue: "$100,000",
    budgetAllocated: "$80,000",
    budgetUsed: "$50,000",
    status: "In Progress",
    budget: "$10,000",
    progress: 50,
    remarks: "Remarks A",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
  {
    id: 2,
    projectCode: "P002",
    projectName: "Project B",
    client: "Client B",
    location: "Location B",
    projectType: "Commercial",
    description: "Description B",
    projectManager: "Jane Smith",
    startDate: "2023-02-01",
    endDate: "2023-03-31",
    completionDate: "2023-03-15",
    contractValue: "$200,000",
    budgetAllocated: "$150,000",
    budgetUsed: "$100,000",
    status: "Completed",
    budget: "$20,000",
    progress: 100,
    remarks: "Remarks B",
    createdAt: "2023-02-01",
    updatedAt: "2023-02-01",
  },
];

export const ProjectsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const projects = initialProjectsData; // Use the actual data here
  const totalPages = Math.ceil(projects.length / 10); // Calculate total pages for pagination
  const currentProjects = projects.slice((currentPage - 1) * 10, currentPage * 10); // Slice the data based on current page

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#3b5d47] text-white hover:bg-[#3b5d47]">
              <TableHead className="text-center text-white">Project Code</TableHead>
              <TableHead className="text-center text-white">Project Name</TableHead>
              <TableHead className="text-center text-white">Type</TableHead>
              <TableHead className="text-center text-white">Client</TableHead>
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
                  <TableCell className="text-center">{project.projectCode}</TableCell>
                  <TableCell className="text-center">{project.projectName}</TableCell>
                  <TableCell className="text-center">{project.projectType}</TableCell>
                  <TableCell className="text-center">{project.client}</TableCell>
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
