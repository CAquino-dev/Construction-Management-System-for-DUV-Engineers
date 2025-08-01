import React, { useEffect, useState } from "react";

const FinanceContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getContracts`
        );
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
    let body = {};

    if (action === "reject") {
      const notes = window.prompt("Please provide rejection notes:");
      if (!notes) {
        alert("Rejection cancelled. Notes are required.");
        return;
      }
      body.finance_rejection_notes = notes;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/contracts/${id}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      setContracts((prev) => prev.filter((c) => c.contract_id !== id));
    } catch (err) {
      console.error(`Failed to ${action} contract`, err);
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading contracts...</div>;

  return (
    <div className="h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow h-9/10 px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pending Contracts for Review
        </h1>

        <div className="space-y-4 overflow-y-auto h-8/10 sm:h-9/10 border-1">
          {contracts.map((contract) => (
            <div
              key={contract.contract_id}
              className="p-4 bg-gray-100 shadow rounded-xl border"
            >
              <div className="flex flex-col gap-4">
                {/* Basic Contract Info */}
                <div className="space-y-2">
                  <p>
                    <strong>Contract ID:</strong> {contract.contract_id}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`capitalize ml-2 ${
                        contract.contract_status === "signed"
                          ? "text-green-600"
                          : contract.contract_status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {contract.contract_status}
                    </span>
                  </p>
                  {contract.contract_signed_at && (
                    <p>
                      <strong>Signed At:</strong>{" "}
                      {new Date(
                        contract.contract_signed_at
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Proposal Info */}
                <div className="space-y-1">
                  <hr className="my-2" />
                  <p>
                    <strong>Proposal Title:</strong> {contract.proposal_title}
                  </p>
                  <p>
                    <strong>Budget Estimate:</strong> ₱
                    {parseFloat(contract.budget_estimate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Timeline:</strong> {contract.timeline_estimate}
                  </p>
                  {contract.scope_of_work && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 underline">
                        View Scope of Work
                      </summary>
                      <div className="mt-1 whitespace-pre-wrap text-gray-700 text-sm">
                        {contract.scope_of_work}
                      </div>
                    </details>
                  )}
                </div>

                {/* Client Info */}
                <div className="space-y-1">
                  <hr className="my-2" />
                  <p>
                    <strong>Client Name:</strong> {contract.client_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {contract.client_email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {contract.client_phone}
                  </p>
                  <p>
                    <strong>Project Interest:</strong>{" "}
                    {contract.project_interest}
                  </p>
                </div>

                {/* View Contract */}
                <div>
                  <p className="font-medium mb-1">View Contract:</p>
                  <button
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_REACT_APP_API_URL}${
                          contract.contract_file_url
                        }`,
                        "_blank"
                      )
                    }
                    className="text-blue-500 underline"
                  >
                    View Contract PDF
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row gap-2 justify-end">
                  <button
                    onClick={() =>
                      handleAction(contract.contract_id, "approve")
                    }
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleAction(contract.contract_id, "reject")
                    }
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {contracts.length === 0 && (
            <p className="text-center text-gray-500">
              No pending contracts to review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceContracts;
