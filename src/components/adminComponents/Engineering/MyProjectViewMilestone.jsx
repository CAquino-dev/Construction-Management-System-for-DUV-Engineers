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
  const [selectedLabor, setSelectedLabor] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const permissions = JSON.parse(localStorage.getItem("permissions"));
  const canModifyMto = permissions?.can_modify_mto === "Y";

  // Check if milestone is editable
  const isEditable = () => {
    // Can edit if:
    // 1. Status is "For Review" or "Finance Rejected" with rejection stage "budget"
    // 2. User has permission to modify MTO
    if (!canModifyMto) return false;
    
    const editableStatuses = ["For Review", "Finance Rejected"];
    return editableStatuses.includes(milestone.status) || 
           (milestone.status === "Finance Rejected" && milestone.finance_rejection_stage === "budget");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const calculateMtoTotals = (mtoItems = []) =>
    mtoItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const unit = parseFloat(item.unit_cost) || 0;
      return sum + qty * unit;
    }, 0);

  // Get labor total from lto object
  const calculateLaborTotals = (lto) => {
    if (!lto || lto === null) return 0;
    return parseFloat(lto.total_cost) || 0;
  };

  // Get equipment total from eto items array
  const calculateEquipmentTotals = (etoItems = []) => {
    if (!etoItems || !Array.isArray(etoItems)) return 0;
    return etoItems.reduce((sum, item) => {
      return sum + (parseFloat(item.total_cost) || 0);
    }, 0);
  };

  // Calculate combined total for all three categories
  const calculateCombinedTotal = (boqItem) => {
    const mtoTotal = calculateMtoTotals(boqItem.mto_items);
    const laborTotal = calculateLaborTotals(boqItem.lto);
    const equipmentTotal = calculateEquipmentTotals(boqItem.eto_items);
    return mtoTotal + laborTotal + equipmentTotal;
  };

  // Calculate remaining budget
  const calculateRemainingBudget = (boqItem) => {
    const boqBudget = parseFloat(boqItem.quantity) * parseFloat(boqItem.unit_cost);
    const combinedTotal = calculateCombinedTotal(boqItem);
    return Math.max(boqBudget - combinedTotal, 0);
  };

  // Check if combined total exceeds budget
  const isOverBudget = (boqItem) => {
    const boqBudget = parseFloat(boqItem.quantity) * parseFloat(boqItem.unit_cost);
    const combinedTotal = calculateCombinedTotal(boqItem);
    return combinedTotal > boqBudget;
  };

  const comparisonData = items.map((boq) => {
    const boqBudget = parseFloat(boq.quantity) * parseFloat(boq.unit_cost);
    const mtoTotal = calculateMtoTotals(boq.mto_items);
    const laborTotal = calculateLaborTotals(boq.lto);
    const equipmentTotal = calculateEquipmentTotals(boq.eto_items);
    return {
      name: boq.description,
      BOQ: boqBudget,
      MTO: mtoTotal,
      Labor: laborTotal,
      Equipment: equipmentTotal,
    };
  });

  const handleMtoChange = (index, field, value) => {
    if (!isEditable()) return;
    const updatedItems = [...selectedBoq.mto_items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value,
      // Auto-calculate total_cost if quantity or unit_cost changes
      ...(field === 'quantity' || field === 'unit_cost' ? {
        total_cost: (field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].quantity) || 0) * 
                   (field === 'unit_cost' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].unit_cost) || 0)
      } : {})
    };
    setSelectedBoq({ ...selectedBoq, mto_items: updatedItems });
  };

  // Labor change handler - working with single lto object
  const handleLaborChange = (field, value) => {
    if (!isEditable() || !selectedLabor) return;
    const currentLto = selectedLabor.lto || {};
    
    // Auto-calculate total_cost if allocated_budget changes
    const updatedLto = { 
      ...currentLto, 
      [field]: value,
      ...(field === 'allocated_budget' ? {
        total_cost: parseFloat(value) || 0
      } : {})
    };
    
    setSelectedLabor({ 
      ...selectedLabor, 
      lto: updatedLto 
    });
  };

  // Equipment change handler - working with eto items array
  const handleEquipmentChange = (index, field, value) => {
    if (!isEditable() || !selectedEquipment) return;
    const updatedItems = [...selectedEquipment.eto_items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value,
      // Auto-calculate total_cost if days or daily_rate changes
      ...((field === 'days' || field === 'daily_rate') ? {
        total_cost: (parseFloat(field === 'days' ? value : updatedItems[index].days) || 0) * 
                   (parseFloat(field === 'daily_rate' ? value : updatedItems[index].daily_rate) || 0)
      } : {})
    };
    
    setSelectedEquipment({ 
      ...selectedEquipment, 
      eto_items: updatedItems 
    });
  };

  const addMtoItem = () => {
    if (!isEditable()) return;
    const newItem = { 
      description: "", 
      unit: "", 
      quantity: 0, 
      unit_cost: 0,
      total_cost: 0 
    };
    setSelectedBoq({
      ...selectedBoq,
      mto_items: [...(selectedBoq.mto_items || []), newItem],
    });
  };

  const addEquipmentItem = () => {
    if (!isEditable()) return;
    const newItem = { 
      equipment_name: "", 
      days: 0, 
      daily_rate: 0,
      total_cost: 0 
    };
    setSelectedEquipment({
      ...selectedEquipment,
      eto_items: [...(selectedEquipment.eto_items || []), newItem],
    });
  };

  const removeMtoItem = (index) => {
    if (!isEditable()) return;
    const updatedItems = selectedBoq.mto_items.filter((_, i) => i !== index);
    setSelectedBoq({ ...selectedBoq, mto_items: updatedItems });
  };

  const removeEquipmentItem = (index) => {
    if (!isEditable()) return;
    const updatedItems = selectedEquipment.eto_items.filter((_, i) => i !== index);
    setSelectedEquipment({ ...selectedEquipment, eto_items: updatedItems });
  };

  const updateMto = async () => {
    if (!isEditable()) return;
    
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

      setItems((prev) =>
        prev.map((item) =>
          item.milestone_boq_id === selectedBoq.milestone_boq_id
            ? { ...item, mto_items: selectedBoq.mto_items }
            : item
        )
      );

      setSelectedBoq(null);
      toast.success("MTO updated successfully!");
    } catch (error) {
      console.error("Update MTO failed:", error);
      toast.error("Error: " + error.message);
    }
  };

  const updateLabor = async () => {
    if (!isEditable()) return;
    
    try {
      // Transform the data to match backend expectations
      const lto_items = selectedLabor.lto ? [{
        description: selectedLabor.lto.description || "",
        allocated_budget: parseFloat(selectedLabor.lto.allocated_budget) || parseFloat(selectedLabor.lto.total_cost) || 0,
        remarks: selectedLabor.lto.remarks || ""
      }] : [];

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/milestones/lto`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestone_boq_id: selectedLabor.milestone_boq_id,
            lto_items: lto_items,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update Labor");

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.milestone_boq_id === selectedLabor.milestone_boq_id
            ? { ...item, lto: selectedLabor.lto }
            : item
        )
      );

      setSelectedLabor(null);
      toast.success("Labor budget updated successfully!");
    } catch (error) {
      console.error("Update Labor failed:", error);
      toast.error("Error: " + error.message);
    }
  };

  const updateEquipment = async () => {
    if (!isEditable()) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/milestones/eto`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestone_boq_id: selectedEquipment.milestone_boq_id,
            eto_items: selectedEquipment.eto_items,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update Equipment");

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.milestone_boq_id === selectedEquipment.milestone_boq_id
            ? { ...item, eto_items: selectedEquipment.eto_items }
            : item
        )
      );

      setSelectedEquipment(null);
      toast.success("Equipment updated successfully!");
    } catch (error) {
      console.error("Update Equipment failed:", error);
      toast.error("Error: " + error.message);
    }
  };

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

  // Budget Status Component
  const BudgetStatus = ({ boqItem }) => {
    const boqBudget = parseFloat(boqItem.quantity) * parseFloat(boqItem.unit_cost);
    const mtoTotal = calculateMtoTotals(boqItem.mto_items);
    const laborTotal = calculateLaborTotals(boqItem.lto);
    const equipmentTotal = calculateEquipmentTotals(boqItem.eto_items);
    const combinedTotal = calculateCombinedTotal(boqItem);
    const remainingBudget = calculateRemainingBudget(boqItem);
    const isOver = isOverBudget(boqItem);

    return (
      <div className="mt-2 p-3 rounded border bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Budget Breakdown</h4>
            <p><span className="font-medium">BOQ Budget:</span> ₱{boqBudget.toFixed(2)}</p>
            <p><span className="font-medium text-purple-600">MTO:</span> ₱{mtoTotal.toFixed(2)}</p>
            <p><span className="font-medium text-green-600">Labor:</span> ₱{laborTotal.toFixed(2)}</p>
            <p><span className="font-medium text-orange-600">Equipment:</span> ₱{equipmentTotal.toFixed(2)}</p>
            <p><span className="font-medium">Combined Total:</span> ₱{combinedTotal.toFixed(2)}</p>
            <p><span className="font-medium">Remaining Budget:</span> ₱{remainingBudget.toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <PieChart width={180} height={180}>
              <Pie
                data={[
                  { name: "MTO", value: mtoTotal, color: "#8b5cf6" },
                  { name: "Labor", value: laborTotal, color: "#10b981" },
                  { name: "Equipment", value: equipmentTotal, color: "#f59e0b" },
                  { name: "Remaining", value: remainingBudget, color: "#6b7280" },
                ]}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                <Cell fill="#8b5cf6" />
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#6b7280" />
              </Pie>
              <Tooltip formatter={(value) => [`₱${value.toFixed(2)}`, "Amount"]} />
            </PieChart>
            <p className={`text-center text-sm font-semibold mt-2 ${isOver ? 'text-red-600' : 'text-green-600'}`}>
              {isOver ? '⚠️ Over Budget' : '✅ Within Budget'}
            </p>
          </div>
        </div>
      </div>
    );
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
          
          {/* Show Finance Remarks if available */}
          {milestone.finance_remarks && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold text-yellow-800">Finance Remarks:</p>
              <p className="text-yellow-700 text-sm mt-1">{milestone.finance_remarks}</p>
              {milestone.finance_rejection_stage && (
                <p className="text-yellow-600 text-xs mt-1">
                  Rejection Stage: {milestone.finance_rejection_stage}
                </p>
              )}
            </div>
          )}

          {/* Show Edit Status */}
          {!isEditable() && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-700 text-sm">
                {milestone.status === "Finance Rejected" 
                  ? "This milestone was rejected by Finance. Please review the remarks above and make necessary adjustments."
                  : "This milestone is currently under Finance review and cannot be modified."}
              </p>
            </div>
          )}
        </div>

        {/* PM Approval Buttons - Only show if editable */}
        {permissions.can_update_milestone === "Y" && isEditable() && (
          <div className="flex gap-3 mb-6">
            <button
              disabled={statusUpdating}
              onClick={() => updateMilestoneStatus("Pending Finance Approval")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Send to Finance
            </button>
          </div>
        )}

        {/* Data Analysis */}
        {comparisonData.length > 0 && (
          <div className="my-6">
            <h3 className="text-lg font-semibold mb-2">Budget Analysis</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${value.toFixed(2)}`, "Amount"]} />
                  <Legend />
                  <Bar dataKey="BOQ" fill="#4c6ef5" />
                  <Bar dataKey="MTO" fill="#8b5cf6" />
                  <Bar dataKey="Labor" fill="#10b981" />
                  <Bar dataKey="Equipment" fill="#f59e0b" />
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
                  <th className="border px-3 py-1 text-center">Budget Status</th>
                  <th className="border px-3 py-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isOver = isOverBudget(item);
                  const remainingBudget = calculateRemainingBudget(item);
                  const laborTotal = calculateLaborTotals(item.lto);
                  const equipmentTotal = calculateEquipmentTotals(item.eto_items);
                  const hasLabor = laborTotal > 0;
                  const hasEquipment = equipmentTotal > 0;
                  
                  return (
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isOver 
                            ? 'bg-red-100 text-red-800' 
                            : remainingBudget === 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOver ? 'Over Budget' : remainingBudget === 0 ? 'Budget Used' : 'Within Budget'}
                        </span>
                      </td>
                      <td className="border px-3 py-1 text-center">
                        <div className="flex flex-col sm:flex-row gap-1 justify-center">
                          <button
                            className={`text-blue-600 hover:underline text-sm px-2 py-1 border border-blue-600 rounded ${
                              !isEditable() ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => setSelectedBoq(item)}
                            disabled={!isEditable()}
                          >
                            {isEditable() ? 'View MTO' : 'View MTO (Read Only)'}
                          </button>
                          <button
                            className={`text-green-600 hover:underline text-sm px-2 py-1 border border-green-600 rounded ${
                              !isEditable() ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              setSelectedLabor({
                                ...item,
                                lto: item.lto || {
                                  description: `${item.description} - Labor`,
                                  allocated_budget: 0,
                                  total_cost: 0,
                                  remarks: ""
                                }
                              });
                            }}
                            disabled={!isEditable()}
                          >
                            {hasLabor 
                              ? (isEditable() ? 'Manage Labor' : 'View Labor') 
                              : (isEditable() ? 'Set Labor Budget' : 'No Labor Set')
                            }
                          </button>
                          <button
                            className={`text-orange-600 hover:underline text-sm px-2 py-1 border border-orange-600 rounded ${
                              !isEditable() ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              setSelectedEquipment({
                                ...item,
                                eto_items: item.eto_items || []
                              });
                            }}
                            disabled={!isEditable()}
                          >
                            {hasEquipment 
                              ? (isEditable() ? 'Manage Equipment' : 'View Equipment') 
                              : (isEditable() ? 'Set Equipment' : 'No Equipment Set')
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-600">No milestone items found.</p>
          )}
        </div>

        {/* MTO Modal */}
        {selectedBoq && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[700px] relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedBoq(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              >
                <X size={24} />
              </button>

              <h3 className="text-lg font-semibold mb-2 text-blue-700">
                MTO for: {selectedBoq.description}
                {!isEditable() && <span className="text-sm text-gray-500 ml-2">(Read Only)</span>}
              </h3>

              <table className="min-w-full border border-gray-300 mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-1 text-left">Material</th>
                    <th className="border px-3 py-1 text-left">Unit</th>
                    <th className="border px-3 py-1 text-right">Quantity</th>
                    <th className="border px-3 py-1 text-right">Unit Cost</th>
                    <th className="border px-3 py-1 text-right">Total</th>
                    {canModifyMto && isEditable() && (
                      <th className="border px-3 py-1 text-center">Remove</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedBoq.mto_items?.length > 0 ? (
                    selectedBoq.mto_items.map((mto, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border px-3 py-1">
                          {canModifyMto && isEditable() ? (
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
                          {canModifyMto && isEditable() ? (
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
                          {canModifyMto && isEditable() ? (
                            <input
                              type="number"
                              className="w-20 border px-1 py-0.5 text-sm text-right"
                              value={mto.quantity}
                              onChange={(e) =>
                                handleMtoChange(idx, "quantity", e.target.value)
                              }
                              step="0.01"
                            />
                          ) : (
                            mto.quantity
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right">
                          {canModifyMto && isEditable() ? (
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
                              step="0.01"
                            />
                          ) : (
                            mto.unit_cost
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right font-semibold">
                          ₱{(parseFloat(mto.quantity) * parseFloat(mto.unit_cost)).toFixed(2)}
                        </td>
                        {canModifyMto && isEditable() && (
                          <td className="border px-3 py-1 text-center">
                            <button
                              onClick={() => removeMtoItem(idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={canModifyMto && isEditable() ? 6 : 5}
                        className="text-center py-3 text-gray-500"
                      >
                        No MTO items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {canModifyMto && isEditable() && (
                <button
                  onClick={addMtoItem}
                  className="mb-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  + Add MTO Item
                </button>
              )}

              {/* Budget Status */}
              <BudgetStatus boqItem={selectedBoq} />

              {canModifyMto && isEditable() && (
                <button
                  onClick={updateMto}
                  disabled={isOverBudget(selectedBoq)}
                  className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                >
                  {isOverBudget(selectedBoq) ? 'Over Budget - Cannot Save' : 'Confirm MTO'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Labor Modal - Simplified LTO */}
        {selectedLabor && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[600px] relative">
              <button
                onClick={() => setSelectedLabor(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              >
                <X size={24} />
              </button>

              <h3 className="text-lg font-semibold mb-4 text-green-700">
                Labor Budget for: {selectedLabor.description}
                {!isEditable() && <span className="text-sm text-gray-500 ml-2">(Read Only)</span>}
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Description
                  </label>
                  <input
                    type="text"
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${
                      !isEditable() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    value={selectedLabor.lto?.description || ""}
                    onChange={(e) => handleLaborChange("description", e.target.value)}
                    placeholder="e.g., Site Preparation Works (Clearing, Excavation, Backfilling)"
                    disabled={!isEditable()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Labor Budget (₱)
                  </label>
                  <input
                    type="number"
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${
                      !isEditable() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    value={selectedLabor.lto?.allocated_budget || selectedLabor.lto?.total_cost || ""}
                    onChange={(e) => handleLaborChange("allocated_budget", e.target.value)}
                    placeholder="20000"
                    disabled={!isEditable()}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${
                      !isEditable() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    rows="3"
                    value={selectedLabor.lto?.remarks || ""}
                    onChange={(e) => handleLaborChange("remarks", e.target.value)}
                    placeholder="e.g., Includes manual clearing, hauling, and backfilling labor. To be managed by foreman."
                    disabled={!isEditable()}
                  />
                </div>

                {/* Auto-calculated Total Display */}
                <div className="p-3 bg-green-50 rounded border">
                  <p className="text-sm font-medium text-green-800">
                    Labor Total: ₱{parseFloat(selectedLabor.lto?.total_cost || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Budget Status */}
              <BudgetStatus boqItem={selectedLabor} />

              {canModifyMto && isEditable() && (
                <button
                  onClick={updateLabor}
                  disabled={isOverBudget(selectedLabor)}
                  className="mt-4 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
                >
                  {isOverBudget(selectedLabor) ? 'Over Budget - Cannot Save' : 'Save Labor Budget'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Equipment Modal - Updated for Multiple Items */}
        {selectedEquipment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[700px] relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedEquipment(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              >
                <X size={24} />
              </button>

              <h3 className="text-lg font-semibold mb-2 text-orange-700">
                Equipment for: {selectedEquipment.description}
                {!isEditable() && <span className="text-sm text-gray-500 ml-2">(Read Only)</span>}
              </h3>

              <table className="min-w-full border border-gray-300 mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-1 text-left">Equipment Name</th>
                    <th className="border px-3 py-1 text-right">Days</th>
                    <th className="border px-3 py-1 text-right">Daily Rate (₱)</th>
                    <th className="border px-3 py-1 text-right">Total</th>
                    {canModifyMto && isEditable() && (
                      <th className="border px-3 py-1 text-center">Remove</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedEquipment.eto_items?.length > 0 ? (
                    selectedEquipment.eto_items.map((equipment, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border px-3 py-1">
                          {canModifyMto && isEditable() ? (
                            <input
                              className="w-full border px-1 py-0.5 text-sm"
                              value={equipment.equipment_name}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  idx,
                                  "equipment_name",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Backhoe, Excavator, Crane"
                            />
                          ) : (
                            equipment.equipment_name
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right">
                          {canModifyMto && isEditable() ? (
                            <input
                              type="number"
                              className="w-20 border px-1 py-0.5 text-sm text-right"
                              value={equipment.days}
                              onChange={(e) =>
                                handleEquipmentChange(idx, "days", e.target.value)
                              }
                              step="0.01"
                            />
                          ) : (
                            equipment.days
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right">
                          {canModifyMto && isEditable() ? (
                            <input
                              type="number"
                              className="w-20 border px-1 py-0.5 text-sm text-right"
                              value={equipment.daily_rate}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  idx,
                                  "daily_rate",
                                  e.target.value
                                )
                              }
                              step="0.01"
                            />
                          ) : (
                            equipment.daily_rate
                          )}
                        </td>
                        <td className="border px-3 py-1 text-right font-semibold">
                          ₱{(parseFloat(equipment.days) * parseFloat(equipment.daily_rate)).toFixed(2)}
                        </td>
                        {canModifyMto && isEditable() && (
                          <td className="border px-3 py-1 text-center">
                            <button
                              onClick={() => removeEquipmentItem(idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={canModifyMto && isEditable() ? 5 : 4}
                        className="text-center py-3 text-gray-500"
                      >
                        No equipment items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {canModifyMto && isEditable() && (
                <button
                  onClick={addEquipmentItem}
                  className="mb-4 px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                >
                  + Add Equipment Item
                </button>
              )}

              {/* Auto-calculated Total Display */}
              <div className="p-3 bg-orange-50 rounded border mb-4">
                <p className="text-sm font-medium text-orange-800">
                  Equipment Total: ₱{calculateEquipmentTotals(selectedEquipment.eto_items).toFixed(2)}
                </p>
              </div>

              {/* Budget Status */}
              <BudgetStatus boqItem={selectedEquipment} />

              {canModifyMto && isEditable() && (
                <button
                  onClick={updateEquipment}
                  disabled={isOverBudget(selectedEquipment)}
                  className="mt-4 px-4 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 disabled:opacity-50"
                >
                  {isOverBudget(selectedEquipment) ? 'Over Budget - Cannot Save' : 'Save Equipment'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};