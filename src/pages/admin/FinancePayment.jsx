import React, { useEffect, useState } from "react";
import axios from "axios";
import PaymentModal from "../../components/adminComponents/Finance/PaymentModal";
import CashHandoverModal from "../../components/adminComponents/Finance/CashHandoverModal";

const FinancePayment = () => {
  const [payments, setPayments] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);
  const [cashHandovers, setCashHandovers] = useState([]);
  const [paidCashHandovers, setPaidCashHandovers] = useState([]);
  const [filter, setFilter] = useState("Purchase Orders");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPaidPayment, setSelectedPaidPayment] = useState(null);
  const [showCashHandoverModal, setShowCashHandoverModal] = useState(false);
  const [selectedCashHandover, setSelectedCashHandover] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_REACT_APP_API_URL;

  // Fetch delivered & unpaid purchase orders
  const fetchPendingPayments = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/finance/purchase-orders/delivered-unpaid`
      );
      if (res.data.success) {
        const formatted = res.data.data.map((item) => ({
          id: item.po_id,
          projectName: item.project_name,
          vendor: item.supplier_name,
          amount: parseFloat(item.total_amount) || 0,
          dueDate: item.delivery_date,
          status: "Pending",
          paymentType: "purchase_order",
          paymentTypeDisplay: "Procurement Payment",
          invoiceNumber: `PO-${item.po_id}`,
          projectId: item.project_id,
          description: `Purchase Order Payment - ${item.project_name}`,
          referenceId: item.po_id,
          type: "pending",
        }));
        return formatted;
      }
      return [];
    } catch (err) {
      console.error("Error fetching pending payments:", err);
      return [];
    }
  };

  // Fetch paid purchase orders
  const fetchPaidPayments = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/finance/getPaidPurchaseOrders`
      );
      if (res.data.success) {
        const formatted = res.data.data.map((item) => ({
          id: item.id,
          projectName: item.project_name,
          vendor: item.supplier_name,
          amount: parseFloat(item.amount) || 0,
          dueDate: item.created_at,
          paidDate: item.paid_at,
          status: "Paid",
          paymentType: item.payment_type,
          paymentTypeDisplay: "Procurement Payment",
          invoiceNumber: item.po_number,
          projectId: item.reference_id,
          description: `Purchase Order Payment - ${item.project_name}`,
          paymentMethod: item.payment_method,
          referenceNumber: item.reference_number,
          processedBy: item.paid_by_name,
          bankName: item.bank_name,
          accountNumber: item.account_number,
          transactionDate: item.transaction_date,
          notes: item.notes,
          attachments: item.attachments,
          recipientSignature: item.recipient_signature,
          type: "paid_purchase_order",
        }));
        return formatted;
      }
      return [];
    } catch (err) {
      console.error("Error fetching paid payments:", err);
      return [];
    }
  };

  // Fetch paid cash handovers
  const fetchPaidCashHandovers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/cash-handovers`
      );
      if (res.data.data) {
        const formatted = res.data.data.map((item) => ({
          id: item.handover_id,
          projectName: `Project ${item.project_id}`,
          milestoneTitle: item.milestone_title,
          amount: parseFloat(item.amount) || 0,
          handoverDate: item.handover_date,
          paidDate: item.created_at,
          status: "Completed",
          paymentType: "cash_handover",
          paymentTypeDisplay: "Cash Handover",
          referenceNumber: `HANDOVER-${item.handover_id}`,
          projectId: item.project_id,
          milestoneId: item.milestone_id,
          recipientName: item.recipient_name,
          notes: item.notes,
          recipientSignature: item.recipient_signature,
          processedBy: item.processed_by_name,
          type: "paid_cash_handover",
        }));
        return formatted;
      }
      return [];
    } catch (err) {
      console.error("Error fetching paid cash handovers:", err);
      return [];
    }
  };

  // Fetch cash handover data (LTO/ETO) - Combined per milestone
  const fetchCashHandovers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getApprovedLtoEto`
      );
      if (res.data.milestones) {
        const formatted = res.data.milestones.map((milestone) => {
          // Calculate total amount from both LTO and ETO
          const ltoTotal = milestone.lto_items?.reduce((sum, lto) => sum + parseFloat(lto.total_cost || 0), 0) || 0;
          const etoTotal = milestone.eto_items?.reduce((sum, eto) => sum + parseFloat(eto.total_cost || 0), 0) || 0;
          const totalAmount = ltoTotal + etoTotal;

          // Create descriptions for both LTO and ETO
          const ltoDescriptions = milestone.lto_items?.map(lto => lto.description).filter(Boolean) || [];
          const etoDescriptions = milestone.eto_items?.map(eto => eto.equipment_name).filter(Boolean) || [];
          const allDescriptions = [...ltoDescriptions, ...etoDescriptions];
          
          // Create items breakdown
          const laborItems = milestone.lto_items?.map(lto => ({
            type: "Labor",
            description: lto.description,
            amount: parseFloat(lto.total_cost) || 0,
            remarks: lto.remarks
          })) || [];

          const equipmentItems = milestone.eto_items?.map(eto => ({
            type: "Equipment",
            description: eto.equipment_name,
            amount: parseFloat(eto.total_cost) || 0,
            days: eto.days,
            dailyRate: eto.daily_rate
          })) || [];

          const allItems = [...laborItems, ...equipmentItems];

          return {
            id: `milestone-${milestone.milestone_id}`,
            projectName: `Project ${milestone.project_id}`,
            milestoneTitle: milestone.title,
            type: "Combined",
            description: allDescriptions.join(", ") || "Cash handover for milestone completion",
            amount: totalAmount,
            dueDate: milestone.created_at,
            status: "Pending",
            paymentType: "cash_handover",
            paymentTypeDisplay: "Cash Handover",
            referenceNumber: `MIL-${milestone.milestone_id}`,
            projectId: milestone.project_id,
            milestoneId: milestone.milestone_id,
            items: allItems,
            laborItems: laborItems,
            equipmentItems: equipmentItems,
            type: "pending_cash_handover",
          };
        });
        return formatted;
      }
      return [];
    } catch (err) {
      console.error("Error fetching cash handovers:", err);
      return [];
    }
  };

  // Fetch all payments
  useEffect(() => {
    const fetchAllPayments = async () => {
      setLoading(true);
      try {
        const [pendingData, paidData, cashHandoverData, paidCashHandoverData] = await Promise.all([
          fetchPendingPayments(),
          fetchPaidPayments(),
          fetchCashHandovers(),
          fetchPaidCashHandovers(),
        ]);

        setPayments(pendingData);
        setPaidPayments(paidData);
        setCashHandovers(cashHandoverData);
        setPaidCashHandovers(paidCashHandoverData);
      } catch (err) {
        console.error("Error fetching all payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPayments();
  }, []);

  // Combine payments for display based on filter
  const getFilteredPayments = () => {
    switch (filter) {
      case "Purchase Orders":
        return payments;
      case "Cash Handover":
        return cashHandovers;
      case "Paid":
        return [...paidPayments, ...paidCashHandovers];
      default:
        return payments;
    }
  };

  const filteredPayments = getFilteredPayments();

  // Handle payment action (direct pay)
  const handlePaymentAction = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  // Handle view action for paid payments
  const handleViewAction = (payment) => {
    setSelectedPaidPayment(payment);
    setShowViewModal(true);
  };

  // Handle cash handover action
  const handleCashHandoverAction = (handover) => {
    setSelectedCashHandover(handover);
    setShowCashHandoverModal(true);
  };

  // After payment modal completes
  const handlePaymentComplete = async (paymentRecord) => {
    try {
      // Refetch data to get updated lists
      const [pendingData, paidData, cashHandoverData, paidCashHandoverData] = await Promise.all([
        fetchPendingPayments(),
        fetchPaidPayments(),
        fetchCashHandovers(),
        fetchPaidCashHandovers(),
      ]);

      setPayments(pendingData);
      setPaidPayments(paidData);
      setCashHandovers(cashHandoverData);
      setPaidCashHandovers(paidCashHandoverData);

      alert(
        `Payment of ₱${paymentRecord.paymentDetails.amount.toLocaleString()} processed successfully!`
      );
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment status.");
    } finally {
      setShowPaymentModal(false);
      setSelectedPayment(null);
    }
  };

  // After cash handover completes
  const handleCashHandoverComplete = async () => {
    try {
      // Refetch cash handover data
      const [cashHandoverData, paidCashHandoverData] = await Promise.all([
        fetchCashHandovers(),
        fetchPaidCashHandovers(),
      ]);
      setCashHandovers(cashHandoverData);
      setPaidCashHandovers(paidCashHandoverData);
      
      alert("Cash handover processed successfully!");
    } catch (err) {
      console.error("Error updating cash handover:", err);
      alert("Failed to update cash handover status.");
    } finally {
      setShowCashHandoverModal(false);
      setSelectedCashHandover(null);
    }
  };

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get full URL for attachments
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_REACT_APP_API_URL}${path}`;
  };

  // Parse attachments JSON
  const parseAttachments = (attachments) => {
    if (!attachments) return [];
    try {
      return JSON.parse(attachments);
    } catch (err) {
      console.error("Error parsing attachments:", err);
      return [];
    }
  };

  // Calculate totals
  const pendingTotal = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidTotal = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const cashHandoverTotal = cashHandovers.reduce((sum, p) => sum + p.amount, 0);
  const paidCashHandoverTotal = paidCashHandovers.reduce((sum, p) => sum + p.amount, 0);
  const overallTotal = pendingTotal + paidTotal + cashHandoverTotal + paidCashHandoverTotal;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Finance & Payments
          </h1>
          <p className="text-gray-600 mt-2">
            Manage purchase order payments, cash handovers, and vendor transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700">
              Pending Purchase Orders
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(pendingTotal)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {payments.length} purchase orders
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700">
              Cash Handovers
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(cashHandoverTotal)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {cashHandovers.length} milestones
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700">
              Paid Purchase Orders
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(paidTotal)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {paidPayments.length} purchase orders
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Processed
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(overallTotal)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {payments.length + paidPayments.length + cashHandovers.length + paidCashHandovers.length} total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {["Purchase Orders", "Cash Handover", "Paid"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => setFilter(btn)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === btn
                      ? btn === "Purchase Orders"
                        ? "bg-yellow-600 text-white"
                        : btn === "Cash Handover"
                        ? "bg-blue-600 text-white"
                        : "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {filter === "Purchase Orders"
                ? `${payments.length} pending purchase orders`
                : filter === "Cash Handover"
                ? `${cashHandovers.length} cash handover milestones`
                : `${paidPayments.length + paidCashHandovers.length} paid items`}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {filter === "Cash Handover" ? "Milestone & Details" : "Project & Details"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {filter === "Cash Handover" ? "Type" : filter === "Paid" ? "Type" : "Vendor"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  {/* Conditionally render date column only for Purchase Orders and Paid tabs */}
                  {(filter === "Purchase Orders" || filter === "Paid") && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {filter === "Paid" ? "Paid Date" : "Delivery Date"}
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={filter === "Cash Handover" ? "5" : "6"}
                      className="text-center text-gray-500 py-6 text-sm"
                    >
                      {filter === "Purchase Orders"
                        ? "No pending purchase orders found."
                        : filter === "Cash Handover"
                        ? "No cash handover milestones found."
                        : "No paid items found."}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={`${p.type}-${p.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {filter === "Cash Handover" || p.paymentType === "cash_handover" ? (p.milestoneTitle || "Milestone") : p.projectName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {p.paymentTypeDisplay}
                          </div>
                          <div className="text-xs text-gray-400">
                            {p.invoiceNumber || p.referenceNumber}
                          </div>
                          {(filter === "Cash Handover" || p.paymentType === "cash_handover") && (
                            <div className="text-xs text-gray-500 mt-1">
                              {p.description}
                              {p.items && p.items.length > 0 && (
                                <div className="mt-1 text-xs">
                                  Includes: {p.items.length} item{p.items.length > 1 ? 's' : ''}
                                </div>
                              )}
                              {p.recipientName && (
                                <div className="mt-1 text-xs">
                                  Recipient: {p.recipientName}
                                </div>
                              )}
                            </div>
                          )}
                          {p.type === "paid_purchase_order" && p.paymentMethod && (
                            <div className="text-xs text-gray-400 mt-1">
                              Paid via: {p.paymentMethod}
                              {p.referenceNumber && ` (${p.referenceNumber})`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {filter === "Cash Handover" || p.paymentType === "cash_handover" ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {p.type === "pending_cash_handover" ? "Combined" : "Cash Handover"}
                          </span>
                        ) : (
                          p.vendor || "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(p.amount)}
                      </td>
                      {/* Conditionally render date cell only for Purchase Orders and Paid tabs */}
                      {(filter === "Purchase Orders" || filter === "Paid") && (
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(
                            filter === "Paid" 
                              ? (p.paidDate || p.handoverDate)
                              : p.dueDate
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                          {p.processedBy && (
                            <span className="ml-1 text-xs">
                              by {p.processedBy}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          {p.status === "Pending" && filter === "Purchase Orders" && (
                            <button
                              onClick={() => handlePaymentAction(p)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Pay Now
                            </button>
                          )}
                          {p.status === "Pending" && filter === "Cash Handover" && (
                            <button
                              onClick={() => handleCashHandoverAction(p)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Process Handover
                            </button>
                          )}
                          {(p.status === "Paid" || p.status === "Completed") && (
                            <button
                              onClick={() => handleViewAction(p)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          payment={selectedPayment}
          onPaymentComplete={handlePaymentComplete}
        />

        {/* Cash Handover Modal */}
        <CashHandoverModal
          isOpen={showCashHandoverModal}
          onClose={() => setShowCashHandoverModal(false)}
          handover={selectedCashHandover}
          onHandoverComplete={handleCashHandoverComplete}
        />

        {/* View Paid Payment Modal */}
        {showViewModal && selectedPaidPayment && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPaidPayment.paymentType === "cash_handover" ? "Cash Handover Details" : "Payment Details"}
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {selectedPaidPayment.paymentType === "cash_handover" ? "Handover Information" : "Payment Information"}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            {selectedPaidPayment.paymentType === "cash_handover" ? "Milestone" : "Project"}
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.paymentType === "cash_handover" ? selectedPaidPayment.milestoneTitle : selectedPaidPayment.projectName}
                          </p>
                        </div>
                        {selectedPaidPayment.paymentType === "cash_handover" && selectedPaidPayment.recipientName && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Recipient
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedPaidPayment.recipientName}
                            </p>
                          </div>
                        )}
                        {selectedPaidPayment.paymentType === "purchase_order" && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Vendor
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedPaidPayment.vendor}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            {selectedPaidPayment.paymentType === "cash_handover" ? "Reference" : "Purchase Order"}
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.invoiceNumber || selectedPaidPayment.referenceNumber}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Amount
                          </label>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(selectedPaidPayment.amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Transaction Details
                      </h3>
                      <div className="space-y-3">
                        {selectedPaidPayment.paymentType === "purchase_order" && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Payment Method
                              </label>
                              <p className="text-sm text-gray-900">
                                {selectedPaidPayment.paymentMethod}
                              </p>
                            </div>
                            {selectedPaidPayment.referenceNumber && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Reference Number
                                </label>
                                <p className="text-sm text-gray-900">
                                  {selectedPaidPayment.referenceNumber}
                                </p>
                              </div>
                            )}
                            {selectedPaidPayment.bankName && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Bank Name
                                </label>
                                <p className="text-sm text-gray-900">
                                  {selectedPaidPayment.bankName}
                                </p>
                              </div>
                            )}
                            {selectedPaidPayment.accountNumber && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Account Number
                                </label>
                                <p className="text-sm text-gray-900">
                                  {selectedPaidPayment.accountNumber}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Transaction Date
                              </label>
                              <p className="text-sm text-gray-900">
                                {formatDate(selectedPaidPayment.transactionDate)}
                              </p>
                            </div>
                          </>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            {selectedPaidPayment.paymentType === "cash_handover" ? "Handover Date" : "Paid Date"}
                          </label>
                          <p className="text-sm text-gray-900">
                            {formatDate(selectedPaidPayment.paymentType === "cash_handover" ? selectedPaidPayment.handoverDate : selectedPaidPayment.paidDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Processed By
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.processedBy}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedPaidPayment.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Notes
                        </h3>
                        <p className="text-sm text-gray-900">
                          {selectedPaidPayment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Photos & Attachments */}
                  <div className="space-y-6">
                    {/* Recipient Signature */}
                    {selectedPaidPayment.recipientSignature && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Recipient Signature
                        </h3>
                        <div className="border rounded-lg p-4 bg-white">
                          <img
                            src={`${API}${selectedPaidPayment.recipientSignature}`}
                            alt="Recipient Signature"
                            className="max-w-full h-auto max-h-48 mx-auto"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                          <div
                            style={{ display: "none" }}
                            className="text-center text-gray-500 text-sm"
                          >
                            Signature image not available
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachments - Only for purchase orders */}
                    {selectedPaidPayment.paymentType === "purchase_order" && selectedPaidPayment.attachments &&
                      parseAttachments(selectedPaidPayment.attachments).length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Attachments
                          </h3>
                          <div className="space-y-3">
                            {parseAttachments(
                              selectedPaidPayment.attachments
                            ).map((attachment, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3 bg-white"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-900 truncate">
                                    {attachment.name}
                                  </span>
                                  <a
                                    href={getFullUrl(attachment.path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View
                                  </a>
                                </div>
                                {attachment.path && (
                                  <div className="mt-2 border rounded">
                                    <img
                                      src={getFullUrl(attachment.path)}
                                      alt={attachment.name}
                                      className="w-full h-auto max-h-48 object-contain"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePayment;