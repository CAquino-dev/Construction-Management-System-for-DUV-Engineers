import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { Eye } from "@phosphor-icons/react";
import PaginationComponent from "../Pagination";
import { MyProjectSupplyRequest } from './MyProjectSupplyRequest';
import { MyProjectViewPendingSupply } from './MyProjectViewPendingSupply';

export const MyProjectPendingSupplyTable = () => {
  const [pendingSupply, setPendingSupply] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    const fetchPendingExpenses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/project/expenses/pending-engineer`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPendingSupply(data.expenses);
      } catch (error) {
        console.error('Error loading pending expenses:', error);
      }
    };

    fetchPendingExpenses();
  }, []);

  const handleAddNewRequest = (newRequest) => {
    setPendingSupply(prevSupply => [
      ...prevSupply,
      { ...newRequest, id: prevSupply.length + 1 },
    ]);
    setIsModalOpen(false);
  };

  const handleCancelRequest = () => {
    setIsModalOpen(false);
  };

  const handleViewRequest = (data) => {
    setViewData(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewData(null);
  };

  const totalPages = Math.ceil(pendingSupply.length / itemsPerPage);
  const currentItems = pendingSupply.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="mt-4">
      {/* <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          Request
        </button>
      </div>

      {isModalOpen && !viewData && (
        <MyProjectSupplyRequest
          closeModal={handleCloseModal}
          handleAddNewRequest={handleAddNewRequest}
        />
      )} */}

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
            <TableHead className="text-center">Description</TableHead>
            <TableHead className="text-center">Budget Needed</TableHead>
            <TableHead className="text-center">Date Needed</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.expense_id || item.id}>
              <TableCell className="text-center">{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-center">{item.description}</TableCell>
              <TableCell className="text-center">₱{item.amount}</TableCell>
              <TableCell className="text-center">{item.date_needed ? new Date(item.date_needed).toLocaleDateString() : 'N/A'}</TableCell>
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
