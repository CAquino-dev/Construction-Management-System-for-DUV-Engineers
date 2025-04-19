import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye, DotsThree } from "@phosphor-icons/react";
import { FinanceModal } from "./FinanceModal";

// const initialFinanceRecords = [
//   { id: 1, employee_id: "M02489", fullname: "Ajay Lumari", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Paid", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime" },
//   { id: 2, employee_id: "M02490", fullname: "Robert Young", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Rejected", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime"  },
//   { id: 3, employee_id: "M02509", fullname: "Elia Romero", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime" },
//   { id: 4, employee_id: "M02510", fullname: "Liam Smith", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime" },
// ];

export const FinanceTable = () => {
  const [financeRecords, setFinanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const fetchFinanceRecords = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/getApprovedPayslips');
        const data = await response.json();
        console.log(data.data)
        setFinanceRecords(data.data);
      } catch (error) {
        console.error("Error fetching payroll records:", error);
      }
    };
    fetchFinanceRecords();

  }, [])
  console.log('Finance Records: ', financeRecords)
  

  const updateStatus = async (id, newStatus) => {

    console.log('payrollId:', id)
    console.log('status', newStatus)
    const userId = localStorage.getItem('userId'); 
  
    try {
      const response = await fetch('http://localhost:5000/api/finance/payroll/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, newStatus, userId }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // If the status is updated successfully, update the local state
        const updated = financeRecords.map((record) =>
          record.payroll_id === id ? { ...record, status: newStatus } : record
        );
        setFinanceRecords(updated);
      } else {
        console.error("Error updating status:", data.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  

  const getDropdownOptions = (status) => {
    const allOptions = ["View", "Paid", "Rejected by Finance"];
    return allOptions.filter((option) => {
      if (option === "Paid" && status === "Paid") return false;
      if (option === "Rejected by Finance" && status === "Rejected by Finance") return false;
      return true;
    });
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Created At</TableHead>
              <TableHead className="text-center text-white">Created By</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financeRecords.map((record, index) => (
              <TableRow key={record.payslip_id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                {/* Individual Checkbox */}
                <TableCell className="text-center p-2">{record.title}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.period_start).toLocaleDateString()}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.period_end).toLocaleDateString()}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.payslip_created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-center p-2">{record.created_by_name}</TableCell>
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
                      {getDropdownOptions(record.status).map((option) => (
                        <button className="block px-4 py-2 hover:bg-gray-200 w-full"
                        key={option} 
                        onClick={() => {
                          if (option === "View") setSelectedRecord(record);
                          else updateStatus(record.payroll_id, option);
                        }}>{option}
                        </button>
                      ))}
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
