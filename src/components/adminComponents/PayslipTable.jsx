import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const payslipRecords = [
  { id: 1, employee_id: "M02489", fullname: "Ajay Lumari", basic_salary: 50000, deductions: 5000, net_salary: 45000 },
  { id: 2, employee_id: "M02490", fullname: "Robert Young", basic_salary: 55000, deductions: 5500, net_salary: 49500 },
  { id: 3, employee_id: "M02509", fullname: "Elia Romero", basic_salary: 60000, deductions: 6000, net_salary: 54000 },
  { id: 4, employee_id: "M02510", fullname: "Liam Smith", basic_salary: 65000, deductions: 6500, net_salary: 58500 },
];

export const PayslipTable = () => {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Employee ID</TableHead>
              <TableHead className="text-center text-white">Fullname</TableHead>
              <TableHead className="text-center text-white">Basic Salary</TableHead>
              <TableHead className="text-center text-white">Deductions</TableHead>
              <TableHead className="text-center text-white">Net Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslipRecords.map((record, index) => (
              <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <TableCell className="text-center p-2">{record.employee_id}</TableCell>
                <TableCell className="text-center p-2">{record.fullname}</TableCell>
                <TableCell className="text-center p-2">₱{record.basic_salary.toLocaleString()}</TableCell>
                <TableCell className="text-center p-2">₱{record.deductions.toLocaleString()}</TableCell>
                <TableCell className="text-center p-2 font-semibold text-green-700">
                  ₱{record.net_salary.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
