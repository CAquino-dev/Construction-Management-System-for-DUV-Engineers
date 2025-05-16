import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye, PlusCircle } from "@phosphor-icons/react";
import { AddItemModal } from "./AddItemModal";

const initialInventoryRecords = [
  { id: 1, item: "Steel Deck 1m", category: "Steel", quantity_available: 100, quantity_reserved: 50, date_added: "2025-07-01", last_updated: "2025-07-15" },
  { id: 2, item: "Steel Deck 2m", category: "Steel", quantity_available: 200, quantity_reserved: 30, date_added: "2025-07-01", last_updated: "2025-07-15" },
  { id: 3, item: "Concrete Nail", category: "Nail", quantity_available: 500, quantity_reserved: 100, date_added: "2025-07-01", last_updated: "2025-07-15" },
];

export const InventoryTable = () => {
  const [inventoryRecords, setInventoryRecords] = useState(initialInventoryRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = (newItem) => {
    setInventoryRecords([
      ...inventoryRecords,
      { id: inventoryRecords.length + 1, ...newItem, date_added: new Date().toISOString().split("T")[0], last_updated: new Date().toISOString().split("T")[0] }
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      {/* Add Item Button */}
      <div className="mb-4 flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-blue-700">
          <PlusCircle size={20} /> Add Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white">
              <TableHead className="text-center text-white">Item</TableHead>
              <TableHead className="text-center text-white">Category</TableHead>
              <TableHead className="text-center text-white">Quantity Available</TableHead>
              <TableHead className="text-center text-white">Quantity Reserved</TableHead>
              <TableHead className="text-center text-white">Date Added</TableHead>
              <TableHead className="text-center text-white">Last Updated</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryRecords.map((record, index) => (
              <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <TableCell className="text-center">{record.item}</TableCell>
                <TableCell className="text-center">{record.category}</TableCell>
                <TableCell className="text-center">{record.quantity_available}</TableCell>
                <TableCell className="text-center">{record.quantity_reserved}</TableCell>
                <TableCell className="text-center">{record.date_added}</TableCell>
                <TableCell className="text-center">{record.last_updated}</TableCell>
                <TableCell className="text-center">
                  <button className="text-black hover:text-gray-600 cursor-pointer">
                    <Eye size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Item Modal */}
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddItem} />
    </div>
  );
};
