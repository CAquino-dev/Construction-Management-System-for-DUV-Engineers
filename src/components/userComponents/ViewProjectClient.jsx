import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ProjectDetailsClient } from './ProjectDetailsClient';
import { MilestoneClient } from './MilestoneClient';
import { ExpensesClient } from './ExpensesClient';
import { SupplyClient } from './SupplyClient';
import duvLogo from '../../assets/duvLogo.jpg'
import { ClientLegals } from './ClientLegals';
import { ChatClient } from './ChatClient';

const FinancePaymentEntry = ({ selectedProject }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/with-pending-payments`)
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

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

    setLoading(true);

    let finished = false;

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone_id: selectedMilestoneId,
          payment_date: paymentDate,
          amount_paid: amountPaid,
        }),
      });

      if (res.ok) {
        finished = true;
      } else {
        const error = await res.json();
        setMessage(`Payment API error: ${error.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
    } catch (error) {
      setMessage(`Payment API error: ${error.message}`);
      setLoading(false);
      return;
    }

    if (finished) {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/payments/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amountPaid),
            description: `Payment for milestone ${selectedMilestoneId} of project ${selectedProjectId}`,
            success_url: 'http://localhost:3000/payment-success', // Change to your success page URL
            cancel_url: 'http://localhost:3000/payment-cancel',   // Change to your cancel page URL
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

export const ViewProjectClient = ({ selectedProject, onBack }) => {
  const [activeTab, setActiveTab] = useState('projectDetails');

  // Function to handle tab switching
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <Button variant="link" onClick={onBack} className="mb-6 text-[#4c735c]">
        ← Back
      </Button>

      <Card className="p-6 w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            {/* Project Image */}
            <div className="w-full sm:w-1/3 p-2">
              <img
                src={duvLogo}
                alt="Project"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>

            {/* Project Details */}
            <div className="w-full sm:w-2/3 p-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedProject.project_name}
              </h3>
              <div className="flex flex-col gap-1">
                <p className="text-md text-gray-600">
                  <span className="font-semibold">Engineer:</span> {selectedProject.engineer_name}
                </p>
                <p className="text-md text-gray-600">
                  <span className="font-semibold">Start Date:</span> {new Date(selectedProject.start_date).toLocaleDateString()}
                </p>
                <p className="text-md text-gray-600">
                  <span className="font-semibold">End Date:</span> {new Date(selectedProject.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap space-x-4 mb-4 mt-4 justify-center sm:justify-start">
        <button
          onClick={() => handleTabClick('projectDetails')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'projectDetails'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Project Details
        </button>
        <button
          onClick={() => handleTabClick('milestones')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'milestones'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => handleTabClick('legals')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'legals'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Legals
        </button>
        {/* <button
          onClick={() => handleTabClick('expenses')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'expenses'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Expenses Tracking
        </button> */}

        {/* <button
          onClick={() => handleTabClick('supply')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'supply'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Supply
        </button> */}

        <button
          onClick={() => handleTabClick('chat')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'chat'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Chat
        </button>

        <button
          onClick={() => handleTabClick('payment')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'payment'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Payment
        </button>
      </div>

      {/* Tab Content */}
      <Card className="px-1 w-full">
        <CardContent>
          {activeTab === 'projectDetails' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Project Details</h4>
              <ProjectDetailsClient selectedProject={selectedProject} />
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Milestones</h4>
              <MilestoneClient selectedProject={selectedProject} />
            </div>
          )}

          {activeTab === 'legals' && (
              <div className='p-4'>
                  <h4 className='text-lg font-semibold'>Legals Documents</h4>
                  <ClientLegals selectedProject={selectedProject} />
              </div>
          )}

          {/* {activeTab === 'expenses' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Expenses</h4>
              <ExpensesClient selectedProject={selectedProject} />
            </div>
          )} */}

          {/* {activeTab === 'supply' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Supply</h4>
              <SupplyClient selectedProject={selectedProject} />
            </div>
          )} */}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Chat</h4>
              <ChatClient selectedProject={selectedProject} />
            </div>
          )}

          {activeTab === 'payment' && (
              <div className='p-4'>
                  <h4 className='text-lg font-semibold'>Payment</h4>
                  <FinancePaymentEntry selectedProject={selectedProject} />
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
