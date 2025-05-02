import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Money, X } from "@phosphor-icons/react";
import Pagination from "./Pagination";
import ConfirmationModal from "./ConfirmationModal"; // Ensure correct path

const initialData = [
  { id: 1, title: "Payroll 1", start: "2023-01-01", end: "2023-01-31", status: "Pending" },
  { id: 2, title: "Payroll 2", start: "2023-02-01", end: "2023-02-28", status: "Paid" },
  { id: 3, title: "Payroll 3", start: "2023-03-01", end: "2023-03-31", status: "Paid" },
  { id: 4, title: "Payroll 4", start: "2023-04-01", end: "2023-04-30", status: "Rejected" },
  { id: 5, title: "Payroll 5", start: "2023-05-01", end: "2023-05-31", status: "Paid" },
];

export const ApprovedPayrollOfCeoTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [remark, setRemark] = useState("");

  const recordsPerPage = 5;
  const totalPages = Math.ceil(initialData.length / recordsPerPage);
  const currentRecords = initialData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleActionClick = (record, action) => {
    setSelectedRecord(record);
    setActionType(action);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    console.log(`${actionType} - Record ID: ${selectedRecord?.id}, Remark: ${remark}`);
    setIsModalOpen(false);
  };

  return (
    <div className='p-4'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Status</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record, index) => (
              <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <TableCell className="text-center p-2">{record.title}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.start).toLocaleDateString()}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.end).toLocaleDateString()}</TableCell>
                <TableCell
                className={`text-center p-2 font-semibold ${
                    record.status === "Pending" ? "text-yellow-500" :
                    record.status === "Rejected" ? "text-red-500" :
                    record.status === "Paid" ? "text-green-500" :
                    "text-gray-700"
                }`}
                >
                {record.status}
                </TableCell>
                <TableCell className="text-center p-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleActionClick(record, "Paid")}
                      className="border border-green-500 text-green-500 p-2 rounded-full hover:bg-green-600 hover:text-white cursor-pointer"
                    >
                      <Money size={15} />
                    </button>
                    <button
                      onClick={() => handleActionClick(record, "Rejected")}
                      className="border border-red-500 text-red-500 p-2 rounded-full hover:bg-red-600 hover:text-white cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        actionType={actionType}
        setRemark={setRemark}
      />
    </div>
  );
};
