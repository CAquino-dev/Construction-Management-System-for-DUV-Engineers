import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PaymentPage = () => {
  const { contractId } = useParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ error: "", success: "" });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/payments/contract/${contractId}`
        );
        const data = await res.json();
        if (res.ok) {
          setPayments(data);
        } else {
          setMessage({ error: data.error || "Failed to fetch payments." });
        }
      } catch (err) {
        setMessage({ error: "Error fetching payments." });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [contractId]);

  const handlePayNow = async (paymentId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/payments/pay/${paymentId}`,
        { method: "PUT" }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage({ success: "Payment successful!", error: "" });
        // Refresh payments
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId ? { ...p, status: "Paid" } : p
          )
        );
      } else {
        setMessage({ error: data.error || "Payment failed." });
      }
    } catch (err) {
      setMessage({ error: "Error processing payment." });
    }
  };

  if (loading) return <p className="p-4">Loading payments...</p>;

  return (
    <div className="mt-20 p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      <h1 className="text-2xl font-bold mb-4">Payments for Contract #{contractId}</h1>

      {message.error && <p className="text-red-600 mb-2">{message.error}</p>}
      {message.success && <p className="text-green-600 mb-2">{message.success}</p>}

      {payments.length === 0 ? (
        <p>No payments found for this contract.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Due Date</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p.id} className="text-center">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">₱{Number(p.amount).toLocaleString()}</td>
                <td className="border p-2">
                  {new Date(p.due_date).toLocaleDateString()}
                </td>
                <td
                  className={`border p-2 font-medium ${
                    p.status === "Paid"
                      ? "text-green-600"
                      : p.status === "Pending"
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {p.status}
                </td>
                <td className="border p-2">
                  {p.status === "Pending" ? (
                    <button
                      onClick={() => handlePayNow(p.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentPage;
