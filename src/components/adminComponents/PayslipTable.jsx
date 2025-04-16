import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from "@phosphor-icons/react";
import { PayslipModal } from "./PayslipModal";

const payslipRecords = [
  { id: 1, title: "April 1-15, 2025", start: "2025-04-14", end: "2025-04-15", created_at: "2025-04-01", created_by: "Finance", 
    Employee_Salary:[
      {employee_name:"John Doe", total_hours: 80, salary: 20000},
      {employee_name:"Jordan", total_hours: 90, salary: 80000},] 
    },
  { id: 2, title: "April 16-30, 2025", start: "2025-04-16", end: "2025-04-30", created_at: "2025-04-01", created_by: "Finance" },
  { id: 3, title: "May 1-15, 2025", start: "2025-05-01", end: "2025-05-15", created_at: "2025-05-01", created_by: "Finance" },
  { id: 4, title: "May 16-31, 2025", start: "2025-05-16", end: "2025-05-31", created_at: "2025-05-01", created_by: "Finance" },
];

export const PayslipTable = () => {
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const openModal = (record) => {
    setSelectedPayslip(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPayslip(null);
    setIsModalOpen(false);
  };

  // Filter payslip records based on search input
  const filteredPayslips = payslipRecords.filter((record) =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.start.includes(searchTerm) ||
    record.end.includes(searchTerm) ||
    record.created_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Payslip..."
          className="w-full sm:w-80 p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Payslip Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Created at</TableHead>
              <TableHead className="text-center text-white">Created by</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayslips.length > 0 ? (
              filteredPayslips.map((record, index) => (
                <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center p-2">{record.title}</TableCell>
                  <TableCell className="text-center p-2">{record.start}</TableCell>
                  <TableCell className="text-center p-2">{record.end}</TableCell>
                  <TableCell className="text-center p-2">{record.created_at}</TableCell>
                  <TableCell className="text-center p-2">{record.created_by}</TableCell>
                  <TableCell className="text-center p-2">
                    <button onClick={() => openModal(record)} className="text-black hover:text-gray-600 cursor-pointer bg-gray-200 p-1 rounded-md">
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4 text-gray-500">No matching payslips found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payslip Modal */}
      {isModalOpen && <PayslipModal payslip={selectedPayslip} closeModal={closeModal} />}
    </div>
  );
};
