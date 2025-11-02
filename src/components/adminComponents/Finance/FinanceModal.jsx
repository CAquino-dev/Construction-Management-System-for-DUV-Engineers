import React, { useEffect, useState } from "react";
import {
  X,
  Check,
  XCircle,
  FileText,
  Calendar,
  User,
} from "@phosphor-icons/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import ConfirmationModal from "../ConfirmationModal";
import { toast } from "sonner";

export const FinanceModal = ({ closeModal, record }) => {
  console.log("record", record);

  const [financeRecords, setFinanceRecords] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [actionType, setActionType] = useState(null);

  const openConfirmationModal = (type) => {
    setActionType(type);
    setRemark("");
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleConfirmation = () => {
    if (actionType === "Approved by Finance") {
      updatePayslipStatus("Approved by Finance");
    } else if (actionType === "Rejected by Finance") {
      updatePayslipStatus("Rejected by Finance", remark);
    }
    setIsConfirmationModalOpen(false);
  };

  useEffect(() => {
    setFinanceRecords(record);
  }, [record]);

  const updatePayslipStatus = async (status, remark) => {
    console.log("payslipID", record.payslip_id);
    console.log("Status", status);
    const userId = localStorage.getItem("userId");

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/finance/updatePayslipStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payslipId: record.payslip_id,
            status: status,
            remarks: remark,
            approvedBy: userId,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error("Error response from API:", data);
      }
      if (response.ok) {
        console.log(data.message);
        toast.success(`Payslip ${status}`);
      } else {
        console.error("Failed to update payslip status:", data.error);
      }
    } catch (error) {
      console.error("Error updating payslip status:", error);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      "Approved by HR": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Check,
      },
      "Approved by Finance": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Check,
      },
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: FileText,
      },
      "Rejected by Finance": {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig["Pending"];
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent size={12} />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatHours = (hours) => {
    return parseFloat(hours || 0).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4c735c] to-[#5A8366] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Finance Record</h2>
              <p className="text-white/80 text-sm">
                Review and approve payroll details
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Payslip Info */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={18} />
                  <span className="text-sm font-medium">Payslip Title</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {record.title}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Period</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(record.period_start).toLocaleDateString()} to{" "}
                  {new Date(record.period_end).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={18} />
                  <span className="text-sm font-medium">Remarks</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {record.remarks || "No remarks"}
                </p>
              </div>
            </div>
          </div>

          {/* Employee Records */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3 p-4">
              {financeRecords.items && financeRecords.items.length > 0 ? (
                financeRecords.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="space-y-3">
                      {/* Employee Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {item.employee_name}
                          </h3>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>

                      {/* Financial Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">Hours:</span>
                          <p className="font-medium">
                            {formatHours(item.total_hours_worked)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Salary:</span>
                          <p className="font-medium">
                            {formatCurrency(item.calculated_salary)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            Overtime:
                          </span>
                          <p className="font-medium">
                            {formatCurrency(item.overtime_pay)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            Deductions:
                          </span>
                          <p className="font-medium text-red-600">
                            {formatCurrency(item.total_deductions)}
                          </p>
                        </div>
                      </div>

                      {/* Final Salary */}
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium text-sm">
                            Final Salary:
                          </span>
                          <span className="text-green-800 font-bold text-lg">
                            {formatCurrency(item.final_salary)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>No employee records found</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#4c735c] to-[#5A8366] hover:from-[#4c735c] hover:to-[#5A8366]">
                    <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Employee Name
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Total Hours
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Salary
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Overtime Pay
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Deductions
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Final Salary
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeRecords.items && financeRecords.items.length > 0 ? (
                    financeRecords.items.map((item, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <TableCell className="p-4">
                          <div className="font-medium text-gray-900">
                            {item.employee_name}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="font-mono text-gray-700">
                            {formatHours(item.total_hours_worked)}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="font-medium text-gray-700">
                            {formatCurrency(item.calculated_salary)}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="font-medium text-blue-600">
                            {formatCurrency(item.overtime_pay)}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="font-medium text-red-600">
                            {formatCurrency(item.total_deductions)}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="font-bold text-green-800 text-lg">
                            {formatCurrency(item.final_salary)}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="flex justify-center">
                            <StatusBadge status={item.status} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText size={48} className="text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No Employee Records
                          </h3>
                          <p className="text-gray-500">
                            No employee records found for this payslip.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => openConfirmationModal("Approved by Finance")}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <Check size={20} />
                Approve Payslip
              </button>
            </div>

            <button
              className="flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold w-full sm:w-auto mt-3 sm:mt-0"
              onClick={closeModal}
            >
              <X size={20} />
              Close
            </button>
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
    </div>
  );
};
