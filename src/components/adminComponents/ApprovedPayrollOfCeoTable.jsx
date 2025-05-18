import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Money } from "@phosphor-icons/react";
import Pagination from "./Pagination";
import ConfirmationModal from "./ConfirmationModal"; // Ensure correct path

const initialData = [
  { id: 1, title: "Payroll 1", start: "2023-01-01", end: "2023-01-31", status: "Pending" },
  { id: 2, title: "Payroll 2", start: "2023-02-01", end: "2023-02-28", status: "Paid" },
  { id: 3, title: "Payroll 3", start: "2023-03-01", end: "2023-03-31", status: "Paid" },
  { id: 4, title: "Payroll 4", start: "2023-04-01", end: "2023-04-30", status: "Pending" },
  { id: 5, title: "Payroll 5", start: "2023-05-01", end: "2023-05-31", status: "Paid" },
];

export const ApprovedPayrollOfCeoTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [remark, setRemark] = useState("");
  const [payslips, setPayslips] = useState([]);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCeoApprovedPayslips = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getCeoApprovedPayslips`);
        const data = await response.json();
        console.log('data', data.payslips);
        if(response.ok){
          setPayslips(data.payslips)
        }

      } catch (error) {
        console.error('Error fetching payslips:', error);
      }
    }
    fetchCeoApprovedPayslips();
  }, [])

  useEffect(() => {
    console.log('payslips', payslips);
  }, [payslips])

  const recordsPerPage = 5;
  const totalPages = Math.ceil(initialData.length / recordsPerPage);
  const currentRecords = initialData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleActionClick = (record, action) => {
    setSelectedRecord(record);
    setActionType(action);
    setIsModalOpen(true);
  };

const handleConfirm = async () => {

  try {
    // Construct the payload to send to the backend
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/updatePaymentStatus`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payslipId: selectedRecord.id,  // The selected payslip ID
        paymentStatus: "Paid",         // Mark the payment status as "Paid"
        remarks: "Payment completed successfully.",               // Optional remarks from the finance team
        paidBy: 1,                     // Assuming "1" is the ID of the finance team member (can be dynamic)
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Payslip marked as paid successfully.");
      // Optionally update the UI here to reflect the changes
    } else {
      console.error("Failed to update payment status:", data.error);
    }
  } catch (error) {
    console.error("Error processing payment:", error);
  }

  setIsModalOpen(false); // Close modal after confirming
};


  return (
    <div className='p-4'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Status</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((record, index) => (
              <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <TableCell className="text-center p-2">{record.title}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.period_start).toLocaleDateString()}</TableCell>
                <TableCell className="text-center p-2">{new Date(record.period_end).toLocaleDateString()}</TableCell>
                <TableCell
                  className={`text-center p-2 font-semibold ${
                    record.payment_statuss === "Pending" ? "text-yellow-500" :
                    record.payment_status === "Paid" ? "text-green-500" :
                    "text-gray-700"
                  }`}
                >
                  {record.payment_status}
                </TableCell>
                <TableCell className="text-center p-2">
                  {record.payment_status === "Pending" && (
                    <button
                      onClick={() => handleActionClick(record, "Paid")}
                      className="border border-green-500 text-green-500 p-2 rounded-full hover:bg-green-600 hover:text-white cursor-pointer"
                    >
                      <Money size={15} />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        actionType={actionType}
        setRemark={setRemark}
      />
    </div>
  );
};
