import React, { useState, useEffect } from "react";
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

export const FinanceBudgetSupplyRequestTable = () => {
  const [pendingSupply, setPendingSupply] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch approved expenses by engineers on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/project/expenses/approved-by-engineer`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        // Transform data if needed to match your UI structure
        // Example assumes data.expenses is an array of expense objects
        const transformedData = data.expenses.map((expense) => ({
          id: expense.expense_id,
          date: expense.date || expense.date_from || "N/A",
          title: expense.description,
          total_budget: expense.amount,
          date_needed: expense.due_date || "N/A", // or any appropriate date field
          status: expense.engineer_approval_status || "Approved",
          // Optionally add items array if your UI expects it, else omit or transform accordingly
          items: [], // You may want to fetch or compute items elsewhere if needed
        }));

        setPendingSupply(transformedData);
      })
      .catch((err) => {
        console.error("Error loading expenses:", err);
      });
  }, []);

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
          {pendingSupply.length === 0 && (
            <TableRow>
              <TableCell colSpan="6" className="text-center text-gray-600">
                No approved expenses found.
              </TableCell>
            </TableRow>
          )}
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
                  {supply.status === "Approved" ? "Approved by Engineer" : supply.status}
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
        <FinanceBudgetSupplyRequestView data={selectedRequest} onClose={handleCloseModal} />
      )}
    </div>
  );
};
