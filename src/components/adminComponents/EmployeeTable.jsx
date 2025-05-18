import React, { useEffect, useState } from "react";
import { Eye, PencilSimple, Trash } from "@phosphor-icons/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import PaginationComponent from "./Pagination";
import SearchEmployee from "./SearchEmployee";

export const EmployeeTable = ({ employees = [], setSelectedUser, handleEdit, handleDelete }) => {
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

  const totalPages = Math.ceil(filteredEmployees.length / 10);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * 10, currentPage * 10);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="p-4">
      <SearchEmployee onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white">
              <TableHead className="p-2 text-left pl-4">Full Name</TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell">Email</TableHead>
              {/* <TableHead className="p-2 text-center hidden md:table-cell">Mobile No.</TableHead> */}
              <TableHead className="p-2 text-center hidden md:table-cell">Department</TableHead>
              <TableHead className="p-2 text-center hidden md:table-cell">Joining Date</TableHead>
              {/* <TableHead className="p-2 text-center hidden md:table-cell">Status</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((user, index) => (
              <TableRow key={user.id} className={index % 2 === 0 ? "bg-[#f4f6f5]" : "bg-white"}>
                <TableCell className="p-2 flex items-center gap-2">
                  <img
                    src={user.profile_picture || "/default-profile.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {user.full_name || "(No Name)"}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{user.email || "-"}</TableCell>
                {/* <TableCell className="p-2 text-center hidden md:table-cell">{user.phone || "-"}</TableCell> */}
                <TableCell className="p-2 text-center hidden md:table-cell">{user.department_name || "-"}</TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{formatDate(user.date_hired)}</TableCell>
                {/* <TableCell
                  className={`p-2 text-center hidden md:table-cell font-semibold ${
                    user.employment_status === "Active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.employment_status || "Inactive"}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
