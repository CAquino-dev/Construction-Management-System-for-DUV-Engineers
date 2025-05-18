import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"; // Ensure correct path
import { Eye } from "@phosphor-icons/react";
import Pagination from "./Pagination"; // Ensure correct path

const initialData = [
    {
      id: 1,
      title: "April 1-15",
      period_start: "2025-07-01",
      period_end: "2025-07-31",
      approved_at: "2025-07-15",
      approved_by: "John Doe",
      finance_record: [
        { employee_name: "John Doe", total_hours: 40, salary: 20_340.95, status: "Paid" },
        { employee_name: "oliver marites", total_hours: 40, salary: 20_340.95, status: "Paid" },
        { employee_name: "Niana Doe", total_hours: 40, salary: 20_340.95, status: "Paid" },
      ],
    },
    {
      id: 2,
      title: "April 16-30",
      period_start: "2025-07-01",
      period_end: "2025-07-31",
      approved_at: "2025-07-15",
      approved_by: "John Doe",
      finance_record: [
        { employee_name: "John Doe", total_hours: 40, salary: 20_340.95, status: "Pending" },
        { employee_name: "oliver marites", total_hours: 40, salary: 20_340.95,status: "Pending" },
        { employee_name: "Niana Doe", total_hours: 40, salary: 20_340.95,status: "Pending" },
      ]
    },
    {
      id: 3,
      title: "May 1-15",
      period_start: "2025-07-01",
      period_end: "2025-07-31",
      approved_at: "2025-07-15",
      approved_by: "John Doe",
      finance_record: [
        { employee_name: "John Doe", total_hours: 40, salary: 20_340.95, status: "Pending" },
        { employee_name: "oliver marites", total_hours: 40, salary: 20_340.95, status: "Pending" },
        { employee_name: "Niana Doe", total_hours: 40, salary: 20_340.95, status: "Pending" },
      ]
    },
  ];

export const CeoTable = ({ setSelectedPayslips }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const totalPages = Math.ceil(initialData.length / itemsPerPage);
  const currentData = initialData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    const fetchApprovedPayslips = async () => {
      try {
        const response = await fetch('${import.meta.env.VITE_REACT_APP_API_URL}/api/ceo/getFinanceApprovedPayslips');
        if(response.ok){
          const data = await response.json();
          setPayslips(data.data);
        }

      } catch (error) {
        
      }
    }
    fetchApprovedPayslips();
  }, [])


  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Approved at</TableHead>
              <TableHead className="text-center text-white">Approved By (Finance)</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.length > 0 ? (
              payslips.map((record) => (
                <TableRow key={record.id} className="hover:bg-gray-100 cursor-pointer">
                  <TableCell className="text-center">{record.title}</TableCell>
                  <TableCell className="text-center">{new Date(record.period_start).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{new Date(record.period_end).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{new Date(record.approved_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{record.approved_by_name}</TableCell>
                  <TableCell className="text-center">
                    <button onClick={() => setSelectedPayslips(record)} className="text-black hover:text-gray-600 cursor-pointer">
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="p-4 text-center text-gray-500">
                  No approval requests available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  );
};
