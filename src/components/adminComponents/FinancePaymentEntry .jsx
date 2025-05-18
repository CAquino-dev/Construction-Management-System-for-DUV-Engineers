import React, { useEffect, useState } from 'react';

export const FinancePaymentEntry = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');

  // Fetch projects with pending payments on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/with-pending-payments`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error);
  }, []);

  // Fetch milestones when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setMilestones([]);
      setSelectedMilestoneId('');
      setAmountPaid('');
      return;
    }

    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/${selectedProjectId}/milestones/for-payment`)
      .then(res => res.json())
      .then(data => setMilestones(data))
      .catch(console.error);
  }, [selectedProjectId]);

  // Update amountPaid when milestone changes
  useEffect(() => {
    const milestone = milestones.find(m => m.id === selectedMilestoneId);
    if (milestone) setAmountPaid(milestone.payment_amount.toFixed(2));
    else setAmountPaid('');
  }, [selectedMilestoneId, milestones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!selectedProjectId) return setMessage('Please select a project.');
    if (!selectedMilestoneId) return setMessage('Please select a milestone.');
    if (!amountPaid || isNaN(amountPaid)) return setMessage('Please enter a valid amount.');

    const payload = {
      milestone_id: selectedMilestoneId,
      payment_date: paymentDate,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      remarks,
    };

    const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMessage('Payment recorded successfully!');
      // Reset form
      setSelectedProjectId('');
      setMilestones([]);
      setSelectedMilestoneId('');
      setAmountPaid('');
      setRemarks('');
      setPaymentMethod('Cash');
      setPaymentDate(new Date().toISOString().slice(0, 10));
    } else {
      setMessage('Error recording payment.');
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
        >
          <option value="">-- Select project --</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.project_name}
            </option>
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
          disabled={!selectedProjectId}
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
        Payment Date:
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="block w-full border p-2"
          required
        />
      </label>

      <label>
        Amount Paid:
        <input
          type="number"
          step="0.01"
          min="0"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="block w-full border p-2"
          required
        />
      </label>

      <label>
        Payment Method:
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="block w-full border p-2"
          required
        >
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Check">Check</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label>
        Remarks:
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="block w-full border p-2"
          rows={3}
        />
      </label>

      <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">
        Record Payment
      </button>
    </form>
  );
};
