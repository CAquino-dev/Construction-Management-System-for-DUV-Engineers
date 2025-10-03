import React, { useState, useEffect } from "react";

export const FinancePaymentEntry = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_REACT_APP_API_URL
      }/api/finance/projects/with-pending-payments`
    )
      .then((res) => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setMilestones([]);
      setSelectedMilestoneId("");
      setAmountPaid("");
      return;
    }
    fetch(
      `${
        import.meta.env.VITE_REACT_APP_API_URL
      }/api/finance/projects/${selectedProjectId}/milestones/for-payment`
    )
      .then((res) => res.json())
      .then((data) => {
        setMilestones(data);
        setSelectedMilestoneId("");
        setAmountPaid("");
      })
      .catch(console.error);
  }, [selectedProjectId]);

  useEffect(() => {
    const milestone = milestones.find((m) => m.id === selectedMilestoneId);
    if (milestone) setAmountPaid(milestone.payment_amount.toFixed(2));
    else setAmountPaid("");
  }, [selectedMilestoneId, milestones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedProjectId) return setMessage("Please select a project.");
    if (!selectedMilestoneId) return setMessage("Please select a milestone.");
    if (!amountPaid || isNaN(amountPaid))
      return setMessage("Please enter a valid amount.");

    try {
      const payload = {
        milestone_id: selectedMilestoneId,
        payment_date: paymentDate,
        amount_paid: amountPaid,
      };

      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to record payment");
      }

      setMessage("✅ Payment recorded successfully!");
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 rounded-xl shadow-lg bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Record Payment
      </h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded text-sm ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">-- Select project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Milestone
          </label>
          <select
            value={selectedMilestoneId}
            onChange={(e) => setSelectedMilestoneId(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            required
            disabled={!selectedProjectId}
          >
            <option value="">-- Select milestone --</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.status} — ₱{m.payment_amount}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Record Payment
        </button>
      </form>
    </div>
  );
};
