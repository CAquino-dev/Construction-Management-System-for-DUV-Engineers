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

  // Fetch PM-approved milestones on mount
  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/milestones/pm-approved`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch milestones");
        return res.json();
      })
      .then((data) => {
        // Transform the raw backend response into a clean format
        const transformedData = data.milestones.map((m) => {
          const totalBudget = m.boq_items?.reduce(
            (sum, bi) => sum + (parseFloat(bi.total_cost) || 0),
            0
          );
    
          return {
            id: m.id,
            title: m.title,
            start_date: new Date(m.start_date).toLocaleDateString() || "N/A",
            due_date: new Date(m.due_date).toLocaleDateString() || "N/A",
            total_budget: totalBudget,
            status: m.finance_approval_status || "Pending",
            remarks: m.finance_remarks || "",
            approved_by: m.finance_approved_by || null,
            boq_items: m.boq_items || [], // keep raw for modal use
          };
        });

        setMilestones(transformedData);
      })
      .catch((err) => {
        console.error("Error loading milestones:", err);
      });
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
            <TableHead className="text-center text-white">Total Budget</TableHead>
            <TableHead className="text-center text-white">Finance Status</TableHead>
            <TableHead className="text-center text-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.length === 0 && (
            <TableRow>
              <TableCell colSpan="6" className="text-center text-gray-600">
                No milestones pending finance review.
              </TableCell>
            </TableRow>
          )}
          {milestones.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="text-center">{m.title}</TableCell>
              <TableCell className="text-center">{m.start_date}</TableCell>
              <TableCell className="text-center">{m.due_date}</TableCell>
              <TableCell className="text-center">₱{m.total_budget.toLocaleString()}</TableCell>
              <TableCell className="text-center">
                <span
                  className={`px-2 py-1 rounded-full text-white ${
                    m.status === "Pending"
                      ? "bg-yellow-500"
                      : m.status === "Approved"
                      ? "bg-green-600"
                      : "bg-red-500"
                  }`}
                >
                  {m.status}
                </span>
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
          ))}
        </TableBody>
      </Table>

      {/* Modal for Finance action */}
      {selectedMilestone && (
        <FinanceBudgetSupplyRequestView
          data={selectedMilestone}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
