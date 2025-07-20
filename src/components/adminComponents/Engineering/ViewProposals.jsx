import React, { useEffect, useState } from 'react';

const ViewProposals = () => {
  const [proposals, setProposals] = useState([]);

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
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/generateContract/${proposalId}`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error("Failed to generate contract");

      const data = await res.json();
      alert("Contract generated!");
      window.open(`${import.meta.env.VITE_REACT_APP_API_URL}${data.fileUrl}`, '_blank');
    } catch (err) {
      alert("Error generating contract.");
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Submitted Proposals</h2>
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
