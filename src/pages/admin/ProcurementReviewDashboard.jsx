import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/quotes/milestones`
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/quotes/milestone/${milestone.milestone_id}`
      );
      setQuotes(res.data.quotes || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier quotes.");
    } finally {
      setLoading(false);
    }
  };

  // Approve a supplier’s quote
  const handleApprove = async (supplierName) => {
    if (!selectedMilestone) return;

    const supplierEntry = Object.entries(quotes).find(
      ([name]) => name === supplierName
    );
    if (!supplierEntry) return toast.error("Supplier not found.");

    // Find quote_id of this supplier (grab from first item since all same)
    const quoteId = supplierEntry[1][0]?.quote_id;
    if (!quoteId) return toast.error("Missing quote ID.");

    setApproving(quoteId);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/quotes/${quoteId}/approve`
      );
      toast.success(`Approved ${supplierName} for ${selectedMilestone.milestone_name}.`);
      // Refresh quotes
      handleSelectMilestone(selectedMilestone);
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve supplier.");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-3">Procurement Review Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Review and compare supplier quotations per milestone, then approve the winning supplier.
      </p>

      {/* Milestone Selection */}
      <div className="flex flex-wrap gap-3 mb-6">
        {milestones.length > 0 ? (
          milestones.map((m) => (
            <button
              key={m.milestone_id}
              onClick={() => handleSelectMilestone(m)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedMilestone?.milestone_id === m.milestone_id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100 border-gray-300"
              }`}
            >
              {m.milestone_name}
            </button>
          ))
        ) : (
          <p className="text-gray-500 italic">No milestones with quotes yet.</p>
        )}
      </div>

      {/* Supplier Quotes */}
      {loading && <p className="text-gray-500">Loading supplier quotes...</p>}

      {!loading && selectedMilestone && Object.keys(quotes).length > 0 && (
        <div className="space-y-6">
          {Object.entries(quotes).map(([supplierName, items]) => {
            const status = items[0]?.status || "Submitted";
            const grandTotal = items.reduce(
              (sum, i) => sum + i.quantity * i.unit_price,
              0
            );

            return (
              <Card
                key={supplierName}
                className={`shadow-md transition border-2 ${
                  status === "Selected"
                    ? "border-green-500 bg-green-50"
                    : status === "Rejected"
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <CardHeader className="flex flex-row justify-between items-center bg-gray-50 px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-lg">{supplierName}</h3>
                    <p
                      className={`text-sm ${
                        status === "Selected"
                          ? "text-green-600"
                          : status === "Rejected"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      Status: {status}
                    </p>
                  </div>

                  {status === "Selected" ? (
                    <div className="flex items-center text-green-600 font-semibold">
                      <CheckCircle2 className="w-5 h-5 mr-1" /> Selected
                    </div>
                  ) : status === "Rejected" ? (
                    <div className="flex items-center text-red-600 font-semibold">
                      <AlertCircle className="w-5 h-5 mr-1" /> Rejected
                    </div>
                  ) : (
                    <Button
                      disabled={approving === items[0]?.quote_id}
                      onClick={() => handleApprove(supplierName)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {approving === items[0]?.quote_id
                        ? "Approving..."
                        : "Approve Supplier"}
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm mt-2">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Material</th>
                        <th className="border p-2 text-center">Unit</th>
                        <th className="border p-2 text-center">Qty</th>
                        <th className="border p-2 text-right">Unit Price (₱)</th>
                        <th className="border p-2 text-right">Total (₱)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2">{item.material_name}</td>
                          <td className="border p-2 text-center">{item.unit}</td>
                          <td className="border p-2 text-center">{item.quantity}</td>
                          <td className="border p-2 text-right">
                            {item.unit_price?.toLocaleString("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            })}
                          </td>
                          <td className="border p-2 text-right">
                            {(item.quantity * item.unit_price).toLocaleString("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            })}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td colSpan={4} className="border p-2 text-right">
                          Grand Total
                        </td>
                        <td className="border p-2 text-right text-blue-700">
                          {grandTotal.toLocaleString("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && selectedMilestone && Object.keys(quotes).length === 0 && (
        <p className="text-gray-500 italic">
          No supplier quotes submitted yet for this milestone.
        </p>
      )}
    </div>
  );
};

export default ProcurementReviewDashboard;
