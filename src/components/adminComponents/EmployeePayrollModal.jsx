import React from "react";
import { X } from "@phosphor-icons/react";

export const EmployeePayrollModal = ({ closeModal, employee }) => {
  console.log('Employee Modal:', employee);

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[900px] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold text-gray-800">Payslip Details</h2>
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
              <p className="font-semibold text-gray-800">{employee?.fullName || "N/A"}</p>
              <p className="text-gray-500 text-sm">{employee?.department || "Department Unknown"}</p>
            </div>
          </div>

          {/* Right Section - Payroll Info */}
          <div className="flex flex-col flex-[2] relative">
            <p className="border-b border-gray-200 pb-2 mb-4 text-lg font-semibold text-green-800"><span className="text-gray-600">Worked hours Salary: </span>₱{employee?.calculatedSalary || "N/A"}</p>

            {/* Payroll Breakdown */}
            <div className="mt-4 pt-4 text-gray-800">
              {/* Payroll Breakdown in Grid Format */}
              <div className="grid grid-cols-2 gap-4 text-lg">
                <p className="text-gray-600 italic">Total Worked Hours:</p>
                <p className="text-right">{employee?.totalHoursWorked || "0"} hrs</p>

                <p className="text-gray-600 italic">Overtime Pay:</p>
                <p className="text-right">₱{employee?.overtimePay || "0.00"}</p>

                <p className="text-gray-600 italic">PhilHealth Deduction:</p>
                <p className="text-right text-red-500">₱-{employee?.philhealthDeduction || "0.00"}</p>

                <p className="text-gray-600 italic">SSS Deduction:</p>
                <p className="text-right text-red-500">₱-{employee?.sssDeduction || "0.00"}</p>

                <p className="text-gray-600 italic">Pag-IBIG Deduction:</p>
                <p className="text-right text-red-500">₱-{employee?.pagibigDeduction || "0.00"}</p>
              </div>

              {/* Divider Line & Calculated Salary */}
              <hr className="border-t border-gray-300 my-2" />

              <div className="flex justify-between text-xl">
                <p className="text-gray-600 italic">Total Deductions:</p>
                <p>₱{employee?.totalDeductions || "0.00"}</p>
              </div>

              <div className="flex justify-between text-xl mt-2">
                <p className="text-gray-600 italic">Final Salary:</p>
                <p className="font-bold text-green-800">₱{employee?.finalSalary || "N/A"}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
