import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye, DotsThree } from "@phosphor-icons/react";
import { FinanceModal } from "./FinanceModal";

const financeRecords = [
  { id: 1, employee_id: "M02489", fullname: "Ajay Lumari", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending" },
  { id: 2, employee_id: "M02490", fullname: "Robert Young", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending" },
  { id: 3, employee_id: "M02509", fullname: "Elia Romero", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Approved" },
  { id: 4, employee_id: "M02510", fullname: "Liam Smith", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Approved" },
];

export const FinanceTable = () => {
  const [selectedRecords, setSelectedRecords] = useState([]); 
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Toggle individual checkbox selection
  const handleSelectRecord = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id) // Uncheck
        : [...prevSelected, id] // Check
    );
  };

  // Toggle "Select All"
  const handleSelectAll = () => {
    if (selectedRecords.length === financeRecords.length) {
      setSelectedRecords([]); // Unselect all
    } else {
      setSelectedRecords(financeRecords.map((record) => record.id)); // Select all
    }
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRecords.length === financeRecords.length}
                  className="cursor-pointer"
                />
              </TableHead>
              <TableHead className="text-center text-white">Employee ID</TableHead>
              <TableHead className="text-center text-white">Fullname</TableHead>
              <TableHead className="text-center text-white">Period Start</TableHead>
              <TableHead className="text-center text-white">Period End</TableHead>
              <TableHead className="text-center text-white">Hours Worked</TableHead>
              <TableHead className="text-center text-white">Salary</TableHead>
              <TableHead className="text-center text-white">Status</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financeRecords.map((record, index) => (
              <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                {/* Individual Checkbox */}
                <TableCell className="text-center p-2">
                  <input
                    type="checkbox"
                    onChange={() => handleSelectRecord(record.id)}
                    checked={selectedRecords.includes(record.id)}
                    className="cursor-pointer"
                  />
                </TableCell>
                <TableCell className="text-center p-2">{record.employee_id}</TableCell>
                <TableCell className="text-center p-2">{record.fullname}</TableCell>
                <TableCell className="text-center p-2">{record.period_start}</TableCell>
                <TableCell className="text-center p-2">{record.period_end}</TableCell>
                <TableCell className="text-center p-2">{record.hours_worked}</TableCell>
                <TableCell className="text-center p-2">₱{record.salary}</TableCell>
                <TableCell className="text-center p-2">{record.status}</TableCell>
                <TableCell className="text-center p-2 relative">
                  <button
                    className="text-black hover:text-gray-600 cursor-pointer "
                    onClick={() => setDropdownOpen(dropdownOpen === record.id ? null : record.id)}
                  >
                    <DotsThree size={18} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen === record.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10 flex flex-col">
                      <button className="block px-4 py-2 hover:bg-gray-200 w-full" 
                      onClick={() => {
                        setSelectedRecord(record);
                        setDropdownOpen(null);      
                      }}>View
                      </button>
                      <button className="block px-4 py-2 hover:bg-gray-200 w-full">Paid</button>
                      <button className="block px-4 py-2 hover:bg-gray-200 w-full">Rejected</button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Finance Modal */}
      {selectedRecord && <FinanceModal closeModal={() => setSelectedRecord(null)} record={selectedRecord} />}
    </div>
  );
};
