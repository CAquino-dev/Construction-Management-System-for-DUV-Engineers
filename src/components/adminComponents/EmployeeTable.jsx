import React, { useEffect, useState } from "react";
import { Eye } from "@phosphor-icons/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import PaginationComponent from "./Pagination";
import SearchEmployee from "./SearchEmployee";

export const EmployeeTable = ({ employees = [], setSelectedUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  // Handle search
  const handleSearch = (query, department) => {
    let filtered = employees.filter((emp) =>
      emp.fullname.toLowerCase().includes(query.toLowerCase())
    );
    if (department) {
      filtered = filtered.filter((emp) => emp.department === department);
    }
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset pagination
  };

  const totalPages = Math.ceil(filteredEmployees.length / 10);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="p-4">
      <SearchEmployee onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] hover:bg-[#4c735c]">
              <TableHead className="p-2 text-left pl-4 text-white">Full Name</TableHead>
              <TableHead className="p-2 text-center text-white">Department</TableHead>
              <TableHead className="p-2 text-center text-white">Email</TableHead>
              <TableHead className="p-2 text-center text-white">Status</TableHead>
              <TableHead className="p-2 text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((user, index) => (
              <TableRow key={user.id} className={index % 2 === 0 ? "bg-[#f4f6f5] text-center" : "bg-white text-center"}>
                <TableCell className="p-2 flex items-center gap-2">
                  <img src={`#`} alt="Profile" className="w-10 h-10 rounded-full" />
                  {user.full_name}
                </TableCell>
                <TableCell className="p-2">{user.department_name}</TableCell>
                <TableCell className="p-2 ">{user.email}</TableCell>
                <TableCell className={`p-2 ${user.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                  {user.status}
                </TableCell>
                <TableCell className="">
                  <button
                    onClick={() => setSelectedUser(user)} // Switch 
                    className="text-black hover:text-gray-600 cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationComponent currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};
