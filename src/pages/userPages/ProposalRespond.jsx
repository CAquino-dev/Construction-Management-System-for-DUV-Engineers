import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProposalRespond = () => {
  const { token } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ error: '', success: '' });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/respond/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage({ error: data.error, success: '' });
        } else {
          setProposal(data);
          console.log(data);
        }
      })
      .catch(() => setMessage({ error: 'Failed to load proposal.', success: '' }))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDecision = async (status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          response: status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ success: `Proposal ${status} successfully.`, error: '' });
    } catch (err) {
      setMessage({ error: err.message, success: '' });
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (message.error) return <p className="p-6 text-red-600">{message.error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-15">
      <h1 className="text-2xl font-bold mb-4">Proposal from {proposal.client_name}</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <p><strong>Project Interest:</strong> {proposal.project_interest}</p>
        <p><strong>Title:</strong> {proposal.title}</p>
        <p><strong>Description:</strong> {proposal.description}</p>
        <p><strong>Budget Estimate:</strong> ₱{proposal.budget_estimate}</p>
        <p><strong>Timeline:</strong> {proposal.timeline_estimate}</p>
        <p><strong>Payment Terms:</strong> {proposal.payment_terms}</p>

        <div>
          <strong>Scope of Work:</strong>
          <ul className="list-disc pl-5">
            {proposal.scope_of_work.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {proposal.file_url && (
          <div>
            <strong>Attached Proposal PDF:</strong><br />
            <a href={`${import.meta.env.VITE_REACT_APP_API_URL}${proposal.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View/Download PDF
            </a>
          </div>
        )}

        {proposal.status === 'pending' ? (
          <div className="flex gap-4 mt-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => handleDecision('approved')}
            >
              Approve
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={() => handleDecision('rejected')}
            >
              Reject
            </button>
          </div>
        ) : (
          <p className="text-green-700 font-semibold mt-4">This proposal has already been {proposal.status}.</p>
        )}

        {message.success && <p className="text-green-600 mt-2">{message.success}</p>}
      </div>
    </div>
  );
};

export default ProposalRespond;
