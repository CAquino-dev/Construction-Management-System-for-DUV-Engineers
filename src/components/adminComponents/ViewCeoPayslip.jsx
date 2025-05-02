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
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Ensure that selectedPayslips is an array */}
              {Array.isArray(selectedPayslips.items) && selectedPayslips.items.length > 0 ? (
                selectedPayslips.items.map((record, index) => (
                  <TableRow key={index} className='hover:bg-gray-100 cursor-pointer'>
                    <TableCell className='text-center'>{record.employee_name}</TableCell>
                    <TableCell className='text-center'>{record.total_hours}</TableCell>
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
    </div>
  );
};
 