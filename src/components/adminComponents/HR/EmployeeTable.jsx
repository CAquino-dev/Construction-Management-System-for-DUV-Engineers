import React, { useEffect, useState } from "react";
import { Eye, PencilSimple, Trash } from "@phosphor-icons/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import PaginationComponent from "../Pagination";
import SearchEmployee from "../SearchEmployee";

export const EmployeeTable = ({
  employees = [],
  setSelectedUser,
  handleEdit,
  handleDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleSearch = (query, department) => {
    let filtered = employees.filter((emp) =>
      emp.full_name?.toLowerCase().includes(query.toLowerCase())
    );
    if (department) {
      filtered = filtered.filter((emp) => emp.department_name === department);
    }
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleViewMore = (employee) => {
    setSelectedUser(employee);
  };

  const totalPages = Math.ceil(filteredEmployees.length / 10);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * 10,
    currentPage * 10
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
      <SearchEmployee onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white">
              <TableHead className="p-2 text-left pl-4 text-white">
                Full Name
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Email
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Department
              </TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell text-white">
                Joining Date
              </TableHead>
              <TableHead className="p-2 text-center text-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((user, index) => (
              <TableRow
                key={user.id}
                className={index % 2 === 0 ? "bg-[#f4f6f5]" : "bg-white"}
              >
                <TableCell className="p-2 pl-4">
                  {user.full_name || "(No Name)"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {user.email || "-"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {user.department_name || "-"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">
                  {formatDate(user.date_hired)}
                </TableCell>
                <TableCell className="p-2 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleViewMore(user)}
                      className="flex items-center gap-1 bg-[#4c735c] text-white px-3 py-1 rounded-md text-sm hover:bg-[#5A8366] transition-colors"
                      title="View More"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">View More</span>
                    </button>
                    {handleEdit && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <PencilSimple size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    )}
                    {handleDelete && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {currentEmployees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No employees found
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