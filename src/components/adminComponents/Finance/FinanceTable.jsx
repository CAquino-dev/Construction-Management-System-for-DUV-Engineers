import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { Eye } from "@phosphor-icons/react";
import { FinanceModal } from "./FinanceModal";
import Pagination from "../Pagination";

export const FinanceTable = () => {
  const [financeRecords, setFinanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
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
    fetchFinanceRecords();
  }, []);

  // 🔹 Release Salary API call
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
      } else {
        console.error("Error releasing salary:", data.error);
      }
    } catch (error) {
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Created At</TableHead>
              <TableHead className="text-center text-white">Created By</TableHead>
              <TableHead className="text-center text-white">Released</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record, index) => (
              <TableRow
                key={record.payslip_id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <TableCell className="text-center p-2">{record.title}</TableCell>
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

                {/* Released status */}
                <TableCell className="text-center p-2">
                  {record.is_released
                    ? `✅ ${new Date(record.released_at).toLocaleDateString()}`
                    : "❌ Not Released"}
                </TableCell>

                <TableCell className="text-center p-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="bg-[#4c735c] text-white p-1 rounded-md hover:bg-white hover:text-[#4c735c] cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>

                    {!record.is_released && (
                      <button
                        onClick={() => releaseSalary(record.payslip_id)}
                        className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-white hover:text-blue-600 cursor-pointer"
                      >
                        Release
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {/* Finance Modal */}
      {selectedRecord && (
        <FinanceModal closeModal={() => setSelectedRecord(null)} record={selectedRecord} />
      )}
    </div>
  );
};
