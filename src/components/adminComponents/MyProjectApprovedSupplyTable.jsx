import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from "@phosphor-icons/react";
import PaginationComponent from "./Pagination"; // Assuming you've saved the Pagination component with your code

const initialApprovedSupply = [
  {
    id: 1,
    date: "2023-09-01",
    title: "For Tiling",
    items: [
      {
        title: "Concrete Nails",
        qty: 100, // Quantity of the item
        unit: "pcs", // Unit of the item
        amount: 1000, // Amount for this item
      },
      {
        title: "Cement",
        qty: 50,
        unit: "bags",
        amount: 5000,
      },
    ],
    total_budget: 10000,
    date_needed: "2023-09-05",
    status: "Approved",
    date_approved: "2023-09-03",
  },
  {
    id: 2,
    date: "2023-09-02",
    title: "For Tiling",
    items: [
      {
        title: "Concrete Nails",
        qty: 100,
        unit: "pcs",
        amount: 1000,
      },
      {
        title: "Cement",
        qty: 50,
        unit: "bags",
        amount: 5000,
      },
    ],
    total_budget: 10000,
    date_needed: "2023-09-05",
    status: "Approved",
    date_approved: "2023-09-03",
  },
];

export const MyProjectApprovedSupplyTable = () => {
  const [approvedSupply, setApprovedSupply] = useState(initialApprovedSupply); // State to store approved supply data
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [itemsPerPage] = useState(5); // Number of items per page

  // Calculate the total number of pages
  const totalPages = Math.ceil(approvedSupply.length / itemsPerPage);

  // Get the current items for the current page
  const currentItems = approvedSupply.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Title</TableHead>
            <TableHead className="text-center">Total Budget</TableHead>
            <TableHead className="text-center">Date Needed</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Date Approved</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{item.date}</TableCell>
              <TableCell className="text-center">{item.title}</TableCell>
              <TableCell className="text-center">₱{item.total_budget}</TableCell>
              <TableCell className="text-center">{item.date_needed}</TableCell>
              <TableCell className="text-center text-green-600">{item.status}</TableCell>
              <TableCell className="text-center">{item.date_approved}</TableCell>
              <TableCell className="text-center">
                <button className="bg-[#4c735c] text-white p-1 rounded-md">
                  <Eye size={15} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination component */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
