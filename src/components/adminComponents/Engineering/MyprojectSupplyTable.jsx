import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import PaginationComponent from "../Pagination";
import { Eye } from "@phosphor-icons/react";
import { MyProjectSupplyView } from './MyProjectSupplyView';

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
];

export const MyprojectSupplyTable = () => {
  const [supply, setSupply] = useState(initialProjectSupply);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalPages = Math.ceil(supply.length / itemsPerPage);

  const currentItems = supply.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleSaveChanges = (updatedItem) => {
    const updatedSupply = supply.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setSupply(updatedSupply);
  };

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date Bought</TableHead>
            <TableHead className="text-center">Item Name</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Unit</TableHead>
            <TableHead className="text-center">Last Date Updated</TableHead>
            <TableHead className="text-center">Actions</TableHead>
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
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <button onClick={() => handleOpenModal(item)}>
                    <Eye size={18} className="text-black hover:text-gray-600 cursor-pointer" />
                  </button>
                </div>
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

      {selectedItem && (
        <MyProjectSupplyView
          item={selectedItem}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};
