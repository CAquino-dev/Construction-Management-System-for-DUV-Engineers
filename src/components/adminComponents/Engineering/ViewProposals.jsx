import React, { useEffect, useState } from 'react';

const ViewProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState({ success: '', error: '', approvalLink: '' });

  useEffect(() => {
    const fetchProposalResponse = async () => {
      const results = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/getProposalResponse`);
      if (results.ok) {
        const data = await results.json();
        setProposals(data);
      }
    };

    fetchProposalResponse();
  }, []);

  const handleGenerateContract = async (proposalId) => {
    setMessage({ success: '', error: '', approvalLink: '' });

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/generateContract/${proposalId}`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error("Failed to generate contract");

      const data = await res.json();

      setMessage({
        success: "Contract generated successfully!",
        error: '',
        approvalLink: `${data.approvalLink}`
      });

    } catch (err) {
      setMessage({ error: err.message || "Error generating contract.", success: '', approvalLink: '' });
      console.error(err);
    }
  };

  return (
    <div className="mt-6 max-w-6xl mx-auto px-4">
      <h2 className="text-xl font-bold mb-4">Submitted Proposals</h2>

      {/* ✅ Success/Error Message */}
      {(message.success || message.error) && (
        <div className={`p-4 mb-6 rounded shadow ${message.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message.success && <p className="font-semibold">{message.success}</p>}
          {message.error && <p className="font-semibold">{message.error}</p>}
          {message.approvalLink && (
            <div className="mt-2">
              <p className="text-sm">Contract Link:</p>
              <a
                href={message.approvalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {message.approvalLink}
              </a>
            </div>
          )}
        </div>
      )}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Responded At</th>
            <th className="border p-2">IP Address</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.title}</td>
              <td className="border p-2">{p.client_name}</td>
              <td className="border p-2 capitalize">{p.status}</td>
              <td className="border p-2">{p.responded_at || 'Pending'}</td>
              <td className="border p-2">{p.approved_by_ip || 'N/A'}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => handleGenerateContract(p.id)}
                >
                  Generate Contract
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewProposals;
