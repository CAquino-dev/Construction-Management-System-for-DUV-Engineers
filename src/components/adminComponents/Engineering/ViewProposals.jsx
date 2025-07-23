import React, { useEffect, useState } from 'react';
import PaginationComponent from '../Pagination';

const ViewProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState({ success: '', error: '', approvalLink: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Helper to get status color class
  const getStatusClass = (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'pending') return 'text-yellow-600 font-semibold';
    if (s === 'approve' || s === 'approved') return 'text-green-600 font-semibold';
    return '';
  };

  // Pagination logic
  const totalPages = Math.ceil(proposals.length / itemsPerPage);
  const paginatedProposals = proposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mt-6 mx-auto px-4 bg-white p-6 rounded shadow-md rounded-md">
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
          {paginatedProposals.map((p) => (
            <tr key={p.id}>
              <td className="border p-2 text-center">{p.title}</td>
              <td className="border p-2 text-center">{p.client_name}</td>
              <td className={`border p-2 capitalize text-center ${getStatusClass(p.status)}`}>{p.status}</td>
              <td className={`border p-2 text-center ${!p.responded_at || p.responded_at.toLowerCase() === 'pending' ? 'text-yellow-600 font-semibold' : ''}`}>{p.responded_at || 'Pending'}</td>
              <td className={`border p-2 text-center ${!p.approved_by_ip || p.approved_by_ip.toLowerCase() === 'n/a' ? 'text-gray-400 font-semibold' : ''}`}>{p.approved_by_ip || 'N/A'}</td>
              <td className="border p-2 text-center">
                <button
                  className="bg-[#4c735c] cursor-pointer text-white px-3 py-1 rounded"
                  onClick={() => handleGenerateContract(p.id)}
                >
                  Generate Contract
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default ViewProposals;