import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import Pagination from './Pagination'; // Ensure correct path

export const ViewCeoPayslip = ({ selectedPayslips, onBack }) => {
  console.log('selected payslip:', selectedPayslips.items);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(selectedPayslips?.length / itemsPerPage); // Check for length of selectedPayslips directly

  const getStatusColor = (status) => {
    if (status === "Pending") return "text-yellow-400";
    if (status === "Approved by Finance") return "text-green-400";
    return "text-gray-400";
  };

  return (
    <div>
      <Button variant='link' onClick={onBack} className='mb-6 text-[#4c735c]'>
        ← Back
      </Button>

      <Card className='p-6 w-full'>
        <CardHeader>
          <p className='text-sm font-medium text-gray-700/80'>
            {new Date(selectedPayslips?.approved_at).toLocaleDateString() || "No approval date available"}
          </p>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg text-gray-500">Title:</h2>
            <p className="font-bold">{selectedPayslips?.title || "No title"}</p>
          </div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg text-gray-500">Period:</h2>
            <p className="font-bold">{selectedPayslips?.period_start} <span className="text-gray-500">to</span> {selectedPayslips?.period_end}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-[#4c735c] text-white hover:bg-[#4c735c]'>
                <TableHead className='text-center text-white'>Employee Name</TableHead>
                <TableHead className='text-center text-white'>Total Hours</TableHead>
                <TableHead className='text-center text-white'>Salary</TableHead>
                <TableHead className='text-center text-white'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Ensure that selectedPayslips is an array */}
              {Array.isArray(selectedPayslips.items) && selectedPayslips.items.length > 0 ? (
                selectedPayslips.items.map((record, index) => (
                  <TableRow key={index} className='hover:bg-gray-100 cursor-pointer'>
                    <TableCell className='text-center'>{record.employee_name}</TableCell>
                    <TableCell className='text-center'>{record.total_hours_worked}</TableCell>
                    <TableCell className='text-center'>₱{record.calculated_salary}</TableCell>
                    <TableCell className={`text-center ${getStatusColor(record?.status)}`}>
                      {record?.status || "No Status"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4" className="text-center p-4 text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </Card>

      {/* Accept and Reject Buttons */}
      <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
          >
            Accept
          </button>
          <button
            className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
          >
            Reject
          </button>
        </div>
    </div>
  );
};
 