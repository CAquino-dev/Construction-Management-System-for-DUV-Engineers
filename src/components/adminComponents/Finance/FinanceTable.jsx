// FinanceTable.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { Eye } from "@phosphor-icons/react";
import { FinanceModal } from "./FinanceModal";
import Pagination from "../Pagination";

export const FinanceTable = () => {
  const [financeRecords, setFinanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const recordsPerPage = 5;

  useEffect(() => {
    fetchFinanceRecords();
  }, []);

  const fetchFinanceRecords = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/finance/getApprovedPayslips`
      );
      const data = await response.json();
      setFinanceRecords(data.data);
    } catch (error) {
      console.error("Error fetching payroll records:", error);
    }
  };

  const releaseSalary = async (payslipId) => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/finance/release-salary/${payslipId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ releasedBy: userId }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Update UI: mark payslip as released
        const updated = financeRecords.map((record) =>
          record.payslip_id === payslipId
            ? {
                ...record,
                is_released: 1,
                released_at: new Date().toISOString(),
              }
            : record
        );
        setFinanceRecords(updated);
        setMessage("✅ Salary released successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Failed to release salary: " + data.error);
        console.error("Error releasing salary:", data.error);
      }
    } catch (error) {
      setMessage("❌ Error releasing salary");
      console.error("Error releasing salary:", error);
    }
  };

  const totalPages = Math.ceil(financeRecords.length / recordsPerPage);
  const currentRecords = financeRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">💰</span>
                Salary Review
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and release employee salaries
              </p>
            </div>
            <div className="mt-4 sm:mt-0 bg-green-50 px-4 py-2 rounded-lg">
              <p className="text-green-800 font-medium">
                Total Payslips:{" "}
                <span className="font-bold">{financeRecords.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {financeRecords.filter((record) => !record.is_released).length}
            </div>
            <div className="text-sm text-gray-600">Pending Release</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {financeRecords.filter((record) => record.is_released).length}
            </div>
            <div className="text-sm text-gray-600">Released</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {financeRecords.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl ${
              message.includes("✅")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {message.includes("✅") ? "✅" : "❌"}
              </span>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📋</span>
              Approved Payslips
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {currentRecords.length} of {financeRecords.length}
              </span>
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
                  <TableHead className="text-center text-white">
                    Title
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Period
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Created At
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Created By
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Status
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((record, index) => (
                  <TableRow
                    key={record.payslip_id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <TableCell className="text-center p-4 font-medium">
                      {record.title}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm">
                      {new Date(record.period_start).toLocaleDateString()} -{" "}
                      {new Date(record.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center p-4">
                      {new Date(record.payslip_created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center p-4">
                      {record.created_by_name}
                    </TableCell>

                    {/* Release status */}
                    <TableCell className="text-center p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          record.is_released
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        {record.is_released ? <>✅ Released</> : "⏳ Pending"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="bg-[#4c735c] text-white p-2 rounded-lg hover:bg-[#3a5a47] transition-colors cursor-pointer flex items-center space-x-1"
                          title="View Details"
                        >
                          <Eye size={18} />
                          <span className="text-sm">View</span>
                        </button>

                        {!record.is_released && (
                          <button
                            onClick={() => releaseSalary(record.payslip_id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium flex items-center space-x-1"
                          >
                            <span>💰</span>
                            <span>Release</span>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {currentRecords.map((record) => (
              <div
                key={record.payslip_id}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {record.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        record.is_released
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.is_released ? "✅ Released" : "⏳ Pending"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Period:</span>
                      <div className="text-xs mt-1">
                        {new Date(record.period_start).toLocaleDateString()} -{" "}
                        {new Date(record.period_end).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <div className="text-xs mt-1">
                        {new Date(
                          record.payslip_created_at
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">By:</span>{" "}
                      {record.created_by_name}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex-1 bg-[#4c735c] text-white py-2 px-3 rounded-lg hover:bg-[#3a5a47] transition-colors cursor-pointer flex items-center justify-center space-x-1 text-sm"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>

                      {!record.is_released && (
                        <button
                          onClick={() => releaseSalary(record.payslip_id)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center space-x-1 text-sm"
                        >
                          <span>💰</span>
                          <span>Release Salary</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {financeRecords.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Approved Payslips
              </h3>
              <p className="text-gray-600">
                No payslips are currently awaiting salary release.
              </p>
            </div>
          )}

          {/* Pagination Component */}
          {financeRecords.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Finance Modal */}
        {selectedRecord && (
          <FinanceModal
            closeModal={() => setSelectedRecord(null)}
            record={selectedRecord}
          />
        )}
      </div>
    </div>
  );
};
