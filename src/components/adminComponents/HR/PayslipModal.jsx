import React, { useState, useEffect } from "react";
import { X, Eye } from "@phosphor-icons/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import PaginationComponent from "../Pagination";
import { DotsThree } from "@phosphor-icons/react";
import ConfirmationModal from "../ConfirmationModal";
import { EmployeePayrollModal } from "../HR/EmployeePayrollModal"; // Import the EmployeePayrollModal component
import { toast } from "sonner";

export const PayslipModal = ({ closeModal, payslip }) => {
  if (!payslip) return null; // Ensures the modal only renders when a payslip is selected

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const itemsPerPage = 5; // Adjust based on preference
  const [openMenuId, setOpenMenuId] = useState(null); // Track which dropdown is open
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [remark, setRemark] = useState(""); // Holds the remark
  const [selectedPayslips, setSelectedPayslips] = useState([]); // Holds selected payslip items
  const [isBulkAction, setIsBulkAction] = useState(false); // Flag to differentiate between bulk action or single item update
  const [isEmployeePayrollModalOpen, setIsEmployeePayrollModalOpen] =
    useState(false); // Control modal visibility
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Store selected employee data

  const openConfirmationModalForPayslip = (type) => {
    setActionType(type);
    setIsBulkAction(false); // Reset to update the entire payslip
    setRemark(""); // Reset the remark
    setIsConfirmationModalOpen(true);
  };

  const openConfirmationModalForItem = (type) => {
    setActionType(type);
    setIsBulkAction(true); // Mark this as bulk action for selected items
    setRemark(""); // Reset the remark
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleConfirmation = () => {
    if (isBulkAction) {
      // Bulk update for selected payslip items
      updatePayslipItemStatus(selectedPayslips, actionType, remark);
    } else {
      // Individual payslip update
      updatePayslipStatus(actionType, remark);
    }
    setIsConfirmationModalOpen(false); // Close the modal after action
    setSelectedPayslips([]); // Reset selected payslips after action
  };

  // Filter employees based on search term
  const filteredEmployees = payslip.Employee_Salary
    ? payslip.Employee_Salary.filter((employee) =>
        employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchPayslipDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/payslips/${
            payslip.id
          }`
        );
        const data = await response.json();

        if (response.ok) {
          setEmployeeSalaries(data.data?.items || []);
        } else {
          console.error("Failed to fetch payslip details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching payslip details:", error);
      }
    };

    if (payslip?.id) {
      fetchPayslipDetails();
    }
  }, [payslip]);

  const togglePayslipSelection = (payslipItemId) => {
    setSelectedPayslips((prevSelected) =>
      prevSelected.includes(payslipItemId)
        ? prevSelected.filter((id) => id !== payslipItemId)
        : [...prevSelected, payslipItemId]
    );
  };

  // Update single payslip item status
  const updatePayslipStatus = async (status, remark) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/updatePayslipStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payslipId: payslip.id,
            status: status,
            remarks: remark,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`Payslip ${status}`);
      } else {
        console.error("Failed to update payslip status:", data.error);
      }
    } catch (error) {
      console.error("Error updating payslip status:", error);
    }
  };

  // Bulk update payslip items status
  const updatePayslipItemStatus = async (selectedItemIds, status, remark) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/hr/updatePayslipItemStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedItemIds: selectedItemIds,
            newStatus: status,
            remarks: remark,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setEmployeeSalaries((prev) =>
          prev.map((emp) =>
            selectedItemIds.includes(emp.payslip_item_id)
              ? { ...emp, status: status }
              : emp
          )
        );
      } else {
        console.error("Failed to update status:", data.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatEmployeeData = (employeeData) => {
    return {
      fullName: employeeData?.employee_name || "N/A",
      department: employeeData?.department_name || "Unknown",
      totalHoursWorked: parseFloat(
        employeeData?.total_hours_worked || 0
      ).toFixed(2),
      calculated_salary: parseFloat(
        employeeData?.calculated_salary || 0
      ).toLocaleString(),
      overtimePay: parseFloat(employeeData?.overtime_pay || 0).toLocaleString(),
      philhealthDeduction: parseFloat(
        employeeData?.philhealth_deduction || 0
      ).toLocaleString(),
      sssDeduction: parseFloat(
        employeeData?.sss_deduction || 0
      ).toLocaleString(),
      pagibigDeduction: parseFloat(
        employeeData?.pagibig_deduction || 0
      ).toLocaleString(),
      totalDeductions: parseFloat(
        employeeData?.total_deductions || 0
      ).toLocaleString(),
      finalSalary: parseFloat(employeeData?.final_salary || 0).toLocaleString(),
    };
  };

  // Open the Employee Payroll Modal and pass the selected employee data
  const openEmployeePayrollModal = (employee) => {
    const formattedEmployee = formatEmployeeData(employee);
    setSelectedEmployee(formattedEmployee);

    setIsEmployeePayrollModalOpen(true);
  };

  const closeEmployeePayrollModal = () => {
    setIsEmployeePayrollModalOpen(false);
    setSelectedEmployee(null); // Reset selected employee
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] h-[600px] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg text-gray-500">Payslip:</h2>
              <p className="font-bold">{payslip.title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg text-gray-500">Remarks:</h2>
              <p className="font-bold">{payslip.remarks}</p>
            </div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg text-gray-500">Period:</h2>
              <p className="font-bold">
                {payslip.start} <span className="text-gray-500">to</span>{" "}
                {payslip.end}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-red-500 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar
        <input
          type="text"
          placeholder="Search Employee..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        /> */}

        <div className="my-2">{/*here*/}</div>

        {/* Payslip Details */}
        <div className="space-y-3 flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
                <TableHead className="text-center text-white">Select</TableHead>
                <TableHead className="text-center text-white">
                  Employee Name
                </TableHead>
                <TableHead className="text-center text-white">
                  Total Hours
                </TableHead>
                <TableHead className="text-center text-white">Salary</TableHead>
                <TableHead className="text-center text-white">Status</TableHead>
                <TableHead className="text-center text-white">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeSalaries.length > 0 ? (
                employeeSalaries.map((emp, index) => (
                  <TableRow
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.includes(emp.payslip_item_id)}
                        onChange={() =>
                          togglePayslipSelection(emp.payslip_item_id)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {emp.employee_name}
                    </TableCell>
                    <TableCell className="text-center">
                      {parseFloat(emp.total_hours_worked).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-green-800">
                      ₱{parseFloat(emp.calculated_salary).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      <p
                        className={`text-center text-xs p-2 font-semibold rounded-md ${
                          emp.status === "Approved by HR"
                            ? "bg-green-100 text-green-800"
                            : emp.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {emp.status}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => openEmployeePayrollModal(emp)} // Open the modal when clicked
                        className="text-black hover:text-gray-600 cursor-pointer bg-[#4c735c] text-white p-1 rounded-md"
                      >
                        <Eye size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center p-4 text-gray-500"
                  >
                    No matching employees
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedPayslips.length > 0 && (
          <div className="mt-4 flex justify-between">
            <select
              className="border p-2 rounded-md"
              onChange={(e) => openConfirmationModalForItem(e.target.value)}
            >
              <option value="">Select Action</option>
              <option value="Approved by HR">Approve</option>
              <option value="Rejected by HR">Reject</option>
            </select>
          </div>
        )}

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

        {/* Accept and Reject Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => openConfirmationModalForPayslip("Approved by HR")}
            className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
          >
            Accept
          </button>
          <button
            onClick={() => openConfirmationModalForPayslip("Rejected by HR")}
            className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
          >
            Reject
          </button>
        </div>

        {/* Confirmation Modal */}
        {isConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            onClose={closeConfirmationModal}
            onConfirm={handleConfirmation}
            actionType={actionType} // Pass the action type to display in modal
            setRemark={setRemark}
          />
        )}
      </div>

      {/* Employee Payslip Modal */}
      {isEmployeePayrollModalOpen && (
        <EmployeePayrollModal
          closeModal={closeEmployeePayrollModal}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};
