import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { toast } from "sonner";

export const EmployeePayrollModal = ({ closeModal, employee }) => {

  console.log('employee', employee);

  const [formData, setFormData] = useState({
    totalHoursWorked: employee?.totalHoursWorked || 0,
    overtimePay: employee?.overtimePay || 0,
    philhealthDeduction: employee?.philhealthDeduction || 0,
    sssDeduction: employee?.sssDeduction || 0,
    pagibigDeduction: employee?.pagibigDeduction || 0,
    finalSalary: employee?.finalSalary || 0,
  });

  // Calculate final salary whenever relevant fields change
  useEffect(() => {
    const calculateFinalSalary = () => {
      const hourlyRate = employee?.hourlyRate || 0;
      const totalHours = parseFloat(formData.totalHoursWorked) || 0;
      const overtime = parseFloat(formData.overtimePay) || 0;
      const philhealth = parseFloat(formData.philhealthDeduction) || 0;
      const sss = parseFloat(formData.sssDeduction) || 0;
      const pagibig = parseFloat(formData.pagibigDeduction) || 0;

      const baseSalary = totalHours * hourlyRate;
      const totalDeductions = philhealth + sss + pagibig;
      const finalSalary = baseSalary + overtime - totalDeductions;

      setFormData(prev => ({
        ...prev,
        finalSalary: Math.max(0, finalSalary) // Ensure salary doesn't go negative
      }));
    };

    calculateFinalSalary();
  }, [
    formData.totalHoursWorked,
    formData.overtimePay,
    formData.philhealthDeduction,
    formData.sssDeduction,
    formData.pagibigDeduction,
    employee?.hourlyRate
  ]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSave = async () => {
  const payload = {
    payrollId: employee.payrollId,
    ...formData,
  };

  // 🔍 Log everything that will be sent to the backend
  console.log("📦 Sending to backend (/api/hr/updateEmployeePayroll):", payload);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/updateEmployeePayroll`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Employee payroll updated successfully!");
      closeModal();
    } else {
      toast.error(data.message || data.error || "Failed to update payroll");
    }
  } catch (error) {
    console.error("❌ Error updating payroll:", error);
    toast.error("Something went wrong");
  }
};



  // Get first letter for avatar placeholder
  const getInitial = () => {
    return employee?.fullName ? employee.fullName.charAt(0).toUpperCase() : "?";
  };

  // Get color based on name for consistent avatar background
  const getAvatarColor = () => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-orange-500", "bg-pink-500", "bg-teal-500"
    ];
    const index = employee?.fullName?.length % colors.length || 0;
    return colors[index];
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[900px] flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Employee Payroll</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <div className={`${getAvatarColor()} h-20 w-20 rounded-full flex items-center justify-center`}>
            <span className="text-white text-2xl font-bold">{getInitial()}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-lg">{employee?.fullName}</p>
            <p className="text-gray-500 text-sm">{employee?.department}</p>
            <p className="text-gray-600 text-sm mt-1">
              Hourly Rate: ₱{employee?.hourlyRate?.toLocaleString() || "0.00"}
            </p>
          </div>
        </div>

        {/* Payroll Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Payroll Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                label: "Total Worked Hours", 
                key: "totalHoursWorked", 
                helper: `Base: ₱${((employee?.hourlyRate || 0) * (formData.totalHoursWorked || 0)).toLocaleString()}`
              },
              { 
                label: "Overtime Pay (₱)", 
                key: "overtimePay",
                helper: "Additional pay for overtime work"
              },
              { 
                label: "PhilHealth Deduction (₱)", 
                key: "philhealthDeduction",
                helper: "Healthcare contribution"
              },
              { 
                label: "SSS Deduction (₱)", 
                key: "sssDeduction",
                helper: "Social security contribution"
              },
              { 
                label: "Pag-IBIG Deduction (₱)", 
                key: "pagibigDeduction",
                helper: "Housing fund contribution"
              },
            ].map(({ label, key, helper }) => (
              <div key={key} className="flex flex-col">
                <label className="text-gray-600 text-sm mb-1 font-medium">{label}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
                {helper && (
                  <p className="text-xs text-gray-500 mt-1">{helper}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Salary Display */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1 font-medium">Final Salary (₱)</label>
            <div className="text-2xl font-bold text-[#4c735c]">
              ₱{formData.finalSalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Calculated automatically based on hours worked and deductions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#4c735c] text-white rounded-md hover:bg-[#5a8366] transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};