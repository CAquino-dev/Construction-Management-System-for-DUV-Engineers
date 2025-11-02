import React, { useState, useEffect } from "react";

export const FinancePaymentEntry = ({ selectedProject }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedProject?.id) return;

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
      const paymentData = {
        schedule_id: scheduleItem.schedule_id,
        milestone_name: scheduleItem.milestone_name,
        amount: scheduleItem.amount,
        project_name: selectedProject.project_name,
        client_id: selectedProject.client_id,
        contract_id: selectedProject.contract_id,
      };

      if (!paymentData.client_id || !paymentData.contract_id) {
        alert(
          "Missing client or contract information. Please contact support."
        );
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
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed: " + err.message);
    }
  };

  if (!selectedProject) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Select a project to view payments</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c735c] mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Payment Schedule</h2>
        <p className="text-gray-600">For {selectedProject.project_name}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {schedule.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No payment schedule found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((item) => (
            <div
              key={item.schedule_id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.milestone_name}
                  </h3>
                  <p className="text-lg font-bold text-[#4c735c] mt-1">
                    ₱{parseFloat(item.amount).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {item.status !== "Paid" && (
                <button
                  onClick={() => handlePay(item)}
                  className="w-full bg-[#4c735c] hover:bg-[#3a5a4a] text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Pay with PayMongo
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
