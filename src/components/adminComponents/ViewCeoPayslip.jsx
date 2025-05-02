import React, { useState } from 'react';
import { Money, X } from "@phosphor-icons/react";
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import Pagination from './Pagination'; // Ensure correct path
import ConfirmationModal from './ConfirmationModal'; // Ensure correct path

export const ViewCeoPayslip = ({ selectedPayslips, onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(selectedPayslips.finance_record.length / itemsPerPage);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const currentRecords = selectedPayslips.finance_record.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    if (status === "Pending") return "text-yellow-400";
    if (status === "Paid") return "text-green-400"; 
    return "text-gray-400"; 
  };

  const handleActionClick = (record, type) => {
    setSelectedRecord(record);
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    // Implement logic to update record status (e.g., API call)
    console.log(`Confirmed action: ${actionType} for`, selectedRecord);
    setModalOpen(false);
  };

  return (
    <div>
      <Button variant='link' onClick={onBack} className='mb-6 text-[#4c735c]'>
        ← Back
      </Button>

      <Card className='p-6 w-full'>
        <CardHeader>
          <p className='text-sm font-medium text-gray-700/80'>
            {selectedPayslips?.approved_at || "No approval date available"}
          </p>
          <p className='text-lg font-semibold mb-2'>
            <span className='text-gray-700/60'>
              Title: {selectedPayslips?.title || "No title"}
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-[#4c735c] text-white hover:bg-[#4c735c]'>
                <TableHead className='text-center text-white'>Employee Name</TableHead>
                <TableHead className='text-center text-white'>Total Hours</TableHead>
                <TableHead className='text-center text-white'>Salary</TableHead>
                <TableHead className='text-center text-white'>Status</TableHead>
                <TableHead className='text-center text-white'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((record, index) => (
                <TableRow key={index} className='hover:bg-gray-100 cursor-pointer'>
                  <TableCell className='text-center'>{record.employee_name}</TableCell>
                  <TableCell className='text-center'>{record.total_hours}</TableCell>
                  <TableCell className='text-center'>₱{record.salary.toLocaleString()}</TableCell>
                  <TableCell className={`text-center ${getStatusColor(record?.status)}`}>
                    {record?.status || "No Status"}
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex justify-center gap-2'>
                      <button onClick={() => handleActionClick(record, "Paid")} className='border-2 border-green-400 p-1 rounded-full hover:bg-green-400 cursor-pointer'>
                        <Money className='text-green-400 hover:text-white' size={15} />
                      </button>
                      <button onClick={() => handleActionClick(record, "Rejected")} className='border-2 border-red-400 p-1 rounded-full hover:bg-red-400 cursor-pointer'>
                        <X className='text-red-400 hover:text-white' size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          setCurrentPage={setCurrentPage} 
        />
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={handleConfirm} 
        actionType={actionType} 
      />
    </div>
  );
};
