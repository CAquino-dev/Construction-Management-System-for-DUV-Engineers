import React, { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import {
  DotsThree
} from "@phosphor-icons/react";
import ConfirmationModal from "./ConfirmationModal";

export const FinanceModal = ({ closeModal, record }) => {
  console.log('record', record)

  const [financeRecords, setFinanceRecords] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [actionType, setActionType] = useState(null);
  
  const openConfirmationModal = (type) => {
    setActionType(type);
    setRemark(""); // Reset the remark
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleConfirmation = () => {
    if (actionType === "Approved by Finance") {
      updatePayslipStatus("Approved by Finance"); // Call the function to approve the payslip
    } else if (actionType === "Rejected by Finance") {
      updatePayslipStatus("Rejected by Finance", remark); // Call the function to reject the payslip
    }
    setIsConfirmationModalOpen(false); // Close the modal after action
  };
  
  

  useEffect(() => {
    setFinanceRecords(record);
  }, [record])

  const updatePayslipStatus = async (status, remark) => {

    console.log("payslipID", record.payslip_id);
    console.log("Status", status);
    const userId = localStorage.getItem('userId'); 

    try {
      const response = await fetch('http://localhost:5000/api/finance/updatePayslipStatus', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payslipId: record.payslip_id,
          status: status,
          remarks: remark,
          approvedBy: userId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Error response from API:", data);
      } 
      if (response.ok) {
        console.log(data.message);
        // Optional: you can set a status in the state if you want to reflect it on UI
        alert(`Payslip ${status}`);
      } else {
        console.error("Failed to update payslip status:", data.error);
      }
    } catch (error) {
      console.error("Error updating payslip status:", error);
    }

  };



  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[600px]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold text-gray-800">Finance Record</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Finance Details */}
                <div className="space-y-3 flex-1 overflow-auto ">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
                        <TableHead className="text-center text-white">Employee Name</TableHead>
                        <TableHead className="text-center text-white">Total Hours</TableHead>
                        <TableHead className="text-center text-white">Salary</TableHead>
                        <TableHead className="text-center text-white">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="overflow-y-auto max-h-[400px]">
                      {financeRecords.items && financeRecords.items.length > 0 ? (
                        financeRecords.items.map((record, index) => (
                          <TableRow key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                            <TableCell className="text-center">{record.employee_name}</TableCell>
                            <TableCell className="text-center">{parseFloat(record.total_hours_worked).toFixed(2)}</TableCell>
                            <TableCell className="text-center">₱{parseFloat(record.calculated_salary).toLocaleString()}</TableCell>
                            <TableCell className="text-center p-2">
                              <p className={`text-center text-xs p-2 font-semibold rounded-md ${
                                record.status === "Approved by HR"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {record.status}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))
                        
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center p-4 text-gray-500">No matching employees</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => openConfirmationModal("Approved by Finance")}
                    className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => openConfirmationModal("Rejected by Finance")}
                    className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
                  >
                    Reject
                  </button>
            </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={closeModal}>
            Close
          </button>
        </div>
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
  );
};
