import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye, DotsThree } from "@phosphor-icons/react";
import { FinanceModal } from "./FinanceModal";

const initialFinanceRecords = [
  { id: 1, employee_id: "M02489", fullname: "Ajay Lumari", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Paid", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime" },
  { id: 2, employee_id: "M02490", fullname: "Robert Young", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Rejected", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime"  },
  { id: 3, employee_id: "M02509", fullname: "Elia Romero", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime" },
  { id: 4, employee_id: "M02510", fullname: "Liam Smith", period_start: "2025-07-01", period_end: "2025-07-31", hours_worked: 40, salary: 800, status: "Pending", hr_status: "Approved By Hr", approved_by: "John Doe", approved_at: "2025-07-15", remarks: "Overtime" },
];

export const FinanceTable = () => {
  const [financeRecords, setFinanceRecords] = useState(initialFinanceRecords);
  const [selectedRecords, setSelectedRecords] = useState([]); 
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const fetchFinanceRecords = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/getFInance');
        const data = await response.json();
        console.log('finance records', data);
        if(response.ok){
          const formatted = data.map((record) => ({
            id: Math.random().toString(36).substr(2, 9),
            payroll_id: record.payroll_id,
            employee_id: record.employee_id,
            fullname: record.employee_name,
            period_start: new Date(record.period_start).toLocaleDateString(),
            period_end: new Date(record.period_end).toLocaleDateString(),
            hours_worked: record.total_hours_worked,
            salary: record.calculated_salary,
            status: record.status,
            approved_by: record.approved_by_hr,
            approved_at: new Date(record.approved_by_hr_at).toLocaleDateString(),
            remarks: record.remarks,
          }))
          setFinanceRecords(formatted);
        }
      } catch (error) {
        console.error("Error fetching payroll records:", error);
      }
    };
    fetchFinanceRecords();

  }, [])

  // Toggle individual checkbox selection
  const handleSelectRecord = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id) // Uncheck
        : [...prevSelected, id] // Check
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === financeRecords.length) {
      setSelectedRecords([]); // Unselect all
    } else {
      setSelectedRecords(financeRecords.map((record) => record.id)); // Select all
    }
  };

  

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
              <TableHead className="text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRecords.length === financeRecords.length}
                  className="cursor-pointer"
                />
              </TableHead>
              <TableHead className="text-center text-white">Payroll ID</TableHead>
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
                <TableCell className="text-center p-2">{record.id}</TableCell>
                <TableCell className="text-center p-2">{record.employee_id}</TableCell>
                <TableCell className="text-center p-2">{record.fullname}</TableCell>
                <TableCell className="text-center p-2">{record.period_start}</TableCell>
                <TableCell className="text-center p-2">{record.period_end}</TableCell>
                <TableCell className="text-center p-2">{record.hours_worked}</TableCell>
                <TableCell className="text-center p-2">₱{record.salary}</TableCell>
                <TableCell className="text-center p-2">
                  <p className={`text-center text-xs p-2 font-semibold rounded-md ${
                    record.status === "Paid" || record.status === "Approved by HR"
                      ? "bg-green-100 text-green-800"
                      : record.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                      
                  }`}>
                    {record.status}
                  </p>
                </TableCell>
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
