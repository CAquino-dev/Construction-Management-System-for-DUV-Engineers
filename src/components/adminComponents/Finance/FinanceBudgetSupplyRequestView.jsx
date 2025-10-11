import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { X } from "@phosphor-icons/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const FinanceBudgetSupplyRequestView = ({ data, onClose }) => {
  const userId = localStorage.getItem("userId");

  console.log('finance data', data.id);

  const updateFinanceApproval = async (newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/${data.id}/finance-approval`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            financeId: userId,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update finance approval");
        return false;
      }

      alert(`Request ${newStatus.toLowerCase()} successfully!`);
      return true;
    } catch (error) {
      alert("Network error: " + error.message);
      return false;
    }
  };

  const handleApprove = async () => {
    const success = await updateFinanceApproval("Finance Approved");
    if (success) onClose();
  };

  const handleReject = async () => {
    const success = await updateFinanceApproval("Finance Rejected");
    if (success) onClose();
  };

  // ✅ Extract supplier and BOQ data safely
  const supplier = data.approved_supplier || {};
  const materials = supplier.items || [];
  const boqItems = data.boq_items || [];

  // ✅ Convert numeric strings to numbers properly
  const totalCost = materials.reduce(
    (sum, item) => sum + (parseFloat(item.total_cost) || 0),
    0
  );

  const boqTotal = boqItems.reduce(
    (sum, item) => sum + (parseFloat(item.total_cost) || 0),
    0
  );

  const chartData = materials.map((item) => ({
    name: item.material_name,
    value: parseFloat(item.total_cost) || 0,
  }));

  const COLORS = [
    "#4CAF50",
    "#FF9800",
    "#2196F3",
    "#9C27B0",
    "#F44336",
    "#00BCD4",
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[1100px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            Finance Review: {data.title || "Untitled Milestone"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        {/* Details */}
        <div className="mb-4 space-y-1">
          <p>
            <strong>Supplier:</strong> {supplier.supplier_name || "N/A"}
          </p>
          <p>
            <strong>Milestone ID:</strong> {data.milestone_id}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {data.due_date
              ? new Date(data.due_date).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`font-semibold ${
                data.status === "Pending"
                  ? "text-yellow-600"
                  : data.status === "Finance Approved"
                  ? "text-green-600"
                  : data.status === "Finance Rejected"
                  ? "text-red-600"
                  : ""
              }`}
            >
              {data.status || "Pending"}
            </span>
          </p>
        </div>

        {/* BOQ Summary */}
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            💰 BOQ vs Supplier Comparison
          </h3>
          <p>
            <strong>BOQ Budget:</strong>{" "}
            ₱{boqTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Supplier Total Quote:</strong>{" "}
            ₱{totalCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Difference:</strong>{" "}
            ₱{(boqTotal - totalCost).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {boqTotal - totalCost > 0 ? "(Under budget)" : "(Over budget)"}
          </p>
        </div>

        {/* Materials Table */}
        <h3 className="text-md font-semibold mt-4 mb-2">
          Approved Supplier Items
        </h3>
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.material_name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  ₱{parseFloat(item.unit_price).toLocaleString()}
                </TableCell>
                <TableCell>
                  ₱{parseFloat(item.total_cost).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-100 font-semibold">
              <TableCell colSpan={4} className="text-right">
                Total:
              </TableCell>
              <TableCell>₱{totalCost.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="flex justify-center">
            <BarChart width={400} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};
