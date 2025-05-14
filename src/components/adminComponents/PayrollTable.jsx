import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { DotsThree, CalendarBlank } from "@phosphor-icons/react";
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

// Mapping month names to their corresponding numeric values
const monthMap = {
  "January": "01",
  "February": "02",
  "March": "03",
  "April": "04",
  "May": "05",
  "June": "06",
  "July": "07",
  "August": "08",
  "September": "09",
  "October": "10",
  "November": "11",
  "December": "12"
};

export const PayrollTable = () => {
  const [payrollRecords, setPayrollRecords] = useState(initialPayrollRecords);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [hasSelectedDateRange, setHasSelectedDateRange] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipTitle, setPayslipTitle] = useState("");
  const [payslipRemarks, setPayslipRemarks] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedRange, setSelectedRange] = useState("");

  const userId = localStorage.getItem('userId');

  const fetchPayrollRecords = async (from, to) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hr/payroll?period_start=${from}&period_end=${to}`);
      if (!response.ok) throw new Error("Failed to fetch payroll records");

      const data = await response.json();
      console.log(data);
      if(response.ok){
        const formatted = data.map((record) => ({
          id: Math.random().toString(36).substr(2, 9), // Generate a unique id for each record
          payrollId: record.id,
          employeeId: record.employee_id,
          fullName: record.full_name,
          department: record.department_name,
          totalHoursWorked: record.total_hours_worked,
          calculatedSalary: record.calculated_salary,
          overtimePay: record.overtime_pay,
          philhealthDeduction: record.philhealth_deduction, 
          sssDeduction: record.sss_deduction,
          pagibigDeduction: record.pagibig_deduction,
          totalDeductions: record.total_deductions,
          finalSalary: record.final_salary,
          status: record.status,
          generatedAt: record.generated_at,
          hourlyRate: record.hourly_rate,
        }))
        setFilteredRecords(formatted); // ✅ Update table with API response
      }
    } catch (error) {
      console.error("Error fetching payroll records:", error);
    }
  };

  const handleCreatePayslip = async () => {
    console.log("Title: ",payslipTitle)
    console.log("Remarks: ",payslipRemarks)
    console.log("Start: ",startDate)
    console.log("End: ",endDate)
    
    if (!payslipTitle || !payslipRemarks || !startDate || !endDate) {
      alert("Title and date range are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/hr/payslip/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payslipTitle,
          remarks: payslipRemarks,
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

  const handleDateSelect = async (range) => {
    setHasSelectedDateRange(true);
    setDateRange(range);

    if (!range?.from || !range?.to) return;

    const formatDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    
    const formattedFrom = formatDate(range.from);
    const formattedTo = formatDate(range.to);
    setStartDate(formattedFrom)
    setEndDate(formattedTo)

    const filtered = payrollRecords.filter(
      (record) => record.date >= formattedFrom && record.date <= formattedTo
    );
    setFilteredRecords(filtered);
    console.log('start', formattedFrom)
    console.log('end', formattedTo)
    console.log('generated', userId)

    console.log({
      startDate: formattedFrom,
      endDate: formattedTo,
      generatedBy: userId
    });

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
      if (!response.ok) {
        console.error("Error response from API:", data);
      }
      if(response.ok){
        fetchPayrollRecords(formattedFrom, formattedTo);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleDateRangeSelection = async (month, range) => {
    setHasSelectedDateRange(true);
    let startDate, endDate;
    const year = new Date().getFullYear();

    if (range === '1-15') {
      startDate = `${year}-${month}-01`;
      endDate = `${year}-${month}-15`;
    } else if (range === '15-30') {
      startDate = `${year}-${month}-15`;
      endDate = `${year}-${month}-30`;
    }
    
    setStartDate(startDate)
    setEndDate(endDate)

    const filtered = payrollRecords.filter(
      (record) => record.date >= startDate && record.date <= endDate  
    );
    setFilteredRecords(filtered);

    try {
      const response = await fetch('http://localhost:5000/api/hr/calculateSalary', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
          generatedBy: userId
        }),
      });
      const data = await response.json();
      if(response.ok){
        fetchPayrollRecords(startDate, endDate);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            className="flex items-center gap-2 bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366] w-full sm:w-auto"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <CalendarBlank size={20} /> Select Date Range
          </button>

          {/* Month Dropdown */}
          <select className="border p-2 rounded-md w-full sm:w-auto"         
            onChange={(e) => {
              const monthValue = monthMap[e.target.value];  // Map the selected month name to its number
              setSelectedMonth(monthValue);  // Set the numeric month value
            }}
          >
            <option value="" disabled selected>Select Month</option>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          {/* Date Range Dropdown */}
          <select className="border p-2 rounded-md w-full sm:w-auto"
                  value={selectedRange}
                  onChange={(e) => {
                    setSelectedRange(e.target.value);
                    if (selectedMonth && e.target.value) {
                      handleDateRangeSelection(selectedMonth, e.target.value);
                    }
                  }}>
            <option value="" disabled selected>Select Date Range</option>
            <option value="1-15">1-15</option>
            <option value="15-30">15-30</option>
          </select>
        </div>

        {/* Action Buttons - Wrapped for Mobile Layout */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <button className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366] w-full sm:w-auto cursor-pointer">
            Export Payroll
          </button>
          <button
            className="bg-none text-[#4c735c] px-4 py-2 rounded-md border border-[#4c735c] hover:bg-[#4c735c] hover:text-white w-full sm:w-auto cursor-pointer"
            onClick={() => setIsPayslipModalOpen(true)}
          >
            Create Payslip
          </button>
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
            <input
              type="text"
              placeholder="Enter payslip remarks"
              value={payslipRemarks}
              onChange={(e) => setPayslipRemarks(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => {
                  setPayslipTitle("");
                  setPayslipRemarks("");
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
        </div>
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
                <TableHead className="text-center p-2 text-white">Employee ID</TableHead>
                <TableHead className="text-center text-white">Full Name</TableHead>
                <TableHead className="text-center text-white">Department</TableHead>
                <TableHead className="text-center text-white">Hourly Rate</TableHead>
                <TableHead className="text-center text-white">Hours Worked</TableHead>
                <TableHead className="text-center text-white">Calculated Salary</TableHead>
                <TableHead className="text-center text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center p-2">{record.employeeId}</TableCell>
                  <TableCell className="text-center p-2">{record.fullName}</TableCell>
                  <TableCell className="text-center p-2">{record.department}</TableCell>
                  <TableCell className="text-center p-2">₱{record.hourlyRate}</TableCell>
                  <TableCell className="text-center p-2">{record.totalHoursWorked}</TableCell>
                  <TableCell className="text-center p-2">₱{record.calculatedSalary}</TableCell>
                  <TableCell className="text-center p-2">
                    <button
                      onClick={() => setSelectedEmployee(record)}
                      className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      View
                    </button>
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
