import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Eye } from "@phosphor-icons/react";
import { FinanceBudgetSupplyRequestView } from "./FinanceBudgetSupplyRequestView";

const initialPendingSupply = [
  {
    id: 1,
    date: "2023-09-01",
    title: "For Tiling",
    description: "Description A",
    items: [
      { id: 1, item_name: "Concrete Nails", quantity: 100, unit_price: 10, total_price: 1000 },
      { id: 2, item_name: "Cement", quantity: 50, unit_price: 100, total_price: 5000 },
    ],
    total_budget: 10000,
    date_needed: "2023-09-05",
    status: "Pending",
  },
  {
    id: 2,
    date: "2023-09-02",
    title: "For Tiling",
    description: "Description A",
    items: [
      { id: 3, item_name: "Concrete Nails", quantity: 100, unit_price: 10, total_price: 1000 },
      { id: 4, item_name: "Cement", quantity: 50, unit_price: 100, total_price: 5000 },
    ],
    total_budget: 20000,
    date_needed: "2023-09-05",
    status: "Pending",
  },
  {
    id: 3,
    date: "2023-09-03",
    title: "For Flooring",
    description: "Description B",
    items: [
      { id: 5, item_name: "Floor Tiles", quantity: 200, unit_price: 75, total_price: 15000 },
    ],
    total_budget: 15000,
    date_needed: "2023-09-10",
    status: "Approved",
  },
];

export const FinanceBudgetSupplyRequestTable = () => {
  const [pendingSupply, setPendingSupply] = useState(initialPendingSupply);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleViewRequest = (supply) => {
    setSelectedRequest(supply);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
            <TableHead className="text-center text-white">Date</TableHead>
            <TableHead className="text-center text-white">Title</TableHead>
            <TableHead className="text-center text-white">Total Budget</TableHead>
            <TableHead className="text-center text-white">Date Needed</TableHead>
            <TableHead className="text-center text-white">Status</TableHead>
            <TableHead className="text-center text-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingSupply.map((supply) => (
            <TableRow key={supply.id}>
              <TableCell className="text-center">{supply.date}</TableCell>
              <TableCell className="text-center">{supply.title}</TableCell>
              <TableCell className="text-center">₱{supply.total_budget}</TableCell>
              <TableCell className="text-center">{supply.date_needed}</TableCell>
              <TableCell className="text-center">
                <span
                  className={`px-2 py-1 rounded-full text-white ${
                    supply.status === "Pending"
                      ? "bg-yellow-500"
                      : supply.status === "Approved"
                      ? "bg-green-600"
                      : "bg-gray-400"
                  }`}
                >
                  {supply.status}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => handleViewRequest(supply)}
                  className="text-black hover:text-gray-600 cursor-pointer"
                >
                  <Eye size={20} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Render modal if selectedRequest is set */}
      {selectedRequest && (
        <FinanceBudgetSupplyRequestView
          data={selectedRequest}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
