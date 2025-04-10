import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from "@phosphor-icons/react";
import { FinanceModal } from "./FinanceModal";

const financeRecords = [
  { id: 1, employee_id: "M02489", fullname: "Ajay Lumari", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending", approved_by: "HR Manager", approved_at: "N/A", remarks: "Review needed" },
  { id: 2, employee_id: "M02490", fullname: "Robert Young", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending", approved_by: "HR Manager", approved_at: "N/A", remarks: "Pending review" },
  { id: 3, employee_id: "M02509", fullname: "Elia Romero", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Approved", approved_by: "HR Manager", approved_at: "2025-07-10", remarks: "Approved" },
  { id: 4, employee_id: "M02510", fullname: "Liam Smith", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Approved", approved_by: "HR Manager", approved_at: "2025-07-12", remarks: "Verified" },
];

export const FinanceTable = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c] ">
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
                <TableCell className="text-center p-2">{record.employee_id}</TableCell>
                <TableCell className="text-center p-2">{record.fullname}</TableCell>
                <TableCell className="text-center p-2">{record.period_start}</TableCell>
                <TableCell className="text-center p-2">{record.period_end}</TableCell>
                <TableCell className="text-center p-2">{record.hours_worked}</TableCell>
                <TableCell className="text-center p-2">₱{record.salary}</TableCell>
                <TableCell className="text-center p-2">{record.status}</TableCell>
                <TableCell className="text-center p-2">
                  <button className="text-white rounded bg-gray-500 hover:bg-gray-700 p-1" onClick={() => setSelectedRecord(record)}>
                    <Eye size={18} />
                  </button>
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
