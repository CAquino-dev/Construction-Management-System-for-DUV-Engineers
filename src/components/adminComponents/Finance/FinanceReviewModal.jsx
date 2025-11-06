import React, { useState } from "react";
import { X, Warning, CheckCircle, FileText } from "@phosphor-icons/react";
import { toast } from "sonner";
import ConfirmationModal from "../../adminComponents/ConfirmationModal";

export const FinanceReviewModal = ({ data, onClose }) => {
  const userId = localStorage.getItem("userId");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  if (!data) return null;

  const {
    title,
    start_date,
    due_date,
    total_budget,
    boq_total,
    approved_supplier,
    boq_items = [],
    status,
  } = data;

  const budgetDifference = total_budget - boq_total;
  const isOverBudget = budgetDifference > 0;
  const isUnderBudget = budgetDifference < 0;
  const variancePercentage = ((budgetDifference / boq_total) * 100).toFixed(2);

  const updateFinanceQuoteApproval = async (newStatus, remarks = "") => {
    console.log("status", newStatus);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/${
          data.id
        }/finance-quote-approval`,
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

      toast.success(`Supplier quote ${newStatus.toLowerCase()} successfully!`);
      return true;
    } catch (error) {
      toast.error("Network error: " + error.message);
      return false;
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const success = await updateFinanceQuoteApproval("Finance Approved");
      if (success) onClose();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Please provide remarks for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateFinanceQuoteApproval(
        "Finance Rejected",
        remarks.trim()
      );
      if (success) {
        setShowRejectModal(false);
        setRemarks("");
        onClose();
      }
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setIsSubmitting(false);
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
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <FileText size={24} className="text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Finance Review - {title}
                </h2>
                <p className="text-sm text-gray-600">
                  Project Timeline: {start_date} to {due_date}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Budget Summary */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Budget Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">BOQ Budget</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(boq_total)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Supplier Quote</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(total_budget)}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    isOverBudget
                      ? "bg-red-50"
                      : isUnderBudget
                      ? "bg-green-50"
                      : "bg-gray-50"
                  }`}
                >
                  <p className="text-sm text-gray-600">Variance</p>
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-2xl font-bold ${
                        isOverBudget
                          ? "text-red-600"
                          : isUnderBudget
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {isOverBudget ? "+" : ""}
                      {formatCurrency(Math.abs(budgetDifference))}
                    </p>
                    {isOverBudget && (
                      <Warning size={20} className="text-red-500" />
                    )}
                    {isUnderBudget && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      isOverBudget
                        ? "text-red-600"
                        : isUnderBudget
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {variancePercentage}%{" "}
                    {isOverBudget ? "over" : isUnderBudget ? "under" : ""}{" "}
                    budget
                  </p>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Approved Supplier
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">
                  {approved_supplier?.supplier_name}
                </p>
                <p className="text-sm text-blue-600">
                  Quote ID: #{approved_supplier?.quote_id}
                </p>
                <p className="text-sm text-blue-600">
                  Total Quote: {formatCurrency(approved_supplier?.total_quote)}
                </p>
              </div>
            </div>

            {/* BOQ Items Details */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                BOQ Items & Supplier Quotes
              </h3>
              <div className="space-y-4">
                {boq_items?.map((boqItem, index) => (
                  <div
                    key={boqItem.boq_id || index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 p-4 border-b">
                      <h4 className="font-medium text-gray-800">
                        Item #{boqItem.item_no}: {boqItem.description}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {boqItem.quantity} {boqItem.unit}
                      </p>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            BOQ Details
                          </h5>
                          <div className="space-y-1 text-sm">
                            <p>
                              Unit Cost: {formatCurrency(boqItem.unit_cost)}
                            </p>
                            <p>
                              Total Cost: {formatCurrency(boqItem.total_cost)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Supplier Quotes
                          </h5>
                          {approved_supplier?.items
                            ?.filter((item) => item.boq_id === boqItem.boq_id)
                            .map((quoteItem, quoteIndex) => (
                              <div
                                key={quoteIndex}
                                className="bg-green-50 p-3 rounded-lg mb-2"
                              >
                                <p className="text-sm font-medium text-green-800">
                                  {quoteItem.material_name}
                                </p>
                                <div className="flex justify-between text-sm text-green-700">
                                  <span>
                                    {formatCurrency(quoteItem.unit_price)} ×{" "}
                                    {quoteItem.quantity} {quoteItem.unit}
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(quoteItem.total_cost)}
                                  </span>
                                </div>
                              </div>
                            )) || (
                            <p className="text-sm text-gray-500">
                              No matching supplier quotes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Review Remarks
              </h3>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks or comments for this review..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-2">
                {isOverBudget &&
                  "⚠️ This milestone is over budget. Please provide justification for approval or reasons for rejection."}
                {isUnderBudget &&
                  "✅ This milestone is under budget. You may proceed with approval."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <div className="flex space-x-3">
              <button
                onClick={openRejectModal}
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center space-x-2"
              >
                <X size={16} />
                <span>Reject</span>
              </button>

              <button
                onClick={() => setIsApproveModalOpen(true)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>{isSubmitting ? "Processing..." : "Approve Quote"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Remarks Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Rejection Remarks
              </h3>
              <button
                onClick={closeRejectModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide the reason for rejecting this supplier quote:
              </p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter detailed rejection remarks..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-3 px-6 pb-6">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!remarks.trim() || isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium ${
                  !remarks.trim() || isSubmitting
                    ? "bg-red-300 cursor-not-allowed text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isSubmitting ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={() => {
          handleApprove();
          setIsApproveModalOpen(false);
        }}
        actionType="Approve Quote"
      />
    </>
  );
};
