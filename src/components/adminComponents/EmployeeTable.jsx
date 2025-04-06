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
      emp.fullname.toLowerCase().includes(query.toLowerCase())
    );
    if (department) {
      filtered = filtered.filter((emp) => emp.department === department);
    }
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredEmployees.length / 10);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="p-4">
      <SearchEmployee onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] hover:bg-[#4c735c] text-white">
              <TableHead className="p-2 text-left pl-4 text-white">Full Name</TableHead>
              <TableHead className="p-2 text-center text-white hidden md:table-cell">Email</TableHead>
              <TableHead className="p-2 text-center text-white hidden md:table-cell">Mobile No.</TableHead>
              <TableHead className="p-2 text-center text-white hidden md:table-cell">Date of Birth</TableHead>
              <TableHead className="p-2 text-center text-white hidden md:table-cell">Department</TableHead>
              <TableHead className="p-2 text-center text-white hidden md:table-cell">Joining Date</TableHead>
              <TableHead className="p-2 text-center text-white hidden md:table-cell">Status</TableHead>
              <TableHead className="p-2 text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((user, index) => (
              <TableRow key={user.id} className={index % 2 === 0 ? "bg-[#f4f6f5]" : "bg-white"}>
                <TableCell className="p-2 flex items-center gap-2">
                  <img src={`#`} alt="Profile" className="w-8 h-8 rounded-full" />
                  {user.full_name}
                </TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{user.mobile_no}</TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{user.date_of_birth}</TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{user.department}</TableCell>
                <TableCell className="p-2 text-center hidden md:table-cell">{user.joining_date}</TableCell>
                <TableCell className={`p-2 text-center hidden md:table-cell font-semibold ${user.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                  {user.status}
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex gap-2 justify-center items-center">
                    {/* View Button */}
                    <button onClick={() => setSelectedUser(user)} className="text-black hover:text-gray-600 cursor-pointer">
                      <Eye size={18} />
                    </button>
                    {/* Edit Button */}
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      <PencilSimple size={18} />
                    </button>
                    {/* Delete Button */}
                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-800 cursor-pointer">
                      <Trash size={18} />
                    </button>
                  </div>
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
