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
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipTitle, setPayslipTitle] = useState("");

  const userId = localStorage.getItem('userId');

  const fetchPayrollRecords = async (from, to) => {
    try {
        const response = await fetch(`http://localhost:5000/api/hr/payroll?period_start=${from}&period_end=${to}`);
        if (!response.ok) throw new Error("Failed to fetch payroll records");

        const data = await response.json();
        console.log(data);
        if(response.ok){
          const formatted = data.map((record) => ({
            id: Math.random().toString(36).substr(2, 9),
            payrollId: record.id,
            employeeId: record.employee_id,
            fullName: record.full_name,
            department: record.name,
            fixedSalary: record.fixed_salary,
            hoursWorked: record.total_hours_worked,
            calculatedSalary: record.calculated_salary,
            date: record.generated_at,
            status: record.status,
          }))
          setFilteredRecords(formatted); // ✅ Update table with API response
        }
    } catch (error) {
        console.error("Error fetching payroll records:", error);
    }
};

const handleCreatePayslip = async () => {
  console.log('title', payslipTitle);
  console.log('start payslip', startDate);
  console.log('end payslip', endDate);
  if (!payslipTitle || !startDate || !endDate) {
    alert("Title and date range are required.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/hr/payslip/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payslipTitle,
        startDate: startDate,
        endDate: endDate,
        createdBy: userId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Payslip created successfully!");
      setPayslipTitle("");
      setIsPayslipModalOpen(false);
    } else {
      alert(data.error || "Error creating payslip.");
    }
  } catch (error) {
    console.error("Error creating payslip:", error);
    alert("Something went wrong.");
  }
};


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

  const handleDateSelect = async (range) => {
    setHasSelectedDateRange(true);
    setDateRange(range);
    
    if (!range?.from || !range?.to) return;

    const formatDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    
    // Example usage:
    const formattedFrom = formatDate(range.from);
    const formattedTo = formatDate(range.to);
    setStartDate(formattedFrom)
    setEndDate(formattedTo)

    const filtered = payrollRecords.filter(
      (record) => record.date >= formattedFrom && record.date <= formattedTo
    );
    setFilteredRecords(filtered);

    try {
      const response = await fetch('http://localhost:5000/api/hr/calculateSalary', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: formattedFrom,
          endDate: formattedTo,
          generatedBy: userId
        }),
      });
      const data = await response.json();
      if(response.ok){
        fetchPayrollRecords(formattedFrom, formattedTo);
      }
    } catch (error) {
      setError("Server error. Please try again.");
      setTimeout(() => setError(""), 3000);
    }

  };


  const updateStatus = async (id, newStatus) => {
    try {
        const response = await fetch("http://localhost:5000/api/hr/payroll/update-status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                selectedPayrollIds: [id], 
                hrUserId: userId,
                remarks: `Status updated to ${newStatus}`,
                newStatus,
            }),
        });

        const data = await response.json(); // Log backend response
        console.log("API Response:", data); // ✅ Check for possible errors

        if (!response.ok) throw new Error(data.error || "Failed to update payroll status");

        // Proceed with UI update only if API succeeds
        const updated = payrollRecords.map((record) =>
          record.payrollId === id ? { ...record, status: newStatus } : record // ✅ Use payrollId
      );
      console.log('updated', updated);
      fetchPayrollRecords(startDate, endDate); 

      setOpenMenuId(null);
    } catch (error) {
        console.error("Error updating payroll status:", error);
    }
};

const handleBulkStatusUpdate = async (newStatus) => {
  if (selectedRecords.length === 0) return;

  try {
    // Map selected record IDs to payrollIds from filteredRecords
    const selectedPayrollIds = filteredRecords
      .filter((record) => selectedRecords.includes(record.payrollId))
      .map((record) => record.payrollId);

    console.log("Selected Payroll IDs:", selectedPayrollIds); // ✅ This should now give you the correct payrollIds

    const response = await fetch("http://localhost:5000/api/hr/payroll/update-status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedPayrollIds,
        hrUserId: 5,
        remarks: `Bulk status update to ${newStatus}`,
        newStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to update payroll status");

    fetchPayrollRecords(startDate, endDate); // Refresh table
    setSelectedRecords([]); // Clear selected after update
  } catch (error) {
    console.error("Error in bulk update:", error);
  }
};


  const getDropdownOptions = (status) => {
    const allOptions = ["View", "Approved by HR", "Pending", "Rejected by HR"];
    return allOptions.filter((option) => {
      if (option === "Approved by HR" && status === "Approved by HR") return false;
      if (option === "Pending" && status === "Pending") return false;
      if (option === "Rejected by HR" && status === "Rejected by HR") return false;
      return true;
    });
  };

  console.log(selectedRecords)
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

        {selectedRecords.length > 0 && (
            <select
              className="border p-2 rounded-md"
              onChange={(e) => handleBulkStatusUpdate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Update Status
              </option>
              <option value="Approved by HR">Approved by HR</option>
              <option value="Pending">Pending</option>
              <option value="Rejected by HR">Rejected by HR</option>
            </select>
         )}
        <button className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]">
          Export Payroll
        </button>
        <button
                className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
                onClick={() => setIsPayslipModalOpen(true)}
              >
                Create Payslip
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
                <TableHead className="text-center text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center p-2">
                    <input
                      type="checkbox"
                      onChange={() => handleSelectRecord(record.payrollId)}
                      checked={selectedRecords.includes(record.payrollId)}
                    />
                    
                  </TableCell>
                  <TableCell className="text-center p-2">{record.employeeId}</TableCell>
                  <TableCell className="text-center p-2">{record.fullName}</TableCell>
                  <TableCell className="text-center p-2">{record.department}</TableCell>
                  <TableCell className="text-center p-2">₱{record.fixedSalary}</TableCell>
                  <TableCell className="text-center p-2">{record.hoursWorked}</TableCell>
                  <TableCell className="text-center p-2">₱{record.calculatedSalary}</TableCell>

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
                                else updateStatus(record.payrollId, option);
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

      {isPayslipModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Payslip</h2>
            <input
              type="text"
              placeholder="Enter payslip title"
              value={payslipTitle}
              onChange={(e) => setPayslipTitle(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => {
                  setPayslipTitle("");
                  setIsPayslipModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#4c735c] text-white rounded-md"
                onClick={handleCreatePayslip}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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
