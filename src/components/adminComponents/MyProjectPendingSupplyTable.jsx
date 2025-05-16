import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from "@phosphor-icons/react";
import PaginationComponent from "./Pagination";
import { MyProjectSupplyRequest } from './MyProjectSupplyRequest'; // Importing the request modal
import { MyProjectViewPendingSupply } from './MyProjectViewPendingSupply';

const initialPendingSupply = [
  {
    id: 1,
    date: "2023-09-01",
    title: "For Tiling",  
    items: [
      { itemName: "Concrete Nails", qty: 100, unit: "pcs", amount: 1000 },  
      { itemName: "Cement", qty: 50, unit: "bags", amount: 5000 },  
    ],
    total_budget: 10000,
    date_needed: "2023-09-05",
    status: "Pending",
  },
  {
    id: 2,
    date: "2023-09-02",
    title: "For Tiling", 
    items: [
      { itemName: "Concrete Nails", qty: 100, unit: "pcs", amount: 1000 },  
      { itemName: "Cement", qty: 50, unit: "bags", amount: 5000 },  
    ],
    total_budget: 20000,
    date_needed: "2023-09-05",
    status: "Pending",
  },
  // More items can be added here
];

export const MyProjectPendingSupplyTable = () => {
  const [pendingSupply, setPendingSupply] = useState(initialPendingSupply);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null); // Store data for the selected item

  const handleAddNewRequest = (newRequest) => {
    setPendingSupply(prevSupply => [
      ...prevSupply,
      { ...newRequest, id: prevSupply.length + 1 },
    ]);
    setIsModalOpen(false); // Close the modal after adding a new request
  };

  const handleCancelRequest = () => {
    setIsModalOpen(false); // Close the modal if the request is canceled
  };

  const handleViewRequest = (data) => {
    setViewData(data);
    setIsModalOpen(true); // Open the modal with the selected data
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal when "Close" or "Cancel" is clicked
    setViewData(null); // Clear the data when closing the modal
  };

  const totalPages = Math.ceil(pendingSupply.length / itemsPerPage);
  const currentItems = pendingSupply.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="mt-4">
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          Request
        </button>
      </div>

      {/* Modal for adding new supply request */}
      {isModalOpen && !viewData && (
        <MyProjectSupplyRequest
          closeModal={handleCloseModal}
          handleAddNewRequest={handleAddNewRequest}
        />
      )}

      {/* Modal for viewing the pending supply details */}
      {viewData && (
        <MyProjectViewPendingSupply
          data={viewData}
          closeModal={handleCloseModal}
          handleCancelRequest={handleCancelRequest}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Title</TableHead>  {/* Changed Title to Item Name */}
            <TableHead className="text-center">Budget Needed</TableHead>
            <TableHead className="text-center">Date Needed</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{item.date}</TableCell>
              <TableCell className="text-center">{item.title}</TableCell> {/* Changed to itemName */}
              <TableCell className="text-center">{item.total_budget}</TableCell>
              <TableCell className="text-center">{item.date_needed}</TableCell>
              <TableCell className="text-center text-yellow-600">{item.status}</TableCell>
              <TableCell className="text-center">
                <button onClick={() => handleViewRequest(item)} className="bg-[#4c735c] text-white p-1 rounded-md">
                  <Eye size={15} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
