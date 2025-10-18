import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const ProcurementReviewDashboard = () => {
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);

  // Fetch all milestones with quotes
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/procurement/quotes/milestones`
        );
        setMilestones(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load milestones.");
      }
    };
    fetchMilestones();
  }, []);

  // Fetch quotes for selected milestone
  const handleSelectMilestone = async (milestone) => {
    setSelectedMilestone(milestone);
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/quotes/milestone/${milestone.milestone_id}`
      );
      setQuotes(res.data.quotes || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier quotes.");
    } finally {
      setLoading(false);
    }
  };

  // Approve a supplier's quote
  const handleApprove = async (supplierName) => {
    if (!selectedMilestone) return;

    const supplierEntry = Object.entries(quotes).find(
      ([name]) => name === supplierName
    );
    if (!supplierEntry) return toast.error("Supplier not found.");

    const quoteId = supplierEntry[1][0]?.quote_id;
    if (!quoteId) return toast.error("Missing quote ID.");

    setApproving(quoteId);
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/quotes/${quoteId}/approve`
      );
      toast.success(
        `Approved ${supplierName} for ${selectedMilestone.milestone_name}.`
      );
      handleSelectMilestone(selectedMilestone);
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve supplier.");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="mr-3">📊</span>
            Procurement Review Dashboard
          </h1>
          <p className="text-gray-600">
            Review and compare supplier quotations per milestone, then approve
            the winning supplier.
          </p>
        </div>

        {/* Milestone Selection */}
        <Card className="rounded-2xl shadow-sm border-0 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Select Milestone
            </h2>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              {milestones.length > 0 ? (
                milestones.map((m) => (
                  <button
                    key={m.milestone_id}
                    onClick={() => handleSelectMilestone(m)}
                    className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl border transition-all text-left ${
                      selectedMilestone?.milestone_id === m.milestone_id
                        ? "bg-[#4c735c] text-white border-[#4c735c] shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium">{m.milestone_name}</div>
                    <div className="text-sm opacity-80 mt-1">
                      {m.project_name}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center w-full py-8">
                  <div className="text-6xl mb-4 text-gray-300">📋</div>
                  <p className="text-gray-500">
                    No milestones with quotes yet.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4c735c] mx-auto mb-4" />
            <p className="text-gray-600">Loading supplier quotes...</p>
          </div>
        )}

        {/* Supplier Quotes */}
        {!loading && selectedMilestone && Object.keys(quotes).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">💰</span>
              Supplier Quotes for {selectedMilestone.milestone_name}
            </h2>

            {Object.entries(quotes).map(([supplierName, items]) => {
              const status = items[0]?.status || "Submitted";
              const grandTotal = items.reduce(
                (sum, i) => sum + i.quantity * i.unit_price,
                0
              );

              return (
                <Card
                  key={supplierName}
                  className={`rounded-2xl shadow-sm transition-all ${
                    status === "Selected"
                      ? "border-2 border-green-500 bg-green-50"
                      : status === "Rejected"
                      ? "border-2 border-red-400 bg-red-50"
                      : "border border-gray-200 bg-white"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-3 sm:mb-0">
                        <h3 className="font-bold text-lg text-gray-900">
                          {supplierName}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              status === "Selected"
                                ? "bg-green-100 text-green-800"
                                : status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {status === "Selected" ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Selected
                              </>
                            ) : status === "Rejected" ? (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Rejected
                              </>
                            ) : (
                              "Pending Review"
                            )}
                          </span>
                        </div>
                      </div>

                      {status === "Submitted" && (
                        <Button
                          disabled={approving === items[0]?.quote_id}
                          onClick={() => handleApprove(supplierName)}
                          className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          {approving === items[0]?.quote_id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Approving...
                            </>
                          ) : (
                            "Approve Supplier"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border p-3 text-left font-semibold">
                              Material
                            </th>
                            <th className="border p-3 text-center font-semibold">
                              Unit
                            </th>
                            <th className="border p-3 text-center font-semibold">
                              Qty
                            </th>
                            <th className="border p-3 text-right font-semibold">
                              Unit Price
                            </th>
                            <th className="border p-3 text-right font-semibold">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border p-3">
                                {item.material_name}
                              </td>
                              <td className="border p-3 text-center">
                                {item.unit}
                              </td>
                              <td className="border p-3 text-center">
                                {item.quantity}
                              </td>
                              <td className="border p-3 text-right">
                                ₱{item.unit_price?.toLocaleString()}
                              </td>
                              <td className="border p-3 text-right">
                                ₱
                                {(
                                  item.quantity * item.unit_price
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-gray-50">
                            <td colSpan={4} className="border p-3 text-right">
                              Grand Total
                            </td>
                            <td className="border p-3 text-right text-blue-700">
                              ₱{grandTotal.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2">
                              <span className="font-semibold text-gray-900">
                                {item.material_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Unit:</span>
                              <p className="font-medium">{item.unit}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Qty:</span>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Unit Price:</span>
                              <p className="font-medium">
                                ₱{item.unit_price?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total:</span>
                              <p className="font-medium text-blue-700">
                                ₱
                                {(
                                  item.quantity * item.unit_price
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Grand Total:</span>
                          <span className="text-blue-700 text-lg">
                            ₱{grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && selectedMilestone && Object.keys(quotes).length === 0 && (
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Supplier Quotes
              </h3>
              <p className="text-gray-600">
                No supplier quotes submitted yet for this milestone.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProcurementReviewDashboard;