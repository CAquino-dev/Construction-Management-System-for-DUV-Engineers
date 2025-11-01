import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { X, CaretDown, CaretRight } from "@phosphor-icons/react";
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
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export const FinanceBudgetSupplyRequestView = ({ data, onClose }) => {
  const userId = localStorage.getItem("userId");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [expandedBoqItems, setExpandedBoqItems] = useState({});

  console.log("Finance review data:", data);

  // Toggle BOQ item expansion
  const toggleBoqItem = (boqId) => {
    setExpandedBoqItems(prev => ({
      ...prev,
      [boqId]: !prev[boqId]
    }));
  };

  // Calculate budget breakdown
  const calculateBudgetBreakdown = () => {
    let totalMto = 0;
    let totalLto = 0;
    let totalEto = 0;

    data.boq_items?.forEach(boqItem => {
      // MTO items
      boqItem.mto_items?.forEach(mto => {
        totalMto += parseFloat(mto.total_cost) || 0;
      });

      // LTO
      totalLto += parseFloat(boqItem.lto?.total_cost) || 0;

      // ETO - handle both single eto object and eto_items array
      if (boqItem.eto_items && Array.isArray(boqItem.eto_items)) {
        // New format: eto_items array
        boqItem.eto_items.forEach(eto => {
          totalEto += parseFloat(eto.total_cost) || 0;
        });
      } else if (boqItem.eto) {
        // Old format: single eto object
        totalEto += parseFloat(boqItem.eto.total_cost) || 0;
      }
    });

    const totalBudget = totalMto + totalLto + totalEto;

    return {
      totalMto,
      totalLto,
      totalEto,
      totalBudget,
      chartData: [
        { name: 'Materials (MTO)', value: totalMto, color: '#4CAF50' },
        { name: 'Labor (LTO)', value: totalLto, color: '#2196F3' },
        { name: 'Equipment (ETO)', value: totalEto, color: '#FF9800' }
      ]
    };
  };

  const budgetData = calculateBudgetBreakdown();

  // Calculate total equipment cost for a BOQ item
  const calculateEquipmentTotal = (boqItem) => {
    if (boqItem.eto_items && Array.isArray(boqItem.eto_items)) {
      return boqItem.eto_items.reduce((sum, eto) => sum + (parseFloat(eto.total_cost) || 0), 0);
    } else if (boqItem.eto) {
      return parseFloat(boqItem.eto.total_cost) || 0;
    }
    return 0;
  };

  // Get equipment items for display
  const getEquipmentItems = (boqItem) => {
    if (boqItem.eto_items && Array.isArray(boqItem.eto_items)) {
      return boqItem.eto_items;
    } else if (boqItem.eto) {
      // Convert single eto object to array for consistent display
      return [boqItem.eto];
    }
    return [];
  };

  const updateFinanceApproval = async (newStatus, remarks = "") => {
    console.log("status", newStatus);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/${
          data.id
        }/finance-approval`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            financeId: userId,
            remarks: remarks,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update finance approval");
        return false;
      }

      toast.success(`Milestone ${newStatus.toLowerCase()} successfully!`);
      return true;
    } catch (error) {
      toast.error("Network error: " + error.message);
      return false;
    }
  };

  const handleApprove = async () => {
    const success = await updateFinanceApproval("Finance Approved");
    if (success) onClose();
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Please provide remarks for rejection");
      return;
    }

    const success = await updateFinanceApproval(
      "Finance Rejected",
      remarks.trim()
    );
    if (success) {
      setShowRejectModal(false);
      setRemarks("");
      onClose();
    }
  };

  const openRejectModal = () => {
    setShowRejectModal(true);
    setRemarks("");
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRemarks("");
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {data.title}
              </h2>
              <p className="text-gray-600 mt-1">Milestone Budget Review</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-500">Total Budget</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(budgetData.totalBudget)}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-500">Materials (MTO)</div>
                <div className="text-xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(budgetData.totalMto)}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-500">Labor (LTO)</div>
                <div className="text-xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(budgetData.totalLto)}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-500">Equipment (ETO)</div>
                <div className="text-xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(budgetData.totalEto)}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Project Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project ID:</span>
                    <span className="font-medium">PRJ-{data.project_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {data.start_date ? new Date(data.start_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">
                      {data.due_date ? new Date(data.due_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{data.progress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Budget Distribution Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Budget Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetData.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {budgetData.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* BOQ Items Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Bill of Quantities (BOQ) Items
              </h3>
              
              {data.boq_items?.map((boqItem, index) => (
                <div key={boqItem.milestone_boq_id} className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                  {/* BOQ Item Header */}
                  <div 
                    className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleBoqItem(boqItem.milestone_boq_id)}
                  >
                    <div className="flex items-center space-x-4">
                      {expandedBoqItems[boqItem.milestone_boq_id] ? (
                        <CaretDown size={20} className="text-gray-600" />
                      ) : (
                        <CaretRight size={20} className="text-gray-600" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          Item {boqItem.item_no}: {boqItem.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          {boqItem.quantity} {boqItem.unit} × {formatCurrency(boqItem.unit_cost)} = {formatCurrency(boqItem.total_cost)}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(boqItem.total_cost)}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedBoqItems[boqItem.milestone_boq_id] && (
                    <div className="bg-white p-4 border-t">
                      {/* MTO Items */}
                      {boqItem.mto_items && boqItem.mto_items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-3 text-green-700">
                            Materials (MTO)
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Cost</TableHead>
                                <TableHead className="text-right">Total Cost</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {boqItem.mto_items.map((mto) => (
                                <TableRow key={mto.mto_id}>
                                  <TableCell className="font-medium">{mto.description}</TableCell>
                                  <TableCell>{mto.unit}</TableCell>
                                  <TableCell>{mto.quantity}</TableCell>
                                  <TableCell>{formatCurrency(mto.unit_cost)}</TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {formatCurrency(mto.total_cost)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* LTO */}
                      {boqItem.lto && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-3 text-blue-700">
                            Labor (LTO)
                          </h4>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{boqItem.lto.description}</div>
                                {boqItem.lto.remarks && (
                                  <div className="text-sm text-gray-600 mt-1">{boqItem.lto.remarks}</div>
                                )}
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(boqItem.lto.total_cost)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ETO - Fixed to handle multiple equipment items */}
                      {(boqItem.eto_items && boqItem.eto_items.length > 0) || boqItem.eto ? (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3 text-orange-700">
                            Equipment (ETO)
                          </h4>
                          {getEquipmentItems(boqItem).length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Equipment Name</TableHead>
                                  <TableHead>Days</TableHead>
                                  <TableHead>Daily Rate</TableHead>
                                  <TableHead className="text-right">Total Cost</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getEquipmentItems(boqItem).map((eto, etoIndex) => (
                                  <TableRow key={eto.eto_id || etoIndex}>
                                    <TableCell className="font-medium">{eto.equipment_name}</TableCell>
                                    <TableCell>{eto.days}</TableCell>
                                    <TableCell>{formatCurrency(eto.daily_rate)}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {formatCurrency(eto.total_cost)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="bg-orange-50 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{boqItem.eto.equipment_name}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {boqItem.eto.days} days × {formatCurrency(boqItem.eto.daily_rate)}/day
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-orange-600">
                                  {formatCurrency(boqItem.eto.total_cost)}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Show total equipment cost */}
                          <div className="mt-3 p-3 bg-orange-100 rounded border border-orange-200">
                            <div className="flex justify-between items-center font-semibold">
                              <span className="text-orange-800">Total Equipment Cost:</span>
                              <span className="text-orange-600 text-lg">
                                {formatCurrency(calculateEquipmentTotal(boqItem))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Review the budget breakdown and approve or reject this milestone
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={openRejectModal}
                  className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Approve Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Remarks Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Rejection Remarks</h3>
              <button
                onClick={closeRejectModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide the reason for rejecting this milestone budget:
              </p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter detailed rejection remarks..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3 px-6 pb-6">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!remarks.trim()}
                className={`px-6 py-2 rounded-lg font-medium ${
                  !remarks.trim()
                    ? "bg-red-300 cursor-not-allowed text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};