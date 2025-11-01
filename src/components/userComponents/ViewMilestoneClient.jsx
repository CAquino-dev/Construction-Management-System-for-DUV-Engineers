import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { X, CaretDown, CaretRight } from "@phosphor-icons/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

export const ViewMilestoneClient = ({ milestoneId, onClose }) => {
  const [expandedBoqItems, setExpandedBoqItems] = useState({});
  const [milestoneData, setMilestoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch milestone data
  useEffect(() => {
    const fetchMilestoneData = async () => {
      if (!milestoneId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/client/getMilestoneBudget/${milestoneId}`
        );
        setMilestoneData(response.data.milestone);
      } catch (err) {
        setError('Failed to fetch milestone data');
        console.error('Error fetching milestone:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestoneData();
  }, [milestoneId]);

  // Toggle BOQ item expansion
  const toggleBoqItem = (boqId) => {
    setExpandedBoqItems(prev => ({
      ...prev,
      [boqId]: !prev[boqId]
    }));
  };

  // Calculate budget breakdown based on the new data structure
  const calculateBudgetBreakdown = () => {
    if (!milestoneData?.boq_items) {
      return {
        totalMto: 0,
        totalLto: 0,
        totalEto: 0,
        totalBudget: 0,
        chartData: []
      };
    }

    let totalMto = 0;
    let totalLto = 0;
    let totalEto = 0;

    milestoneData.boq_items.forEach(boqItem => {
      // MTO items
      boqItem.mto_items?.forEach(mto => {
        totalMto += parseFloat(mto.total_cost) || 0;
      });

      // LTO
      totalLto += parseFloat(boqItem.lto?.total_cost) || 0;

      // ETO - check if eto exists in the data structure
      if (boqItem.eto_items && Array.isArray(boqItem.eto_items)) {
        boqItem.eto_items.forEach(eto => {
          totalEto += parseFloat(eto.total_cost) || 0;
        });
      } else if (boqItem.eto) {
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
      ].filter(item => item.value > 0) // Only show categories with values
    };
  };

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

  const budgetData = calculateBudgetBreakdown();

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c735c]"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading milestone details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!milestoneData) {
    return (
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">Milestone data not found.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {milestoneData.title}
              </h2>
              <p className="text-gray-600 mt-1">Milestone Budget Details</p>
              {milestoneData.details && (
                <p className="text-sm text-gray-500 mt-1">{milestoneData.details}</p>
              )}
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
                <h3 className="font-semibold text-gray-800 mb-3">Milestone Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project ID:</span>
                    <span className="font-medium">PRJ-{milestoneData.project_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {milestoneData.start_date ? new Date(milestoneData.start_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">
                      {milestoneData.due_date ? new Date(milestoneData.due_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      milestoneData.status === 'Completed' ? 'text-green-600' : 
                      milestoneData.status === 'Delivered' ? 'text-blue-600' : 
                      milestoneData.status === 'In Progress' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {milestoneData.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {milestoneData.timestamp ? new Date(milestoneData.timestamp).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget Distribution Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Budget Distribution</h3>
                <div className="h-48">
                  {budgetData.chartData.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No budget data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOQ Items Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Bill of Quantities (BOQ) Items
              </h3>
              
              {milestoneData.boq_items?.length > 0 ? (
                milestoneData.boq_items.map((boqItem, index) => (
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

                        {/* ETO Items */}
                        {(boqItem.eto_items && boqItem.eto_items.length > 0) || boqItem.eto ? (
                          <div className="mb-4">
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

                        {/* Show message if no breakdown data */}
                        {(!boqItem.mto_items || boqItem.mto_items.length === 0) && !boqItem.lto && (!boqItem.eto_items || boqItem.eto_items.length === 0) && !boqItem.eto && (
                          <div className="text-center py-4 text-gray-500">
                            No detailed breakdown available for this item
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                  No BOQ items found for this milestone
                </div>
              )}
            </div>
          </div>

          {/* Footer - Read Only for Client */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                View-only mode - Budget details for your review
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};