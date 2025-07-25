import { meta } from "@eslint/js";
import React, { useEffect, useState } from "react";

const FinanceContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
        try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getContracts`);
        const data = await res.json();
        console.log(data);
        setContracts(data);
        } catch (err) {
        console.error("Failed to fetch contracts", err);
        } finally {
        setLoading(false);
        }
    };

    fetchContracts();
  }, []);

const handleAction = async (id, action) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/contracts/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    setContracts(prev => prev.filter(c => c.id !== id));
  } catch (err) {
    console.error(`Failed to ${action} contract`, err);
  }
};


  if (loading) return <div className="text-center mt-10">Loading contracts...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pending Contracts for Review</h1>
      <div className="space-y-6">
        {contracts.map(contract => (
          <div key={contract.id} className="p-4 bg-white shadow rounded-xl border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p><strong>Contract ID:</strong> {contract.id}</p>
                <p><strong>Proposal ID:</strong> {contract.proposal_id}</p>
                <p><strong>Status:</strong> <span className={`capitalize ${contract.status === 'signed' ? 'text-green-600' : 'text-yellow-600'}`}>{contract.status}</span></p>
                {contract.contract_signed_at && (
                  <p><strong>Signed At:</strong> {new Date(contract.contract_signed_at).toLocaleString()}</p>
                )}
              </div>

              <div>
                <p className="font-medium mb-1">View Contract:</p>
                <iframe
                  src={`${import.meta.env.VITE_REACT_APP_API_URL}${contract.contract_file_url}`}
                  className="w-full h-64 border rounded"
                  title={`Contract ${contract.id}`}
                />
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <button
                  onClick={() => handleAction(contract.id, "approve")}
                  className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(contract.id, "reject")}
                  className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {contracts.length === 0 && (
          <p className="text-center text-gray-500">No pending contracts to review.</p>
        )}
      </div>
    </div>
  );
};

export default FinanceContracts;
