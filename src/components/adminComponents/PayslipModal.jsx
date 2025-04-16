import React, { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import  PaginationComponent  from "./Pagination"; 

export const PayslipModal = ({ closeModal, payslip }) => {
  if (!payslip) return null; // Ensures the modal only renders when a payslip is selected

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust based on preference

  // Filter employees based on search term
  const filteredEmployees = payslip.Employee_Salary
    ? payslip.Employee_Salary.filter(employee =>
        employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] h-[600px] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
            <div>
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg text-gray-500">Payslip:</h2>
                    <p className="font-bold">{payslip.title}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg text-gray-500">Period:</h2>
                    <p className="font-bold">{payslip.start} <span className="text-gray-500">to</span> {payslip.end}</p>
                </div>
            </div>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Employee..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Payslip Details */}
        <div className="space-y-3 flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
                <TableHead className="text-center text-white">Employee Name</TableHead>
                <TableHead className="text-center text-white">Total Hours</TableHead>
                <TableHead className="text-center text-white">Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto max-h-[400px]">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                    <TableCell className="text-center">{employee.employee_name}</TableCell>
                    <TableCell className="text-center">{employee.total_hours}</TableCell>
                    <TableCell className="text-center">₱{employee.salary.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center p-4 text-gray-500">No matching employees</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationComponent currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
};
