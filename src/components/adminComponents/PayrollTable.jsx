import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DotsThree,
  CalendarBlank,
} from "@phosphor-icons/react";
import { Calendar } from "../../components/ui/calendar";
import { EmployeePayrollModal } from "./EmployeePayrollModal";

const initialPayrollRecords = [
  {
    id: 1,
    employeeId: "M02489",
    fullName: "Ajay Lumari",
    department: "HR",
    hourlyRate: 20,
    hoursWorked: 40,
    calculatedSalary: 800,
    date: "2025-07-01",
    status: "Pending",
  },
  {
    id: 2,
    employeeId: "M02490",
    fullName: "Robert Young",
    department: "Finance",
    hourlyRate: 25,
    hoursWorked: 35,
    calculatedSalary: 875,
    date: "2025-06-15",
    status: "Approved",
  },
  {
    id: 3,
    employeeId: "M02509",
    fullName: "Elia Romero",
    department: "Engineer",
    hourlyRate: 30,
    hoursWorked: 45,
    calculatedSalary: 1350,
    date: "2025-07-20",
    status: "Pending",
  },
  {
    id: 4,
    employeeId: "M02510",
    fullName: "Liam Smith",
    department: "Architect",
    hourlyRate: 28,
    hoursWorked: 50,
    calculatedSalary: 1400,
    date: "2025-06-25",
    status: "Rejected",
  },
];

export const PayrollTable = () => {
  const [payrollRecords, setPayrollRecords] = useState(initialPayrollRecords);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hasSelectedDateRange, setHasSelectedDateRange] = useState(false);

  const handleSelectAll = (e) => {
    setSelectedRecords(
      e.target.checked ? filteredRecords.map((record) => record.id) : []
    );
  };

  const handleSelectRecord = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id)
        ? prev.filter((recordId) => recordId !== id)
        : [...prev, id]
    );
  };

  const handleDateSelect = (range) => {
    setDateRange(range);
    setHasSelectedDateRange(true);

    if (!range?.from || !range?.to) return;

    const formatDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const formattedFrom = formatDate(range.from);
    const formattedTo = formatDate(range.to);

    const filtered = payrollRecords.filter(
      (record) => record.date >= formattedFrom && record.date <= formattedTo
    );

    setFilteredRecords(filtered);
  };

  const updateStatus = (id, newStatus) => {
    const updated = payrollRecords.map((record) =>
      record.id === id ? { ...record, status: newStatus } : record
    );
    setPayrollRecords(updated);
    setFilteredRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, status: newStatus } : record
      )
    );
    setOpenMenuId(null);
  };

  const getDropdownOptions = (status) => {
    const allOptions = ["View", "Approved", "Pending", "Reject"];
    return allOptions.filter((option) => {
      if (option === "Approved" && status === "Approved") return false;
      if (option === "Pending" && status === "Pending") return false;
      if (option === "Reject" && status === "Rejected") return false;
      return true;
    });
  };

  return (
    <div className="p-4">
      {/* Date Range Selector */}
      <div className="flex items-center gap-4 mb-4 justify-between">
        <button
          className="flex items-center gap-2 bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          <CalendarBlank size={20} /> Select Date Range
        </button>
        <button className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]">
          Export Payroll
        </button>
      </div>

      {/* Calendar Dropdown */}
      {isCalendarOpen && (
        <div className="absolute bg-white p-4 border rounded-md shadow-md z-150">
          <Calendar mode="range" selected={dateRange} onSelect={handleDateSelect} />
        </div>
      )}

      {/* Payroll Table or Message */}
      <div className="overflow-x-auto">
        {!hasSelectedDateRange ? (
          <div className="text-center text-gray-500 text-lg py-10">
            Select date first
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-10">
            No payroll records found in this date range.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
                <TableHead className="text-center p-2">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRecords.length === filteredRecords.length}
                  />
                </TableHead>
                <TableHead className="text-center text-white">Employee ID</TableHead>
                <TableHead className="text-center text-white">Full Name</TableHead>
                <TableHead className="text-center text-white">Department</TableHead>
                <TableHead className="text-center text-white">Fixed Salary</TableHead>
                <TableHead className="text-center text-white">Hours Worked</TableHead>
                <TableHead className="text-center text-white">Calculated Salary</TableHead>
                <TableHead className="text-center text-white">Status</TableHead>
                <TableHead className="text-center text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center p-2">
                    <input
                      type="checkbox"
                      onChange={() => handleSelectRecord(record.id)}
                      checked={selectedRecords.includes(record.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">{record.employeeId}</TableCell>
                  <TableCell className="text-center p-2">{record.fullName}</TableCell>
                  <TableCell className="text-center p-2">{record.department}</TableCell>
                  <TableCell className="text-center p-2">₱{record.hourlyRate}</TableCell>
                  <TableCell className="text-center p-2">{record.hoursWorked}</TableCell>
                  <TableCell className="text-center p-2">₱{record.calculatedSalary}</TableCell>
                  <TableCell className="text-center p-2">
                    <p className={`text-center text-xs p-2 font-semibold rounded-md ${
                      record.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : record.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {record.status}
                    </p>
                  </TableCell>
                  <TableCell className="text-center relative p-2">
                    <div className="relative inline-block">
                      <button
                        className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                        onClick={() =>
                          setOpenMenuId(openMenuId === record.id ? null : record.id)
                        }
                      >
                        <DotsThree />
                      </button>

                      {openMenuId === record.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10 flex flex-col">
                          {getDropdownOptions(record.status).map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                if (option === "View") setSelectedEmployee(record);
                                else updateStatus(record.id, option);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Employee Payroll Modal */}
      {selectedEmployee && (
        <EmployeePayrollModal
          closeModal={() => setSelectedEmployee(null)}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};
