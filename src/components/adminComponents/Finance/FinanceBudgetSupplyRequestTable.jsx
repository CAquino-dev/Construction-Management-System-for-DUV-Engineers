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
import { FinanceReviewModal } from "./FinanceReviewModal";
import ConfirmationModal from "../../adminComponents/ConfirmationModal";

export const FinanceBudgetSupplyRequestTable = () => {
  const [activeTab, setActiveTab] = useState("milestone-budget");
  const [milestoneBudgetData, setMilestoneBudgetData] = useState([]);
  const [mtoQuotesData, setMtoQuotesData] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [loading, setLoading] = useState({
    milestoneBudget: true,
    mtoQuotes: true,
  });

  // Fetch procurement-approved milestones (Milestone Budget tab)
  useEffect(() => {
    const fetchMilestoneBudget = async () => {
      try {
        setLoading((prev) => ({ ...prev, milestoneBudget: true }));
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/finance/procurementApproved`
        );

        if (!response.ok)
          throw new Error("Failed to fetch procurement-approved milestones");

        const data = await response.json();
        const transformedData = data.milestones.map((m) => {
          const totalQuote = m.approved_supplier?.items?.reduce(
            (sum, i) => sum + (parseFloat(i.total_cost) || 0),
            0
          );

          const totalBoqBudget =
            m.boq_total ||
            m.boq_items?.reduce(
              (sum, i) => sum + (parseFloat(i.total_cost) || 0),
              0
            ) ||
            0;

          return {
            id: m.milestone_id,
            title: m.title,
            start_date: m.start_date
              ? new Date(m.start_date).toLocaleDateString()
              : "N/A",
            due_date: m.due_date
              ? new Date(m.due_date).toLocaleDateString()
              : "N/A",
            total_budget: totalQuote || 0,
            boq_total: totalBoqBudget,
            boq_items: m.boq_items || [],
            status: m.status || "Pending",
            approved_supplier: m.approved_supplier,
          };
        });
        setMilestoneBudgetData(transformedData);
      } catch (err) {
        console.error("Error loading procurement-approved milestones:", err);
      } finally {
        setLoading((prev) => ({ ...prev, milestoneBudget: false }));
      }
    };

    fetchMilestoneBudget();
  }, []);

  // Fetch milestones pending finance approval (MTO Quotes tab)
  useEffect(() => {
    const fetchMtoQuotes = async () => {
      try {
        setLoading((prev) => ({ ...prev, mtoQuotes: true }));
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/finance/pendingApproval`
        );

        if (!response.ok)
          throw new Error("Failed to fetch pending approval milestones");

        const data = await response.json();
        console.log("MTO Quotes API Response:", data);

        const transformedData =
          data.milestones?.map((milestone) => {
            const totalBoqCost =
              milestone.boq_items?.reduce((sum, item) => {
                return sum + (parseFloat(item.total_cost) || 0);
              }, 0) || 0;

            const totalMtoCost =
              milestone.boq_items?.reduce((sum, boqItem) => {
                const mtoTotal =
                  boqItem.mto_items?.reduce((mtoSum, mto) => {
                    return mtoSum + (parseFloat(mto.total_cost) || 0);
                  }, 0) || 0;
                return sum + mtoTotal;
              }, 0) || 0;

            const ltoCost =
              parseFloat(milestone.boq_items?.[0]?.lto?.total_cost) || 0;
            const etoCost =
              parseFloat(milestone.boq_items?.[0]?.eto?.total_cost) || 0;

            const totalBudget = totalMtoCost + ltoCost + etoCost;

            return {
              id: milestone.id,
              milestone_id: milestone.id,
              title: milestone.title,
              project_id: milestone.project_id,
              start_date: milestone.start_date,
              due_date: milestone.due_date,
              status: milestone.status,
              progress: milestone.progress,
              total_boq_cost: totalBoqCost,
              total_budget: totalBudget,
              boq_items: milestone.boq_items || [],
              item_count: milestone.boq_items?.length || 0,
              // Include MTO, LTO, ETO data for the modal
              mto_items: milestone.boq_items?.[0]?.mto_items || [],
              lto: milestone.boq_items?.[0]?.lto,
              eto: milestone.boq_items?.[0]?.eto,
            };
          }) || [];

        setMtoQuotesData(transformedData);
      } catch (error) {
        console.error("Error loading pending approval milestones:", error);
      } finally {
        setLoading((prev) => ({ ...prev, mtoQuotes: false }));
      }
    };

    fetchMtoQuotes();
  }, []);

  const handleViewRequest = (milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleCloseModal = () => {
    setSelectedMilestone(null);
  };

  const handleApprove = async (milestoneId, remarks) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            milestone_id: milestoneId,
            remarks: remarks,
            approved_by: "finance_user", // You might want to get this from auth context
          }),
        }
      );

      if (!response.ok) throw new Error("Approval failed");

      // Refresh the data to reflect the changes
      console.log("Milestone approved successfully");

      // Optionally refresh the MTO Quotes data
      // fetchMtoQuotes();
    } catch (error) {
      console.error("Approval error:", error);
      throw error;
    }
  };

  const handleReject = async (milestoneId, remarks) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            milestone_id: milestoneId,
            remarks: remarks,
            rejected_by: "finance_user", // You might want to get this from auth context
          }),
        }
      );

      if (!response.ok) throw new Error("Rejection failed");

      // Refresh the data to reflect the changes
      console.log("Milestone rejected successfully");

      // Optionally refresh the MTO Quotes data
      // fetchMtoQuotes();
    } catch (error) {
      console.error("Rejection error:", error);
      throw error;
    }
  };

  const renderMilestoneBudgetTab = () => {
    if (loading.milestoneBudget) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">
            Loading procurement-approved milestones...
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Title</TableHead>
              <TableHead className="text-center text-white">
                Start Date
              </TableHead>
              <TableHead className="text-center text-white">End Date</TableHead>
              <TableHead className="text-center text-white">
                Supplier Quote
              </TableHead>
              <TableHead className="text-center text-white">
                BOQ Budget
              </TableHead>
              <TableHead className="text-center text-white">Supplier</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {milestoneBudgetData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan="7"
                  className="text-center text-gray-600 py-8"
                >
                  No procurement-approved milestones found.
                </TableCell>
              </TableRow>
            )}

            {milestoneBudgetData.map((m) => {
              const diff = m.total_budget - m.boq_total;
              const isOverBudget = diff > 0;

              return (
                <TableRow key={m.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-medium">
                    {m.title}
                  </TableCell>
                  <TableCell className="text-center">{m.start_date}</TableCell>
                  <TableCell className="text-center">{m.due_date}</TableCell>
                  <TableCell className="text-center">
                    ₱{m.total_budget.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-center ${
                      isOverBudget ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ₱{m.boq_total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center text-gray-700">
                    {m.approved_supplier?.supplier_name || "—"}
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderMtoQuotesTab = () => {
    if (loading.mtoQuotes) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">
            Loading pending approval milestones...
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">
                Milestone
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Project ID
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Start Date
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Due Date
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                BOQ Items
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Total Budget
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {mtoQuotesData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="8"
                  className="text-center text-gray-500 py-8"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-gray-400 text-lg mb-2">
                      No milestones found
                    </div>
                    <div className="text-gray-400 text-sm">
                      There are no milestones pending finance approval at this
                      time.
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              mtoQuotesData.map((milestone) => (
                <TableRow key={milestone.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {milestone.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    PRJ-{milestone.project_id}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {milestone.start_date
                      ? new Date(milestone.start_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {milestone.due_date
                      ? new Date(milestone.due_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {milestone.item_count} item
                    {milestone.item_count !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ₱
                    {milestone.total_budget.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        milestone.status === "Pending Finance Approval"
                          ? "bg-yellow-100 text-yellow-800"
                          : milestone.status === "Finance Approved"
                          ? "bg-green-100 text-green-800"
                          : milestone.status === "Finance Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleViewRequest(milestone)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Eye size={16} className="mr-1" />
                      Review
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Finance Budget Management
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Manage milestone budgets and review MTO quotes
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("milestone-budget")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "milestone-budget"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Mto Quotes
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {milestoneBudgetData.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("mto-quotes")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "mto-quotes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Milestone Budget
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {mtoQuotesData.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "milestone-budget" && renderMilestoneBudgetTab()}
        {activeTab === "mto-quotes" && renderMtoQuotesTab()}
      </div>

      {/* Modals - CORRECTED BASED ON DATA STRUCTURE */}
      {selectedMilestone && activeTab === "milestone-budget" && (
        <FinanceReviewModal
          data={selectedMilestone}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {selectedMilestone && activeTab === "mto-quotes" && (
        <FinanceBudgetSupplyRequestView
          data={selectedMilestone}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
