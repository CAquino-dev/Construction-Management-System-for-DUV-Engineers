import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  Check,
  XCircle,
  User,
  Clock,
  CurrencyDollar,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import PaginationComponent from "../Pagination";
import ConfirmationModal from "../ConfirmationModal";
import { EmployeePayrollModal } from "../HR/EmployeePayrollModal";
import { toast } from "sonner";

export const PayslipModal = ({ closeModal, payslip }) => {
  if (!payslip) return null;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const itemsPerPage = 5;
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [remark, setRemark] = useState("");
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [isBulkAction, setIsBulkAction] = useState(false);
  const [isEmployeePayrollModalOpen, setIsEmployeePayrollModalOpen] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const openConfirmationModalForPayslip = (type) => {
    setActionType(type);
    setIsBulkAction(false);
    setRemark("");
    setIsConfirmationModalOpen(true);
  };

  const openConfirmationModalForItem = (type) => {
    setActionType(type);
    setIsBulkAction(true);
    setRemark("");
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleConfirmation = () => {
    if (isBulkAction) {
      updatePayslipItemStatus(selectedPayslips, actionType, remark);
    } else {
      updatePayslipStatus(actionType, remark);
    }
    setIsConfirmationModalOpen(false);
    setSelectedPayslips([]);
  };

  // Filter employees based on search term
  const filteredEmployees = employeeSalaries.filter((employee) =>
    employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        toast.success(`Updated ${selectedItemIds.length} employee(s) status`);
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
      userId: employeeData?.user_id || "N/A",
      payrollId: employeeData?.payroll_id || "N/A",
      department: employeeData?.department_name || "Unknown",
      hourlyRate: parseFloat(employeeData?.hourly_rate) || 0,
      totalHoursWorked: parseFloat(employeeData?.total_hours_worked || 0),
      calculated_salary: parseFloat(employeeData?.calculated_salary || 0),
      overtimePay: parseFloat(employeeData?.overtime_pay || 0),
      philhealthDeduction: parseFloat(employeeData?.philhealth_deduction || 0),
      sssDeduction: parseFloat(employeeData?.sss_deduction || 0),
      pagibigDeduction: parseFloat(employeeData?.pagibig_deduction || 0),
      totalDeductions: parseFloat(employeeData?.total_deductions || 0),
      finalSalary: parseFloat(employeeData?.final_salary || 0),
    };
  };

  const openEmployeePayrollModal = (employee) => {
    const formattedEmployee = formatEmployeeData(employee);
    setSelectedEmployee(formattedEmployee);
    setIsEmployeePayrollModalOpen(true);
  };

  const closeEmployeePayrollModal = () => {
    setIsEmployeePayrollModalOpen(false);
    setSelectedEmployee(null);
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      "Approved by HR": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Check,
      },
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      "Rejected by HR": {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig["Pending"];
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent size={10} />
        <span className="hidden sm:inline">{status}</span>
        <span className="sm:hidden">
          {status === "Approved by HR"
            ? "Approved"
            : status === "Rejected by HR"
            ? "Rejected"
            : "Pending"}
        </span>
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4c735c] to-[#5A8366] text-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <CurrencyDollar size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {payslip.title}
                </h2>
                <p className="text-white/80 text-sm truncate">
                  {payslip.remarks}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>
                  {payslip.start} to {payslip.end}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 flex-shrink-0 ml-4"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPayslips.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Check size={16} />
                <span>{selectedPayslips.length} employee(s) selected</span>
              </div>
              <select
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent text-sm"
                onChange={(e) => openConfirmationModalForItem(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Bulk Actions
                </option>
                <option value="Approved by HR">Approve Selected</option>
                <option value="Rejected by HR">Reject Selected</option>
              </select>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.includes(emp.payslip_item_id)}
                        onChange={() =>
                          togglePayslipSelection(emp.payslip_item_id)
                        }
                        className="flex-shrink-0 mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {emp.employee_name}
                        </h3>
                        <div className="mt-1">
                          <StatusBadge status={emp.status} />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openEmployeePayrollModal(emp)}
                      className="flex items-center gap-1 bg-[#4c735c] text-white px-2 py-1.5 rounded-lg hover:bg-[#5A8366] transition-colors text-xs ml-2 flex-shrink-0"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Hours:</span>
                      <p className="font-medium">
                        {parseFloat(emp.total_hours_worked).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Salary:</span>
                      <p className="font-medium text-green-800">
                        {formatCurrency(emp.final_salary)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto mb-3 text-gray-400" />
                <p>No employees found</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-[#4c735c] text-sm font-medium hover:text-[#5A8366]"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#4c735c] to-[#5A8366] hover:from-[#4c735c] hover:to-[#5A8366]">
                  <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedPayslips.length === paginatedEmployees.length &&
                        paginatedEmployees.length > 0
                      }
                      onChange={() => {
                        if (
                          selectedPayslips.length === paginatedEmployees.length
                        ) {
                          setSelectedPayslips([]);
                        } else {
                          setSelectedPayslips(
                            paginatedEmployees.map((emp) => emp.payslip_item_id)
                          );
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                    Employee
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
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp, index) => (
                    <TableRow
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      <TableCell className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPayslips.includes(
                            emp.payslip_item_id
                          )}
                          onChange={() =>
                            togglePayslipSelection(emp.payslip_item_id)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="font-medium text-gray-900">
                          {emp.employee_name}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="font-mono text-gray-700">
                          {parseFloat(emp.total_hours_worked).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="font-bold text-green-800 text-lg">
                          {formatCurrency(emp.final_salary)}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={emp.status} />
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <button
                          onClick={() => openEmployeePayrollModal(emp)}
                          className="inline-flex items-center gap-2 bg-[#4c735c] text-white px-3 py-2 rounded-lg hover:bg-[#5A8366] transition-all duration-200 font-medium text-sm"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <User size={48} className="text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Employees Found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm
                            ? "No matching employees found."
                            : "No employee records available."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer with Pagination and Actions */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Pagination */}
            {filteredEmployees.length > 0 && totalPages > 1 && (
              <div className="w-full sm:w-auto">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() =>
                  openConfirmationModalForPayslip("Approved by HR")
                }
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <Check size={20} />
                Approve All
              </button>
              <button
                onClick={() =>
                  openConfirmationModalForPayslip("Rejected by HR")
                }
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <XCircle size={20} />
                Reject All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeConfirmationModal}
          onConfirm={handleConfirmation}
          actionType={actionType}
          setRemark={setRemark}
        />
      )}

      {/* Employee Payroll Modal */}
      {isEmployeePayrollModalOpen && (
        <EmployeePayrollModal
          closeModal={closeEmployeePayrollModal}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};
