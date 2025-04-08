import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Eye, MagnifyingGlass } from "@phosphor-icons/react";

const payrollRecords = [
  { id: 1, employeeId: "M02489", fullName: "Ajay Lumari", department: "HR", hourlyRate: 20, hoursWorked: 40, calculatedSalary: 800, date: "2025-07" },
  { id: 2, employeeId: "M02490", fullName: "Robert Young", department: "Finance", hourlyRate: 25, hoursWorked: 35, calculatedSalary: 875, date: "2025-06" },
  { id: 3, employeeId: "M02509", fullName: "Elia Romero", department: "Engineer", hourlyRate: 30, hoursWorked: 45, calculatedSalary: 1350, date: "2025-07" },
  { id: 4, employeeId: "M02510", fullName: "Liam Smith", department: "Architect", hourlyRate: 28, hoursWorked: 50, calculatedSalary: 1400, date: "2025-06" },
];

export const PayrollTable = () => {
  const [filteredRecords, setFilteredRecords] = useState(payrollRecords);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
    { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
  ];

  const years = ["2023", "2024", "2025", "2026"];

  const handleSearch = () => {
    const formattedDate = `${selectedYear}-${selectedMonth}`;
    if (selectedMonth && selectedYear) {
      setFilteredRecords(payrollRecords.filter((record) => record.date === formattedDate));
    } else {
      setFilteredRecords(payrollRecords);
    }
  };

  return (
    <div className="p-4">
      {/* Search Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 justify-between w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {/* Month Dropdown */}
        <select
          className="p-2 border rounded-md w-full sm:w-auto"
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          className="p-2 border rounded-md w-full sm:w-auto"
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {/* Search Button */}
        <button className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]" onClick={handleSearch}>
          Search
        </button>
        </div>
        {/* Export Button */}
        <button className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]">
          Export Payroll
        </button>
      </div>

      <div>
        {/* Display Selected Month and Year in Readable Format */}
        <p className="font-semibold text-xl text-gray-600 border-b border-t py-5 mb-2">
          {selectedMonth && selectedYear ? `${months.find(m => m.value === selectedMonth).label} ${selectedYear}` : "All Dates"}
        </p>
      </div>

      <div>
        {/* Search box */}
        <div className="relative w-full sm:w-auto mb-4">
        <MagnifyingGlass
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
        <input
            type="text"
            placeholder="Search..."
            className="p-2 border rounded-md pl-12 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#4c735c]"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Search when Enter is pressed
        />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] hover:bg-[#4c735c] text-white">
              <TableHead className="p-2 text-center text-white">Employee ID</TableHead>
              <TableHead className="p-2 text-center text-white">Full Name</TableHead>
              <TableHead className="p-2 text-center text-white">Department</TableHead>
              <TableHead className="p-2 text-center text-white">Fixed Salary</TableHead>
              <TableHead className="p-2 text-center text-white">Hours Worked</TableHead>
              <TableHead className="p-2 text-center text-white">Calculated Salary</TableHead>
              <TableHead className="p-2 text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <TableCell className="p-2 text-center">{record.employeeId}</TableCell>
                <TableCell className="p-2 text-center">{record.fullName}</TableCell>
                <TableCell className="p-2 text-center">{record.department}</TableCell>
                <TableCell className="p-2 text-center">₱{record.hourlyRate}</TableCell>
                <TableCell className="p-2 text-center">{record.hoursWorked}</TableCell>
                <TableCell className="p-2 text-center">₱{record.calculatedSalary}</TableCell>
                <TableCell className="p-2 text-center">
                  <button className="bg-gray-200 hover:bg-gray-300 p-1 rounded">
                    <Eye />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
