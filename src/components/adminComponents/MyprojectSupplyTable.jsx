import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import PaginationComponent from "./Pagination"; // Assuming you've already created the Pagination component

const initialProjectSupply = [
  {
    id: 1,
    date_buy: "2023-09-01",
    item_name: "Concrete Nails",
    quantity: 100,
    unit: "pcs",
    date_update: "---"
  },
  {
    id: 2,
    date_buy: "2023-09-02",
    item_name: "Cement",
    quantity: 50,
    unit: "bags",
    date_update: "---",
  },
  // Add more items as necessary
];

export const MyprojectSupplyTable = () => {
  const [supply, setSupply] = useState(initialProjectSupply); // State to store supply data
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [itemsPerPage] = useState(5); // Number of items per page

  // Calculate the total number of pages
  const totalPages = Math.ceil(supply.length / itemsPerPage);

  // Get the current items for the current page
  const currentItems = supply.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date Bought</TableHead>
            <TableHead className="text-center">Item Name</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Unit</TableHead>
            <TableHead className="text-center">Date Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{item.date_buy}</TableCell>
              <TableCell className="text-center">{item.item_name}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-center">{item.unit}</TableCell>
              <TableCell className="text-center">{item.date_update}</TableCell>
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
