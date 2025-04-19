import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import  PaginationComponent  from "./Pagination"; 
import {
  DotsThree
} from "@phosphor-icons/react";

export const PayslipModal = ({ closeModal, payslip }) => {
  if (!payslip) return null; // Ensures the modal only renders when a payslip is selected

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const itemsPerPage = 5; // Adjust based on preference
  const [openMenuId, setOpenMenuId] = useState(null); // Track which dropdown is open


  // Filter employees based on search term
  const filteredEmployees = payslip.Employee_Salary
    ? payslip.Employee_Salary.filter(employee =>
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
          const response = await fetch(`http://localhost:5000/api/hr/payslips/${payslip.id}`);
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

    const getDropdownOptions = (status) => {
      const allOptions = ["View", "Approved", "Pending", "Rejected"];
      return allOptions.filter((option) => {
        if (option === "Approved" && status === "Approved") return false;
        if (option === "Pending" && status === "Pending") return false;
        if (option === "Rejected" && status === "Rejected") return false;
        return true;
      });
    };

    const updateStatus = async (payslip_item_id, newStatus) => {
      console.log('payrollID:', payslip_item_id);
      console.log('Status:', newStatus);

      try {
        const response = await fetch(`http://localhost:5000/api/hr/updatePayslipItemStatus`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            selectedItemIds: payslip_item_id,
            newStatus: newStatus 
          }),
        });
    
        const data = await response.json();
        if (response.ok) {
          // Update local state after successful update
          setEmployeeSalaries((prev) =>
            prev.map((emp) =>
              emp.payslip_item_id === payslip_item_id ? { ...emp, status: newStatus } : emp
            )
          );
          setOpenMenuId(null);
        } else {
          console.error("Failed to update status:", data.error);
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };

    const updatePayslipStatus = async (status) => {
      console.log("payslipID", payslip.id);
      console.log("Status", status);
      try {
        const response = await fetch(`http://localhost:5000/api/hr/updatePayslipStatus`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payslipId: payslip.id, status }),
        });
    
        const data = await response.json();
    
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] h-[600px] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
            <div>
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg text-gray-500">Payslip:</h2>
                    <p className="font-bold">{payslip.title}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg text-gray-500">Period:</h2>
                    <p className="font-bold">{payslip.start} <span className="text-gray-500">to</span> {payslip.end}</p>
                </div>
            </div>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Employee..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Payslip Details */}
        <div className="space-y-3 flex-1 overflow-auto ">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
                <TableHead className="text-center text-white">Employee Name</TableHead>
                <TableHead className="text-center text-white">Total Hours</TableHead>
                <TableHead className="text-center text-white">Salary</TableHead>
                <TableHead className="text-center text-white">Status</TableHead>
                <TableHead className="text-center text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto max-h-[400px]">
              {employeeSalaries.length > 0 ? (
                employeeSalaries.map((emp, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                    <TableCell className="text-center">{emp.employee_name}</TableCell>
                    <TableCell className="text-center">{parseFloat(emp.total_hours_worked).toFixed(2)}</TableCell>
                    <TableCell className="text-center">₱{parseFloat(emp.calculated_salary).toLocaleString()}</TableCell>
                    <TableCell className="text-center p-2">
                      <p className={`text-center text-xs p-2 font-semibold rounded-md ${
                        emp.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : emp.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {emp.status}
                      </p>
                    </TableCell>
                    <TableCell className="text-center relative p-2">
                      <div className="relative inline-block">
                        <button
                          className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                          onClick={() =>
                            setOpenMenuId(openMenuId === emp.payslip_item_id ? null : emp.payslip_item_id)
                          }
                        >
                          <DotsThree />
                        </button>

                        {openMenuId === emp.payslip_item_id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10 flex flex-col">
                            {getDropdownOptions(emp.status).map((option) => (
                              <button
                                key={option}
                                onClick={() => updateStatus(emp.payslip_item_id, option)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                onClick={() => updatePayslipStatus("approved")}
                className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
              >
                Accept
              </button>
              <button
                onClick={() => updatePayslipStatus("rejected")}
                className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
              >
                Reject
              </button>
            </div>
        <PaginationComponent currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
};
