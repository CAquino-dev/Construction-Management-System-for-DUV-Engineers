import React, { useEffect, useState } from "react";
import axios from "axios";
import PaymentModal from "../../components/adminComponents/Finance/PaymentModal";

const FinancePayment = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch delivered & unpaid purchase orders
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/purchase-orders/delivered-unpaid`
        );
        if (res.data.success) {
          const formatted = res.data.data.map((item) => ({
            id: item.po_id,
            projectName: item.project_name,
            vendor: item.supplier_name,
            amount: parseFloat(item.total_amount) || 0,
            dueDate: item.delivery_date,
            status: "Pending",
            paymentType: "purchase_order", // This is the important one for the API
            paymentTypeDisplay: "Procurement Payment", // This is for display only
            invoiceNumber: `PO-${item.po_id}`,
            projectId: item.project_id,
            description: `Purchase Order Payment - ${item.project_name}`,
            referenceId: item.po_id, // This will be used as referenceId in the API
          }));
          setPayments(formatted);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments =
    filter === "All" ? payments : payments.filter((p) => p.status === filter);

  // Handle payment action (direct pay)
  const handlePaymentAction = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  // After payment modal completes
  const handlePaymentComplete = async (paymentRecord) => {
    try {
      // Update local state
      const updatedPayments = payments.map((p) =>
        p.id === paymentRecord.id ? { ...p, status: "Paid" } : p
      );
      setPayments(updatedPayments);

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

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance & Payments</h1>
          <p className="text-gray-600 mt-2">
            Manage project payments and vendor transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {["Pending", "Paid"].map((status) => (
            <div key={status} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-700">
                Total {status}
              </h3>
              <p
                className={`text-2xl font-bold ${
                  status === "Pending" ? "text-yellow-600" : "text-green-600"
                }`}
              >
                {formatCurrency(
                  payments
                    .filter((p) => p.status === status)
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
          ))}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Payments
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "Paid"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => setFilter(btn)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === btn
                      ? btn === "Pending"
                        ? "bg-yellow-600 text-white"
                        : btn === "Paid"
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {btn}
                </button>
              ))}
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
                    Project & Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Delivery Date
                  </th>
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
                      colSpan="6"
                      className="text-center text-gray-500 py-6 text-sm"
                    >
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {p.projectName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {p.paymentTypeDisplay} {/* Use display version here */}
                          </div>
                          <div className="text-xs text-gray-400">
                            {p.invoiceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {p.vendor}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(p.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          {p.status === "Pending" && (
                            <button
                              onClick={() => handlePaymentAction(p)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Pay Now
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
      </div>
    </div>
  );
};

export default FinancePayment;