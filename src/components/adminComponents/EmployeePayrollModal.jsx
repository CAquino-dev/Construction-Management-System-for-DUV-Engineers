import React, { useState } from "react";
import { X, CalendarBlank } from "@phosphor-icons/react";
import { Calendar } from "../../components/ui/calendar";

export const EmployeePayrollModal = ({ closeModal, employee }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });

  const handleDateSelect = (range) => {
    setDateRange(range);
    const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const formattedFrom = formatDate(range.from);
    const formattedTo = formatDate(range.to);

    console.log("Selected From:", formattedFrom);
    console.log("Selected To:", formattedTo);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[900px] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold text-gray-800">Payroll Details</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Main Content (Left & Right Sections) */}
        <div className="flex justify-between items-center w-full gap-6">
          {/* Left Section - Profile Info */}
          <div className="flex items-center gap-4 flex-[1] border-r border-gray-200 pr-4">
            <div className="bg-black h-20 w-20 rounded-full"></div>
            <div>
              <p className="font-semibold text-gray-800">{employee?.full_name || "N/A"}</p>
              <p className="text-gray-500 text-sm">{employee?.department_name || "Department Unknown"}</p>
            </div>
          </div>

          {/* Right Section - Date Selector */}
          <div className="flex flex-col flex-[2] relative">
            <p className="border-b border-gray-200 pb-2 mb-4">Fixed Salary: ₱{employee?.fixed_salary || "N/A"}</p>
            
            {/* Select Date Button */}
            <button 
              className="flex w-50 items-center gap-2 bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            >
              <CalendarBlank size={20} /> Select Date Range
            </button>

            {/* Calendar Dropdown (Properly Positioned) */}
            {isCalendarOpen && (
              <div className="absolute top-20 left-0 mt-2 bg-white p-4 border rounded-md shadow-md w-auto z-50">
                <Calendar mode="range" selected={dateRange} onSelect={handleDateSelect} />
              </div>
            )}

            {/* Selected Date Display */}
            <p className="mt-2 text-gray-700">
              <span className="text-lg">
                From: <strong>{dateRange.from.toDateString()}</strong> to <strong>{dateRange.to.toDateString()}</strong>
              </span>
            </p>

            {/* Payroll Breakdown */}
            <div className="mt-4 border-t pt-4 text-gray-800">
              {/* Payroll Breakdown in Grid Format */}
              <div className="grid grid-cols-2 gap-4 text-lg">
                <p className="text-gray-600 italic">Total Worked Hours:</p>
                <p className="text-right">{employee?.total_hours || "0"} hrs</p>

                <p className="text-gray-600 italic">Bonus:</p>
                <p className="text-right">₱{employee?.bonus || "0.00"}</p>

                <p className="text-gray-600 italic">Deduction:</p>
                <p className="text-right">₱{employee?.deduction || "0.00"}</p>
              </div>

              {/* Divider Line & Calculated Salary */}
              <hr className="border-t border-gray-300 my-2" />
              <div className="flex justify-between text-xl">
                <p className="text-gray-600 italic">Calculated Salary:</p>
                <p>₱{employee?.calculated_salary || "N/A"}</p>
              </div>

              <button className="">Approve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
