import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { Eye } from "@phosphor-icons/react";
import { FinanceBudgetSupplyRequestView } from "./FinanceBudgetSupplyRequestView";

export const FinanceBudgetSupplyRequestTable = () => {
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Fetch procurement-approved milestones
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/procurementApproved`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch milestones");
        return res.json();
      })
      .then((data) => {
        const transformedData = data.milestones.map((m) => {
          const totalQuote = m.approved_supplier?.items?.reduce(
            (sum, i) => sum + (parseFloat(i.total_cost) || 0),
            0
          );

          // ✅ Include BOQ total from backend if available
          const totalBoqBudget =
            m.boq_total ||
            m.boq_items?.reduce(
              (sum, i) => sum + (parseFloat(i.total_cost) || 0),
              0
            ) ||
            0;

          return {
            id: m.milestone_id,
            title: m.title,
            start_date: m.start_date
              ? new Date(m.start_date).toLocaleDateString()
              : "N/A",
            due_date: m.due_date
              ? new Date(m.due_date).toLocaleDateString()
              : "N/A",
            total_budget: totalQuote || 0,
            boq_total: totalBoqBudget, // ✅ Keep BOQ total
            boq_items: m.boq_items || [], // ✅ Include BOQ items
            status: m.status || "Pending",
            approved_supplier: m.approved_supplier, // keep supplier + items
          };
        });
        setMilestones(transformedData);
      })
      .catch((err) => console.error("Error loading milestones:", err));
  }, []);

  const handleViewRequest = (milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleCloseModal = () => {
    setSelectedMilestone(null);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
            <TableHead className="text-center text-white">Title</TableHead>
            <TableHead className="text-center text-white">Start Date</TableHead>
            <TableHead className="text-center text-white">End Date</TableHead>
            <TableHead className="text-center text-white">
              Supplier Quote
            </TableHead>
            <TableHead className="text-center text-white">
              BOQ Budget
            </TableHead>
            <TableHead className="text-center text-white">Supplier</TableHead>
            <TableHead className="text-center text-white">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {milestones.length === 0 && (
            <TableRow>
              <TableCell colSpan="7" className="text-center text-gray-600">
                No procurement-approved milestones found.
              </TableCell>
            </TableRow>
          )}

          {milestones.map((m) => {
            const diff = m.total_budget - m.boq_total;
            const isOverBudget = diff > 0;

            return (
              <TableRow key={m.id}>
                <TableCell className="text-center font-medium">
                  {m.title}
                </TableCell>
                <TableCell className="text-center">{m.start_date}</TableCell>
                <TableCell className="text-center">{m.due_date}</TableCell>
                <TableCell className="text-center">
                  ₱{m.total_budget.toLocaleString()}
                </TableCell>
                <TableCell
                  className={`text-center ${
                    isOverBudget ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₱{m.boq_total.toLocaleString()}
                </TableCell>
                <TableCell className="text-center text-gray-700">
                  {m.approved_supplier?.supplier_name || "—"}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleViewRequest(m)}
                    className="text-black hover:text-gray-600 cursor-pointer"
                  >
                    <Eye size={20} />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedMilestone && (
        <FinanceBudgetSupplyRequestView
          data={selectedMilestone}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
