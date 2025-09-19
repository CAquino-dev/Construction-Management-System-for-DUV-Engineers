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
  // API call to update finance approval status
  console.log(data);

  const userId = localStorage.getItem('userId');
  const updateFinanceApproval = async (newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/${data.id}/finance-approval`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: newStatus,
            financeId: userId
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

  // 🔹 Prepare chart data (convert costs to numbers!)
  const boqTotal =
    data.boq_items?.reduce(
      (sum, b) => sum + (parseFloat(b.total_cost) || 0),
      0
    ) || 0;

  const mtoTotal =
    data.boq_items?.reduce(
      (sum, b) =>
        sum +
        (b.mto_items?.reduce(
          (mtoSum, m) => mtoSum + (parseFloat(m.total_cost) || 0),
          0
        ) || 0),
      0
    ) || 0;

  const comparisonData = [
    { name: "BOQ", value: boqTotal },
    { name: "MTO", value: mtoTotal },
  ];

  const COLORS = ["#4CAF50", "#FF9800"];

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[1100px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Finance Review: {data.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        {/* Details */}
        <div className="mb-4 space-y-2">
          <p>Date: {data.date}</p>
          <p>Due: {data.date_needed}</p>
          <p>
            Status:{" "}
            <strong
              className={
                data.status === "Pending"
                  ? "text-yellow-600"
                  : data.status === "Approved"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {data.status}
            </strong>
          </p>
        </div>

        {/* BOQ Table */}
        <h3 className="text-md font-semibold mt-4">BOQ Items</h3>
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead>Item No</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.boq_items?.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.item_no}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>₱{parseFloat(item.total_cost).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* MTO Table */}
        <h3 className="text-md font-semibold mt-4">MTO Breakdown</h3>
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.boq_items?.flatMap((boq, idx) =>
              boq.mto_items?.map((mto, mIdx) => (
                <TableRow key={`${idx}-${mIdx}`}>
                  <TableCell>{mto.description}</TableCell>
                  <TableCell>{mto.quantity}</TableCell>
                  <TableCell>{mto.unit}</TableCell>
                  <TableCell>₱{parseFloat(mto.total_cost).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 my-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={comparisonData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {comparisonData.map((entry, index) => (
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

          {/* Bar Chart */}
          <div className="flex justify-center">
            <BarChart width={400} height={300} data={comparisonData}>
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
