import React, { useState, useEffect } from "react";

export const FinancePaymentEntry = ({ selectedProject }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedProject?.id) return;

    console.log(selectedProject)

    const fetchSchedule = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/project/getPaymentScheduleByProject/${selectedProject.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch payment schedule");
        const data = await res.json();
        setSchedule(data.results);
        setError(null);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setSchedule([]);
        setError("Unable to load payment schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedProject]);

  const handlePay = async (scheduleItem) => {
    try {
      // ✅ Prepare all required fields for the backend
      const paymentData = {
        schedule_id: scheduleItem.schedule_id,
        milestone_name: scheduleItem.milestone_name,
        amount: scheduleItem.amount,
        project_name: selectedProject.project_name,
        client_id: selectedProject.client_id, // Make sure this is available in selectedProject
        contract_id: selectedProject.contract_id // Make sure this is available in selectedProject
      };
      console.log("data", paymentData);
      // ✅ Validate that we have all required data
      if (!paymentData.client_id || !paymentData.contract_id) {
        alert("Missing client or contract information. Please contact support.");
        return;
      }

      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create checkout session");
      }

      const data = await res.json();
      // Redirect to PayMongo checkout page
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed: " + err.message);
    }
  };

  if (!selectedProject) {
    return <p className="text-gray-600">No project selected.</p>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Payment Schedule for {selectedProject.name}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : schedule.length === 0 ? (
        <p className="text-gray-500">No payment schedule found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border">Payment Name</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.schedule_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item.milestone_name}</td>
                  <td className="px-4 py-2 border">
                    ₱{parseFloat(item.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border">
                    {item.status === "Paid" ? (
                      <span className="text-green-600 font-medium">Paid</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {item.status !== "Paid" && (
                      <button
                        onClick={() => handlePay(item)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Pay with PayMongo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};