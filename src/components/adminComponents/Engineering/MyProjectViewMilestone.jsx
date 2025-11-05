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
import ConfirmationModal from "../../adminComponents/ConfirmationModal";

export const MyProjectViewMilestone = ({ milestone, onClose }) => {
  const [items, setItems] = useState(milestone.boq_items || []);
  const [selectedBoq, setSelectedBoq] = useState(null);
  const [selectedLabor, setSelectedLabor] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const permissions = JSON.parse(localStorage.getItem("permissions"));
  const canModifyMto = permissions?.can_modify_mto === "Y";
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Common units for materials dropdown
  const commonUnits = [
    // 🔹 Quantity / Counting Units
    "pc",
    "unit",
    "set",
    "lot",
    "pair",
    "dozen",

    // 🔹 Weight Units
    "g",
    "gram",
    "kg",
    "kilogram",
    "ton",
    "mt",

    // 🔹 Length Units
    "mm",
    "millimeter",
    "cm",
    "centimeter",
    "m",
    "meter",
    "km",
    "kilometer",

    // 🔹 Area Units
    "sqmm",
    "square millimeter",
    "sqcm",
    "square centimeter",
    "sqm",
    "square meter",

    // 🔹 Volume Units
    "cu.mm",
    "cubic millimeter",
    "cu.cm",
    "cubic centimeter",
    "cu.m",
    "cubic meter",
    "l",
    "liter",
    "ml",
    "milliliter",
    "gallon",
    "barrel",

    // 🔹 Packaging Units
    "box",
    "carton",
    "pack",
    "bundle",
    "roll",
    "sheet",
    "plate",
    "bag",
    "sack",
    "drum",
    "can",
    "tube",
    "bottle",
  ];

  // Check if milestone is editable
  const isEditable = () => {
    // Can edit if:
    // 1. Status is "For Review" or "Finance Rejected" with rejection stage "budget"
    // 2. User has permission to modify MTO
    if (!canModifyMto) return false;

    const editableStatuses = ["For Review", "Finance Rejected"];
    return (
      editableStatuses.includes(milestone.status) ||
      (milestone.status === "Finance Rejected" &&
        milestone.finance_rejection_stage === "budget")
    );
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
    const boqBudget =
      parseFloat(boqItem.quantity) * parseFloat(boqItem.unit_cost);
    const combinedTotal = calculateCombinedTotal(boqItem);
    return Math.max(boqBudget - combinedTotal, 0);
  };

  // Check if combined total exceeds budget
  const isOverBudget = (boqItem) => {
    const boqBudget =
      parseFloat(boqItem.quantity) * parseFloat(boqItem.unit_cost);
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
      ...(field === "quantity" || field === "unit_cost"
        ? {
            total_cost:
              (field === "quantity"
                ? parseFloat(value) || 0
                : parseFloat(updatedItems[index].quantity) || 0) *
              (field === "unit_cost"
                ? parseFloat(value) || 0
                : parseFloat(updatedItems[index].unit_cost) || 0),
          }
        : {}),
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
      ...(field === "allocated_budget"
        ? {
            total_cost: parseFloat(value) || 0,
          }
        : {}),
    };

    setSelectedLabor({
      ...selectedLabor,
      lto: updatedLto,
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
      ...(field === "days" || field === "daily_rate"
        ? {
            total_cost:
              (parseFloat(
                field === "days" ? value : updatedItems[index].days
              ) || 0) *
              (parseFloat(
                field === "daily_rate" ? value : updatedItems[index].daily_rate
              ) || 0),
          }
        : {}),
    };

    setSelectedEquipment({
      ...selectedEquipment,
      eto_items: updatedItems,
    });
  };

  const addMtoItem = () => {
    if (!isEditable()) return;
    const newItem = {
      description: "",
      unit: "pc", // Default unit
      quantity: 0,
      unit_cost: 0,
      total_cost: 0,
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
      total_cost: 0,
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
    const updatedItems = selectedEquipment.eto_items.filter(
      (_, i) => i !== index
    );
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
      const lto_items = selectedLabor.lto
        ? [
            {
              description: selectedLabor.lto.description || "",
              allocated_budget:
                parseFloat(selectedLabor.lto.allocated_budget) ||
                parseFloat(selectedLabor.lto.total_cost) ||
                0,
              remarks: selectedLabor.lto.remarks || "",
            },
          ]
        : [];

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
      if (!response.ok)
        throw new Error(data.error || "Failed to update Equipment");

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
      console.log("Updating milestone status to:", newStatus);
      console.log("Milestone ID:", milestone.id);
    } catch (error) {
      console.error("Update status failed:", error);
      toast.error("Error: " + error.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Budget Status Component
  const BudgetStatus = ({ boqItem }) => {
    const boqBudget =
      parseFloat(boqItem.quantity) * parseFloat(boqItem.unit_cost);
    const mtoTotal = calculateMtoTotals(boqItem.mto_items);
    const laborTotal = calculateLaborTotals(boqItem.lto);
    const equipmentTotal = calculateEquipmentTotals(boqItem.eto_items);
    const combinedTotal = calculateCombinedTotal(boqItem);
    const remainingBudget = calculateRemainingBudget(boqItem);
    const isOver = isOverBudget(boqItem);

    return (
      <div className="mt-2 p-3 rounded border bg-gray-50">
        {/* Confirmation Modal */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Budget Breakdown</h4>
            <p>
              <span className="font-medium">BOQ Budget:</span> ₱
              {boqBudget.toFixed(2)}
            </p>
            <p>
              <span className="font-medium text-purple-600">MTO:</span> ₱
              {mtoTotal.toFixed(2)}
            </p>
            <p>
              <span className="font-medium text-green-600">Labor:</span> ₱
              {laborTotal.toFixed(2)}
            </p>
            <p>
              <span className="font-medium text-orange-600">Equipment:</span> ₱
              {equipmentTotal.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Combined Total:</span> ₱
              {combinedTotal.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Remaining Budget:</span> ₱
              {remainingBudget.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <PieChart width={180} height={180}>
              <Pie
                data={[
                  { name: "MTO", value: mtoTotal, color: "#8b5cf6" },
                  { name: "Labor", value: laborTotal, color: "#10b981" },
                  {
                    name: "Equipment",
                    value: equipmentTotal,
                    color: "#f59e0b",
                  },
                  {
                    name: "Remaining",
                    value: remainingBudget,
                    color: "#6b7280",
                  },
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
              <Tooltip
                formatter={(value) => [`₱${value.toFixed(2)}`, "Amount"]}
              />
            </PieChart>
            <p
              className={`text-center text-sm font-semibold mt-2 ${
                isOver ? "text-red-600" : "text-green-600"
              }`}
            >
              {isOver ? "⚠️ Over Budget" : "✅ Within Budget"}
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

        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Milestone Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Milestone Details</h2>
            <p className="text-sm text-gray-600 mb-2">
              Created on: {formatDate(milestone.timestamp)}
            </p>
            <p className="text-xl font-bold mb-1">{milestone.title}</p>
            <p className="text-md text-gray-700 whitespace-pre-line">
              {milestone.details}
            </p>
          </div>

          {/* Dates & Status */}
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Show Finance Remarks if available */}
            {milestone.finance_remarks && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800">
                  Finance Remarks:
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  {milestone.finance_remarks}
                </p>
                {milestone.finance_rejection_stage && (
                  <p className="text-yellow-600 text-xs mt-1">
                    Rejection Stage: {milestone.finance_rejection_stage}
                  </p>
                )}
              </div>
            )}

            {/* Show Edit Status */}
            {!isEditable() && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
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
                onClick={() => {
                  setConfirmAction("Send to Finance");
                  setIsConfirmOpen(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Send to Finance
              </button>
            </div>
          )}

          {/* Data Analysis */}
          {comparisonData.length > 0 && (
            <div className="my-6">
              <h3 className="text-lg font-semibold mb-3">Budget Analysis</h3>

              {/* Mobile Card View - Hidden on desktop */}
              <div className="block md:hidden space-y-4">
                {comparisonData.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <h4 className="font-semibold text-gray-800 mb-3 text-center">
                      {item.name}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-600">
                          BOQ Budget
                        </span>
                        <span className="text-sm font-semibold">
                          ₱{item.BOQ.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-600">
                          MTO
                        </span>
                        <span className="text-sm">₱{item.MTO.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-600">
                          Labor
                        </span>
                        <span className="text-sm">
                          ₱{item.Labor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-600">
                          Equipment
                        </span>
                        <span className="text-sm">
                          ₱{item.Equipment.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-sm">Total Used</span>
                          <span className="text-sm">
                            ₱
                            {(item.MTO + item.Labor + item.Equipment).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span
                            className={`text-xs ${
                              item.MTO + item.Labor + item.Equipment > item.BOQ
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.MTO + item.Labor + item.Equipment > item.BOQ
                              ? "Over Budget"
                              : "Within Budget"}
                          </span>
                          <span className="text-xs text-gray-600">
                            Remaining: ₱
                            {Math.max(
                              0,
                              item.BOQ -
                                (item.MTO + item.Labor + item.Equipment)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart View - Hidden on mobile, shown on desktop */}
              <div className="hidden md:block w-full h-64">
                <ResponsiveContainer>
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`₱${value.toFixed(2)}`, "Amount"]}
                    />
                    <Legend />
                    <Bar dataKey="BOQ" fill="#4c6ef5" />
                    <Bar dataKey="MTO" fill="#8b5cf6" />
                    <Bar dataKey="Labor" fill="#10b981" />
                    <Bar dataKey="Equipment" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Simplified Chart for Medium Screens */}
              <div className="hidden sm:block md:hidden w-full h-56">
                <ResponsiveContainer>
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value) => [`₱${value.toFixed(2)}`, "Amount"]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
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
            <h3 className="text-lg font-semibold mb-3">Bill of Quantities</h3>
            {items.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-3 py-2 text-left">
                          Description
                        </th>
                        <th className="border px-3 py-2 text-left">Unit</th>
                        <th className="border px-3 py-2 text-right">
                          Quantity
                        </th>
                        <th className="border px-3 py-2 text-right">
                          Unit Cost
                        </th>
                        <th className="border px-3 py-2 text-right">
                          Total Cost
                        </th>
                        <th className="border px-3 py-2 text-center">
                          Budget Status
                        </th>
                        <th className="border px-3 py-2 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const isOver = isOverBudget(item);
                        const remainingBudget = calculateRemainingBudget(item);
                        const laborTotal = calculateLaborTotals(item.lto);
                        const equipmentTotal = calculateEquipmentTotals(
                          item.eto_items
                        );
                        const hasLabor = laborTotal > 0;
                        const hasEquipment = equipmentTotal > 0;

                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border px-3 py-2">
                              {item.description}
                            </td>
                            <td className="border px-3 py-2">{item.unit}</td>
                            <td className="border px-3 py-2 text-right">
                              {item.quantity}
                            </td>
                            <td className="border px-3 py-2 text-right">
                              {item.unit_cost}
                            </td>
                            <td className="border px-3 py-2 text-right">
                              {item.total_cost || 0}
                            </td>
                            <td className="border px-3 py-2 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isOver
                                    ? "bg-red-100 text-red-800"
                                    : remainingBudget === 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {isOver
                                  ? "Over Budget"
                                  : remainingBudget === 0
                                  ? "Budget Used"
                                  : "Within Budget"}
                              </span>
                            </td>
                            <td className="border px-3 py-2 text-center">
                              <div className="flex flex-col sm:flex-row gap-1 justify-center">
                                <button
                                  className={`text-blue-600 hover:underline text-sm px-2 py-1 border border-blue-600 rounded transition-colors ${
                                    !isEditable()
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-blue-50"
                                  }`}
                                  onClick={() => setSelectedBoq(item)}
                                  disabled={!isEditable()}
                                >
                                  {isEditable()
                                    ? "View MTO"
                                    : "View MTO (Read Only)"}
                                </button>
                                <button
                                  className={`text-green-600 hover:underline text-sm px-2 py-1 border border-green-600 rounded transition-colors ${
                                    !isEditable()
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-green-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedLabor({
                                      ...item,
                                      lto: item.lto || {
                                        description: `${item.description} - Labor`,
                                        allocated_budget: 0,
                                        total_cost: 0,
                                        remarks: "",
                                      },
                                    });
                                  }}
                                  disabled={!isEditable()}
                                >
                                  {hasLabor
                                    ? isEditable()
                                      ? "Manage Labor"
                                      : "View Labor"
                                    : isEditable()
                                    ? "Set Labor Budget"
                                    : "No Labor Set"}
                                </button>
                                <button
                                  className={`text-orange-600 hover:underline text-sm px-2 py-1 border border-orange-600 rounded transition-colors ${
                                    !isEditable()
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-orange-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedEquipment({
                                      ...item,
                                      eto_items: item.eto_items || [],
                                    });
                                  }}
                                  disabled={!isEditable()}
                                >
                                  {hasEquipment
                                    ? isEditable()
                                      ? "Manage Equipment"
                                      : "View Equipment"
                                    : isEditable()
                                    ? "Set Equipment"
                                    : "No Equipment Set"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {items.map((item, idx) => {
                    const isOver = isOverBudget(item);
                    const remainingBudget = calculateRemainingBudget(item);
                    const laborTotal = calculateLaborTotals(item.lto);
                    const equipmentTotal = calculateEquipmentTotals(
                      item.eto_items
                    );
                    const hasLabor = laborTotal > 0;
                    const hasEquipment = equipmentTotal > 0;
                    const totalCost =
                      parseFloat(item.quantity) * parseFloat(item.unit_cost);

                    return (
                      <div
                        key={idx}
                        className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                      >
                        {/* Header */}
                        <div className="mb-3">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            {item.description}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Unit:</span>{" "}
                              {item.unit}
                            </div>
                            <div className="text-right">
                              <span className="font-medium">Qty:</span>{" "}
                              {item.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Unit Cost:</span> ₱
                              {parseFloat(item.unit_cost).toFixed(2)}
                            </div>
                            <div className="text-right font-semibold">
                              <span className="font-medium">Total:</span> ₱
                              {totalCost.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Budget Status */}
                        <div className="mb-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              isOver
                                ? "bg-red-100 text-red-800"
                                : remainingBudget === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isOver
                              ? "⚠️ Over Budget"
                              : remainingBudget === 0
                              ? "💰 Budget Used"
                              : "✅ Within Budget"}
                          </span>
                        </div>

                        {/* Budget Breakdown */}
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">
                            Budget Breakdown:
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-purple-600 font-medium">
                                MTO:
                              </span>{" "}
                              ₱{calculateMtoTotals(item.mto_items).toFixed(2)}
                            </div>
                            <div>
                              <span className="text-green-600 font-medium">
                                Labor:
                              </span>{" "}
                              ₱{laborTotal.toFixed(2)}
                            </div>
                            <div>
                              <span className="text-orange-600 font-medium">
                                Equipment:
                              </span>{" "}
                              ₱{equipmentTotal.toFixed(2)}
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">
                                Remaining:
                              </span>{" "}
                              ₱{remainingBudget.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button
                            className={`w-full text-blue-600 hover:bg-blue-50 text-sm px-3 py-2 border border-blue-600 rounded-lg transition-colors ${
                              !isEditable()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => setSelectedBoq(item)}
                            disabled={!isEditable()}
                          >
                            📋 {isEditable() ? "Manage MTO" : "View MTO"}
                          </button>

                          <button
                            className={`w-full text-green-600 hover:bg-green-50 text-sm px-3 py-2 border border-green-600 rounded-lg transition-colors ${
                              !isEditable()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedLabor({
                                ...item,
                                lto: item.lto || {
                                  description: `${item.description} - Labor`,
                                  allocated_budget: 0,
                                  total_cost: 0,
                                  remarks: "",
                                },
                              });
                            }}
                            disabled={!isEditable()}
                          >
                            👥{" "}
                            {hasLabor
                              ? isEditable()
                                ? "Manage Labor"
                                : "View Labor"
                              : isEditable()
                              ? "Set Labor Budget"
                              : "No Labor Set"}
                          </button>

                          <button
                            className={`w-full text-orange-600 hover:bg-orange-50 text-sm px-3 py-2 border border-orange-600 rounded-lg transition-colors ${
                              !isEditable()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedEquipment({
                                ...item,
                                eto_items: item.eto_items || [],
                              });
                            }}
                            disabled={!isEditable()}
                          >
                            🔧{" "}
                            {hasEquipment
                              ? isEditable()
                                ? "Manage Equipment"
                                : "View Equipment"
                              : isEditable()
                              ? "Set Equipment"
                              : "No Equipment Set"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">
                No milestone items found.
              </p>
            )}
          </div>
        </div>

        {/* MTO Modal */}
        {selectedBoq && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-blue-700">
                    MTO for: {selectedBoq.description}
                  </h3>
                  {!isEditable() && (
                    <p className="text-sm text-gray-500 mt-1">(Read Only)</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedBoq(null)}
                  className="text-gray-500 hover:text-red-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Table Container with Responsive Design */}
                <div className="overflow-hidden border border-gray-300 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-300">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Material
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Unit Cost
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Total
                          </th>
                          {canModifyMto && isEditable() && (
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBoq.mto_items?.length > 0 ? (
                          selectedBoq.mto_items.map((mto, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors group"
                            >
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    value={mto.description}
                                    onChange={(e) =>
                                      handleMtoChange(
                                        idx,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter material description"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-800">
                                    {mto.description}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <select
                                    className="w-24 border border-gray-300 rounded-md px-2 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    value={mto.unit}
                                    onChange={(e) =>
                                      handleMtoChange(
                                        idx,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select unit</option>
                                    {commonUnits.map((unit) => (
                                      <option key={unit} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-600">
                                    {mto.unit}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <input
                                    type="number"
                                    className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    value={mto.quantity}
                                    onChange={(e) =>
                                      handleMtoChange(
                                        idx,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    step="0.01"
                                    min="0"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-600 text-right block">
                                    {mto.quantity}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <input
                                    type="number"
                                    className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    value={mto.unit_cost}
                                    onChange={(e) =>
                                      handleMtoChange(
                                        idx,
                                        "unit_cost",
                                        e.target.value
                                      )
                                    }
                                    step="0.01"
                                    min="0"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-600 text-right block">
                                    ₱{parseFloat(mto.unit_cost).toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-gray-800 text-right block">
                                  ₱
                                  {(
                                    parseFloat(mto.quantity) *
                                    parseFloat(mto.unit_cost)
                                  ).toFixed(2)}
                                </span>
                              </td>
                              {canModifyMto && isEditable() && (
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => removeMtoItem(idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Remove item"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={canModifyMto && isEditable() ? 6 : 5}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="text-gray-400 mb-2">
                                  <svg
                                    className="w-12 h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm">
                                  No MTO items added yet
                                </p>
                                {canModifyMto && isEditable() && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Click "Add MTO Item" to get started
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                  <div className="flex-1">
                    {canModifyMto && isEditable() && (
                      <button
                        onClick={addMtoItem}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add MTO Item
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-sm text-gray-600">
                      Total Items:{" "}
                      <span className="font-semibold">
                        {selectedBoq.mto_items?.length || 0}
                      </span>
                    </div>
                    {canModifyMto && isEditable() && (
                      <button
                        onClick={() => {
                          setConfirmAction("Save MTO");
                          setIsConfirmOpen(true);
                        }}
                        disabled={isOverBudget(selectedBoq)}
                        className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        {isOverBudget(selectedBoq) ? "Over Budget" : "Save MTO"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Budget Status */}
                <div className="mt-6">
                  <BudgetStatus boqItem={selectedBoq} />
                </div>

                {/* Over Budget Warning */}
                {isOverBudget(selectedBoq) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">Budget Exceeded</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Total MTO cost exceeds the available budget. Please adjust
                      quantities or remove items.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Labor Modal */}
        {selectedLabor && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Labor Budget
                  </h3>
                  <p className="text-sm text-gray-600">
                    For: {selectedLabor.description}
                  </p>
                  {!isEditable() && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      Read Only
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedLabor(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Form Section */}
                <div className="space-y-6">
                  {/* Work Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Description
                    </label>
                    {isEditable() ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                        value={selectedLabor.lto?.description || ""}
                        onChange={(e) =>
                          handleLaborChange("description", e.target.value)
                        }
                        placeholder="e.g., Site Preparation Works (Clearing, Excavation, Backfilling)"
                      />
                    ) : (
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                        <p className="text-sm text-gray-700">
                          {selectedLabor.lto?.description ||
                            "No description provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Budget Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labor Budget Amount
                    </label>
                    <div className="relative">
                      {isEditable() ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">₱</span>
                          </div>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                            value={
                              selectedLabor.lto?.allocated_budget ||
                              selectedLabor.lto?.total_cost ||
                              ""
                            }
                            onChange={(e) =>
                              handleLaborChange(
                                "allocated_budget",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-700">
                            ₱
                            {parseFloat(
                              selectedLabor.lto?.total_cost || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks & Notes
                    </label>
                    {isEditable() ? (
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                        rows="4"
                        value={selectedLabor.lto?.remarks || ""}
                        onChange={(e) =>
                          handleLaborChange("remarks", e.target.value)
                        }
                        placeholder="e.g., Includes manual clearing, hauling, and backfilling labor. To be managed by foreman."
                      />
                    ) : (
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 min-h-[100px]">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedLabor.lto?.remarks || "No remarks provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Labor Budget Total
                        </p>
                        <p className="text-xs text-green-600">
                          Auto-calculated based on allocated budget
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-800">
                          ₱
                          {parseFloat(
                            selectedLabor.lto?.total_cost || 0
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Status */}
                <div className="mt-6">
                  <BudgetStatus boqItem={selectedLabor} />
                </div>

                {/* Action Buttons */}
                {canModifyMto && isEditable() && (
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => setSelectedLabor(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction("Save Labor Budget");
                        setIsConfirmOpen(true);
                      }}
                      disabled={isOverBudget(selectedLabor)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      {isOverBudget(selectedLabor) ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Over Budget
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Labor Budget
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Over Budget Warning */}
                {isOverBudget(selectedLabor) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Budget Limit Exceeded
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          The labor budget exceeds the available BOQ budget.
                          Please adjust the amount to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Modal */}
        {selectedEquipment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Equipment Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    For: {selectedEquipment.description}
                  </p>
                  {!isEditable() && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      Read Only
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Equipment Table */}
                <div className="overflow-hidden border border-gray-300 rounded-lg mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-300">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Equipment
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Days
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Daily Rate
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Total Cost
                          </th>
                          {canModifyMto && isEditable() && (
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedEquipment.eto_items?.length > 0 ? (
                          selectedEquipment.eto_items.map((equipment, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors group"
                            >
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
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
                                  <span className="text-sm text-gray-800">
                                    {equipment.equipment_name}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <input
                                    type="number"
                                    className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm text-right focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
                                    value={equipment.days}
                                    onChange={(e) =>
                                      handleEquipmentChange(
                                        idx,
                                        "days",
                                        e.target.value
                                      )
                                    }
                                    step="0.01"
                                    min="0"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-600 text-right block">
                                    {equipment.days}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {canModifyMto && isEditable() ? (
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">
                                        ₱
                                      </span>
                                    </div>
                                    <input
                                      type="number"
                                      className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm text-right focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
                                      value={equipment.daily_rate}
                                      onChange={(e) =>
                                        handleEquipmentChange(
                                          idx,
                                          "daily_rate",
                                          e.target.value
                                        )
                                      }
                                      step="0.01"
                                      min="0"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-600 text-right block">
                                    ₱
                                    {parseFloat(equipment.daily_rate).toFixed(
                                      2
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-gray-800 text-right block">
                                  ₱
                                  {(
                                    parseFloat(equipment.days) *
                                    parseFloat(equipment.daily_rate)
                                  ).toFixed(2)}
                                </span>
                              </td>
                              {canModifyMto && isEditable() && (
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => removeEquipmentItem(idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Remove equipment"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={canModifyMto && isEditable() ? 5 : 4}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="text-gray-400 mb-2">
                                  <svg
                                    className="w-12 h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm">
                                  No equipment items added yet
                                </p>
                                {canModifyMto && isEditable() && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Add equipment to get started
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Equipment Total */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-800">
                          Equipment Total
                        </p>
                        <p className="text-xs text-orange-600">
                          Sum of all equipment costs
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-orange-800">
                          ₱
                          {calculateEquipmentTotals(
                            selectedEquipment.eto_items
                          ).toFixed(2)}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {selectedEquipment.eto_items?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {canModifyMto && isEditable() && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-end items-start">
                      <button
                        onClick={addEquipmentItem}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Equipment
                      </button>
                    </div>
                  )}
                </div>

                {/* Budget Status */}
                <div className="mb-6">
                  <BudgetStatus boqItem={selectedEquipment} />
                </div>

                {/* Action Buttons */}
                {canModifyMto && isEditable() && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => setSelectedEquipment(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction("Save Equipment");
                        setIsConfirmOpen(true);
                      }}
                      disabled={isOverBudget(selectedEquipment)}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      {isOverBudget(selectedEquipment) ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Over Budget
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Equipment
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Over Budget Warning */}
                {isOverBudget(selectedEquipment) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Budget Limit Exceeded
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          The total equipment cost exceeds the available BOQ
                          budget. Please adjust equipment days or rates to
                          continue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (confirmAction === "Save MTO") updateMto();
          if (confirmAction === "Save Labor Budget") updateLabor();
          if (confirmAction === "Save Equipment") updateEquipment();
          if (confirmAction === "Send to Finance")
            updateMilestoneStatus("Pending Finance Approval");
          setIsConfirmOpen(false);
        }}
        actionType={confirmAction}
      />
    </div>
  );
};
