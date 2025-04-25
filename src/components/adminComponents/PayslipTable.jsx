import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from "@phosphor-icons/react";
import { PayslipModal } from "./PayslipModal";
import PaginationComponent from "./Pagination";

export const PayslipTable = () => {
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [payslips, setPayslips] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPayslips, setFilteredPayslips] = useState([]);

  const openModal = (record) => {
    setSelectedPayslip(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPayslip(null);
    setIsModalOpen(false);
  };

  // Fetch payslips from API
  useEffect(() => {
    const getPayslips = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hr/getPayslips');
        const data = await response.json();
        if (response.ok) {
          const filtered = data.map((record) => ({
            id: record.id,
            title: record.title,
            start: record.period_start ? new Date(record.period_start).toLocaleDateString('en-CA') : '-',
            end: record.period_end ? new Date(record.period_end).toLocaleDateString('en-CA') : '-',
            created_at: record.created_at ? new Date(record.created_at).toLocaleDateString('en-CA') : '-',
            created_by: record.created_by_name,
          }));
          setPayslips(filtered);
          setFilteredPayslips(filtered); // Set filtered payslips initially
        }
      } catch (error) {
        console.error('Error fetching payslips:', error);
      }
    };

    getPayslips();
  }, []);

  // Pagination Logic
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPayslips.length / itemsPerPage));
  const currentData = filteredPayslips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = payslips.filter(payslip =>
      payslip.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredPayslips(filtered);
    setCurrentPage(1); // Reset to page 1 after search
  };

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Payslip..."
          className="w-full sm:w-80 p-2 border rounded-md"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Payslip Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">Start</TableHead>
              <TableHead className="text-center text-white">End</TableHead>
              <TableHead className="text-center text-white">Created at</TableHead>
              <TableHead className="text-center text-white">Created by</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((record, index) => (
                <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center p-2">{record.title}</TableCell>
                  <TableCell className="text-center p-2">{record.start}</TableCell>
                  <TableCell className="text-center p-2">{record.end}</TableCell>
                  <TableCell className="text-center p-2">{record.created_at}</TableCell>
                  <TableCell className="text-center p-2">{record.created_by}</TableCell>
                  <TableCell className="text-center p-2">
                    <button onClick={() => openModal(record)} className="text-black hover:text-gray-600 cursor-pointer bg-gray-200 p-1 rounded-md">
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4 text-gray-500">No matching payslips found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationComponent 
        currentPage={currentPage} 
        totalPages={totalPages} 
        setCurrentPage={setCurrentPage} 
      />

      {/* Payslip Modal */}
      {isModalOpen && <PayslipModal payslip={selectedPayslip} closeModal={closeModal} />}
    </div>
  );
};