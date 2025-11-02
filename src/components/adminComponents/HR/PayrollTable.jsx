import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CalendarBlank, Eye, Download, FilePdf } from "@phosphor-icons/react";
import { DateRangePicker } from "../../ui/calendar";
import { EmployeePayrollModal } from "./EmployeePayrollModal";
import { toast } from "sonner";
import ConfirmationModal from "../ConfirmationModal";

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
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
        statusConfig[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchPayrollRecords = async (from, to) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/hr/payroll?period_start=${from}&period_end=${to}`
      );
      if (!response.ok) throw new Error("Failed to fetch payroll records");

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const formatted = data.map((record) => ({
          id: Math.random().toString(36).substr(2, 9),
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
        }));
        setFilteredRecords(formatted);
      }
    } catch (error) {
      console.error("Error fetching payroll records:", error);
    }
  };

  const handleCreatePayslip = async () => {
    console.log("Title: ", payslipTitle);
    console.log("Remarks: ", payslipRemarks);
    console.log("Start: ", startDate);
    console.log("End: ", endDate);

    if (!payslipTitle || !payslipRemarks || !startDate || !endDate) {
      toast.error("Title and date range are required.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/payslip/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payslipTitle,
            remarks: payslipRemarks,
            startDate: startDate,
            endDate: endDate,
            createdBy: userId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Payslip created successfully!");
        setPayslipTitle("");
        setPayslipRemarks("");
        setIsPayslipModalOpen(false);
      } else {
        toast.error(data.error || "Error creating payslip.");
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
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;

    const formattedFrom = formatDate(range.from);
    const formattedTo = formatDate(range.to);
    setStartDate(formattedFrom);
    setEndDate(formattedTo);

    const filtered = payrollRecords.filter(
      (record) => record.date >= formattedFrom && record.date <= formattedTo
    );
    setFilteredRecords(filtered);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/calculateSalary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: formattedFrom,
            endDate: formattedTo,
            generatedBy: userId,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
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

    if (range === "1-15") {
      startDate = `${year}-${month}-01`;
      endDate = `${year}-${month}-15`;
    } else if (range === "16-31") {
      startDate = `${year}-${month}-16`;
      const lastDay = new Date(year, parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${lastDay}`;
    }

    setStartDate(startDate);
    setEndDate(endDate);

    const filtered = payrollRecords.filter(
      (record) => record.date >= startDate && record.date <= endDate
    );
    setFilteredRecords(filtered);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/calculateSalary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: startDate,
            endDate: endDate,
            generatedBy: userId,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        fetchPayrollRecords(startDate, endDate);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Payroll Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and generate employee payroll records
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
            {/* Date Selection */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Month Dropdown */}
              <div className="relative flex-1 sm:w-48">
                <select
                  className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent appearance-none bg-gray-50/50"
                  onChange={(e) => {
                    const monthValue = monthMap[e.target.value];
                    setSelectedMonth(monthValue);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Month
                  </option>
                  {Object.keys(monthMap).map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarBlank size={18} className="text-gray-400" />
                </div>
              </div>

              {/* Date Range Dropdown */}
              <div className="relative flex-1 sm:w-40">
                <select
                  className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent appearance-none bg-gray-50/50"
                  value={selectedRange}
                  onChange={(e) => {
                    setSelectedRange(e.target.value);
                    if (selectedMonth && e.target.value) {
                      handleDateRangeSelection(selectedMonth, e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Range
                  </option>
                  <option value="1-15">1-15</option>
                  <option value="16-31">16-31</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                className="flex items-center justify-center gap-2 bg-[#4c735c] text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-[#5A8366] transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
                onClick={() => setIsPayslipModalOpen(true)}
              >
                <span>Generate Payroll</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payroll Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {!hasSelectedDateRange ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <CalendarBlank size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select Date Range
              </h3>
              <p className="text-gray-500 max-w-md">
                Choose a month and date range to view payroll records
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="text-gray-400 mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Records Found
              </h3>
              <p className="text-gray-500">
                No payroll records found for the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {filteredRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className="border-b border-gray-100 p-4 hover:bg-gray-50/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {record.fullName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {record.employeeId}
                        </p>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <p className="font-medium">{record.department}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hourly Rate:</span>
                        <p className="font-medium">₱{record.hourlyRate}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Hours:</span>
                        <p className="font-medium">{record.totalHoursWorked}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Salary:</span>
                        <p className="font-medium text-green-800">
                          ₱{record.calculatedSalary}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setSelectedEmployee(record)}
                        className="flex items-center gap-2 bg-[#4c735c] text-white px-3 py-2 rounded-lg hover:bg-[#5A8366] transition-colors"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <Table className="w-full hidden sm:table">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#4c735c] to-[#5A8366] hover:from-[#4c735c] hover:to-[#5A8366]">
                    <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Employee
                    </TableHead>
                    <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Department
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Hourly Rate
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Hours
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Salary
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      <TableCell className="p-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {record.fullName}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ID: {record.employeeId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="font-medium text-gray-900">
                          {record.department}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="font-medium text-gray-900">
                          ₱{record.hourlyRate}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="font-medium text-gray-900">
                          {record.totalHoursWorked}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="font-semibold text-green-800">
                          ₱{record.calculatedSalary}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={record.status} />
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <button
                          onClick={() => setSelectedEmployee(record)}
                          className="inline-flex items-center gap-2 bg-[#4c735c] text-white px-3 py-2 rounded-lg hover:bg-[#5A8366] transition-colors"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Generate Payroll Modal */}
        {isPayslipModalOpen && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Generate Payroll</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payroll Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter payroll title"
                      value={payslipTitle}
                      onChange={(e) => setPayslipTitle(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter remarks"
                      value={payslipRemarks}
                      onChange={(e) => setPayslipRemarks(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                  <button
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium w-full sm:w-auto"
                    onClick={() => {
                      setPayslipTitle("");
                      setPayslipRemarks("");
                      setIsPayslipModalOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-3 bg-[#4c735c] text-white rounded-xl hover:bg-[#5A8366] transition-colors font-medium w-full sm:w-auto"
                    onClick={() => {
                      if (
                        !payslipTitle ||
                        !payslipRemarks ||
                        !startDate ||
                        !endDate
                      ) {
                        toast.error(
                          "Please fill in all fields before generating."
                        );
                        return;
                      }
                      setIsConfirmModalOpen(true);
                    }}
                  >
                    Generate Payroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            setIsConfirmModalOpen(false);
            handleCreatePayslip();
          }}
          actionType="Generate Payroll"
        />

        {/* Employee Payroll Modal */}
        {selectedEmployee && (
          <EmployeePayrollModal
            closeModal={() => setSelectedEmployee(null)}
            employee={selectedEmployee}
          />
        )}
      </div>
    </div>
  );
};
