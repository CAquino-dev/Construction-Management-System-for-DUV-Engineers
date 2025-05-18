import React, { useState, useEffect } from 'react';

export const FinancePaymentEntry = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load projects on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/with-pending-payments`)
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  // Load milestones when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setMilestones([]);
      setSelectedMilestoneId('');
      setAmountPaid('');
      return;
    }
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/${selectedProjectId}/milestones/for-payment`)
      .then(res => res.json())
      .then(data => {
        setMilestones(data);
        setSelectedMilestoneId('');
        setAmountPaid('');
      })
      .catch(console.error);
  }, [selectedProjectId]);

  // Update amountPaid when milestone changes
  useEffect(() => {
    const milestone = milestones.find(m => m.id === selectedMilestoneId);
    if (milestone) setAmountPaid(milestone.payment_amount.toFixed(2));
    else setAmountPaid('');
  }, [selectedMilestoneId, milestones]);

  const handleSubmit = async (e) => {
    let finished = false; 

    e.preventDefault();
    setMessage('');
    if (!selectedProjectId) return setMessage('Please select a project.');
    if (!selectedMilestoneId) return setMessage('Please select a milestone.');
    if (!amountPaid || isNaN(amountPaid)) return setMessage('Please enter a valid amount.');

    setLoading(true);

      const payload = {
      milestone_id: selectedMilestoneId,
      payment_date: paymentDate,
      amount_paid: amountPaid,
    };

    const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok){
     finished = true;
    }

    if(finished === true) {
      try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amountPaid),
          description: `Payment for milestone ${selectedMilestoneId} of project ${selectedProjectId}`,
          success_url: 'http://localhost:3000/payment-success', // Change to your success page URL
          cancel_url: 'http://localhost:3000/payment-cancel',   // Change to your cancel page URL
          // You can add line_items here if your backend supports it
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create checkout session');
      }

      const data = await res.json();

      // Redirect user to PayMongo checkout page
      window.location.href = data.checkout_url;

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
      {message && <p className="text-red-600">{message}</p>}

      <label>
        Project:
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="block w-full border p-2"
          required
          disabled={loading}
        >
          <option value="">-- Select project --</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.project_name}</option>
          ))}
        </select>
      </label>

      <label>
        Milestone:
        <select
          value={selectedMilestoneId}
          onChange={(e) => setSelectedMilestoneId(e.target.value)}
          className="block w-full border p-2"
          required
          disabled={!selectedProjectId || loading}
        >
          <option value="">-- Select milestone --</option>
          {milestones.map(m => (
            <option key={m.id} value={m.id}>
              {m.status} — ₱{m.payment_amount}
            </option>
          ))}
        </select>
      </label>

      <label>
        Amount:
        <input
          type="number"
          step="0.01"
          min="0"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="block w-full border p-2"
          required
          disabled={loading}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className={`py-2 px-4 rounded text-white ${loading ? 'bg-gray-500' : 'bg-green-600'}`}
      >
        {loading ? 'Redirecting to Payment...' : 'Pay & Record Payment'}
      </button>
    </form>
  );
};
