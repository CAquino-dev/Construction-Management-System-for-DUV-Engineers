// components/adminComponents/HR/WorkerTable.jsx
import React, { useEffect, useState } from "react";
import { Eye } from "@phosphor-icons/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import PaginationComponent from "../Pagination";

export const WorkerTable = ({ workers = [], setSelectedUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleViewMore = (worker) => {
    setSelectedUser(worker);
  };

  const totalPages = Math.ceil(workers.length / itemsPerPage);
  const currentWorkers = workers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white">
              <TableHead className="p-2 text-left pl-4 text-white">
                Name
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Contact
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Team
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Skill Type
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Status
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Created At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentWorkers.map((worker, index) => (
              <TableRow
                key={worker.id}
                className={index % 2 === 0 ? "bg-[#f4f6f5]" : "bg-white"}
              >
                <TableCell className="p-2 pl-4 font-medium text-gray-700">
                  {worker.name || "-"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {worker.contact || "-"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {worker.team_name || "-"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {worker.skill_type || "-"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      worker.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {worker.status || "inactive"}
                  </span>
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {formatDate(worker.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {currentWorkers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No workers found
        </div>
      )}

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};