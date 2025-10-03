import React, { useState } from "react";
import { X } from "@phosphor-icons/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export const MyProjectViewMilestone = ({ milestone, onClose }) => {
  const [items, setItems] = useState(milestone.boq_items || []);
  const [selectedBoq, setSelectedBoq] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const permissions = JSON.parse(localStorage.getItem("permissions"));
  const canModifyMto = permissions?.can_modify_mto === "Y";

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // --- Calculations ---
  const calculateMtoTotals = (mtoItems = []) =>
    mtoItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const unit = parseFloat(item.unit_cost) || 0;
      return sum + qty * unit;
    }, 0);

  const comparisonData = items.map((boq) => {
    const boqBudget = parseFloat(boq.quantity) * parseFloat(boq.unit_cost);
    const mtoTotal = calculateMtoTotals(boq.mto_items);
    return {
      name: boq.description,
      BOQ: boqBudget,
      MTO: mtoTotal,
    };
  });

  // --- Handle MTO updates ---
  const handleMtoChange = (index, field, value) => {
    const updatedItems = [...selectedBoq.mto_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setSelectedBoq({ ...selectedBoq, mto_items: updatedItems });
  };

  const addMtoItem = () => {
    const newItem = { description: "", unit: "", quantity: 0, unit_cost: 0 };
    setSelectedBoq({
      ...selectedBoq,
      mto_items: [...(selectedBoq.mto_items || []), newItem],
    });
  };

  const updateMto = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/milestones/mto`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestone_boq_id: selectedBoq.milestone_boq_id,
            mto_items: selectedBoq.mto_items,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update MTO");

      // ✅ update the items state so UI refreshes with new data
      setItems((prev) =>
        prev.map((item) =>
          item.milestone_boq_id === selectedBoq.milestone_boq_id
            ? { ...item, mto_items: selectedBoq.mto_items }
            : item
        )
      );

      // close modal
      setSelectedBoq(null);
      toast.success("MTO updated successfully!");
    } catch (error) {
      console.error("Update MTO failed:", error);
      toast.error("Error: " + error.message);
    }
  };

  // --- Update Milestone Status ---
  const updateMilestoneStatus = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/engr/milestones/update-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestone_id: milestone.id,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update status");

      toast.success(`Milestone marked as ${newStatus}`);
    } catch (error) {
      console.error("Update status failed:", error);
      toast.error("Error: " + error.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-[900px] h-auto sm:h-[90%] overflow-y-auto flex flex-col relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-500 cursor-pointer"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Milestone Info */}
        <h2 className="text-xl font-semibold mb-4">Milestone Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          Created on: {formatDate(milestone.timestamp)}
        </p>
        <p className="text-xl font-bold mb-1">{milestone.title}</p>
        <p className="text-md mb-4 whitespace-pre-line">{milestone.details}</p>

        {/* Dates & Status */}
        <div className="mb-4 space-y-1">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className="capitalize">{milestone.status || "N/A"}</span>
          </p>
          <p>
            <span className="font-semibold">Due Date:</span>{" "}
            {formatDate(milestone.due_date)}
          </p>
          <p>
            <span className="font-semibold">Start Date:</span>{" "}
            {formatDate(milestone.start_date)}
          </p>
        </div>

        {/* PM Approval Buttons */}
        {permissions.can_update_milestone === "Y" && (
          <div className="flex gap-3 mb-6">
            <button
              disabled={statusUpdating}
              onClick={() => updateMilestoneStatus("PM Approved")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              PM Approve
            </button>
            <button
              disabled={statusUpdating}
              onClick={() => updateMilestoneStatus("PM Rejected")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              PM Reject
            </button>
          </div>
        )}

        {/* --- Data Analysis Section --- */}
        {comparisonData.length > 0 && (
          <div className="my-6">
            <h3 className="text-lg font-semibold mb-2">BOQ vs MTO Analysis</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="BOQ" fill="#4c6ef5" />
                  <Bar dataKey="MTO" fill="#f59f00" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* BOQ Items */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Bill of Quantities</h3>
          {items.length > 0 ? (
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-1 text-left">Description</th>
                  <th className="border px-3 py-1 text-left">Unit</th>
                  <th className="border px-3 py-1 text-right">Quantity</th>
                  <th className="border px-3 py-1 text-right">Unit Cost</th>
                  <th className="border px-3 py-1 text-right">Total Cost</th>
                  <th className="border px-3 py-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-3 py-1">{item.description}</td>
                    <td className="border px-3 py-1">{item.unit}</td>
                    <td className="border px-3 py-1 text-right">
                      {item.quantity}
                    </td>
                    <td className="border px-3 py-1 text-right">
                      {item.unit_cost}
                    </td>
                    <td className="border px-3 py-1 text-right">
                      {item.total_cost || 0}
                    </td>
                    <td className="border px-3 py-1 text-center">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => setSelectedBoq(item)}
                      >
                        View MTO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-600">No milestone items found.</p>
          )}
        </div>

        {/* MTO Modal */}
        {selectedBoq && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[700px] relative">
              <button
                onClick={() => setSelectedBoq(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              >
                <X size={24} />
              </button>

              <h3 className="text-lg font-semibold mb-2">
                MTO for: {selectedBoq.description}
              </h3>

              <table className="min-w-full border border-gray-300 mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-1 text-left">Material</th>
                    <th className="border px-3 py-1 text-left">Unit</th>
                    <th className="border px-3 py-1 text-right">Quantity</th>
                    <th className="border px-3 py-1 text-right">Unit Cost</th>
                    <th className="border px-3 py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBoq.mto_items?.length > 0 ? (
                    selectedBoq.mto_items.map((mto, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border px-3 py-1">
                          {canModifyMto ? (
                            <input
                              className="w-full border px-1 py-0.5 text-sm"
                              value={mto.description}
                              onChange={(e) =>
                                handleMtoChange(
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            mto.description
                          )}
                        </td>
                        <td className="border px-3 py-1">
                          {canModifyMto ? (
                            <input
                              className="w-full border px-1 py-0.5 text-sm"
                              value={mto.unit}
                              onChange={(e) =>
                                handleMtoChange(idx, "unit", e.target.value)
                              }
                            />
                          ) : (
                            mto.unit
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right">
                          {canModifyMto ? (
                            <input
                              type="number"
                              className="w-20 border px-1 py-0.5 text-sm text-right"
                              value={mto.quantity}
                              onChange={(e) =>
                                handleMtoChange(idx, "quantity", e.target.value)
                              }
                            />
                          ) : (
                            mto.quantity
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right">
                          {canModifyMto ? (
                            <input
                              type="number"
                              className="w-20 border px-1 py-0.5 text-sm text-right"
                              value={mto.unit_cost}
                              onChange={(e) =>
                                handleMtoChange(
                                  idx,
                                  "unit_cost",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            mto.unit_cost
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right">
                          {(mto.quantity * mto.unit_cost).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-3 text-gray-500"
                      >
                        No MTO items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {canModifyMto && (
                <button
                  onClick={addMtoItem}
                  className="mb-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  + Add MTO Item
                </button>
              )}

              {/* Totals + Pie Chart */}
              <div className="mt-2 p-3 rounded border bg-gray-50 flex flex-col sm:flex-row items-center gap-6">
                <div>
                  <p>
                    <span className="font-semibold">BOQ Budget:</span> ₱
                    {(selectedBoq.quantity * selectedBoq.unit_cost).toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold">Total MTO:</span> ₱
                    {calculateMtoTotals(selectedBoq.mto_items).toFixed(2)}
                  </p>
                  <p className="mt-1">
                    {calculateMtoTotals(selectedBoq.mto_items) <=
                    selectedBoq.quantity * selectedBoq.unit_cost ? (
                      <span className="text-green-600 font-semibold">
                        ✅ Within Budget
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ⚠️ Over Budget
                      </span>
                    )}
                  </p>
                </div>

                {/* Pie Chart */}
                <div>
                  <PieChart width={180} height={180}>
                    <Pie
                      data={[
                        {
                          name: "Used",
                          value: calculateMtoTotals(selectedBoq.mto_items),
                        },
                        {
                          name: "Remaining",
                          value: Math.max(
                            selectedBoq.quantity * selectedBoq.unit_cost -
                              calculateMtoTotals(selectedBoq.mto_items),
                            0
                          ),
                        },
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <p className="text-center text-sm font-semibold mt-2">
                    Budget Usage
                  </p>
                </div>
              </div>

              {/* Confirm */}
              {canModifyMto === true && (
                <button
                  onClick={updateMto}
                  disabled={
                    calculateMtoTotals(selectedBoq.mto_items) >
                    selectedBoq.quantity * selectedBoq.unit_cost
                  }
                  className="mt-4 px-4 py-2 bg-[#4c735c] text-white rounded-md hover:bg-[#3a5b47] disabled:opacity-50"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
