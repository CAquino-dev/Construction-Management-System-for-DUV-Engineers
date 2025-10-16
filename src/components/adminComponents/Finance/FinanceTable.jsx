// FinanceTable.jsx
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getApprovedPayslips`
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/release-salary/${payslipId}`,
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
            ? { ...record, is_released: 1, released_at: new Date().toISOString() }
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
    <div className="p-4">
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Salary Review</h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Period</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Created At</TableHead>
              <TableHead className="text-center text-white">Created By</TableHead>
              <TableHead className="text-center text-white">Status</TableHead>
              <TableHead className="text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record, index) => (
              <TableRow
                key={record.payslip_id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <TableCell className="text-center p-2 font-medium">{record.title}</TableCell>
                <TableCell className="text-center p-2 text-sm">
                  {new Date(record.period_start).toLocaleDateString()} - {" "}
                  {new Date(record.period_end).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center p-2">
                  {new Date(record.period_start).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center p-2">
                  {new Date(record.period_end).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center p-2">
                  {new Date(record.payslip_created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center p-2">{record.created_by_name}</TableCell>

                {/* Release status */}
                <TableCell className="text-center p-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.is_released
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {record.is_released ? (
                      <>
                        ✅ Released {new Date(record.released_at).toLocaleDateString()}
                      </>
                    ) : (
                      "⏳ Pending Release"
                    )}
                  </span>
                </TableCell>

                <TableCell className="text-center p-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="bg-[#4c735c] text-white p-1 rounded-md hover:bg-[#3a5a47] transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {!record.is_released && (
                      <button
                        onClick={() => releaseSalary(record.payslip_id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                      >
                        Release Salary
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {financeRecords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No approved payslips found for review.
        </div>
      )}

      {/* Pagination Component */}
      {financeRecords.length > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          setCurrentPage={setCurrentPage} 
        />
      )}

      {/* Finance Modal */}
      {selectedRecord && (
        <FinanceModal 
          closeModal={() => setSelectedRecord(null)} 
          record={selectedRecord} 
        />
      )}
    </div>
  );
};