import React, { useEffect, useState } from "react";

const ApprovedContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});

  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    fetchApprovedContracts();
  }, []);

  const fetchApprovedContracts = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/projectManager/getApprovedContracts`
      );
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      console.error("Failed to fetch approved contracts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToClient = async (contractId) => {
    setSending((prev) => ({ ...prev, [contractId]: true }));

    try {
      const res = await fetch(
        `${BASE_URL}/api/projectManager/contract/send-to-client/${contractId}`,
        {
          method: "POST",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(`Error: ${result.error || "Failed to send to client."}`);
      } else {
        alert("Contract sent to client successfully.");
        fetchApprovedContracts();
      }
    } catch (err) {
      console.error("Error sending contract to client:", err);
      alert("An error occurred while sending the contract.");
    } finally {
      setSending((prev) => ({ ...prev, [contractId]: false }));
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10">Loading approved contracts...</div>
    );

  return (
    <div className="h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow h-9/10 px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Approved Contracts
        </h1>

        <div className="space-y-4 overflow-y-auto h-8/10 sm:h-9/10 border-1">
          {contracts.length === 0 ? (
            <p className="text-gray-500 text-center">
              No approved contracts found.
            </p>
          ) : (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <div
                  key={contract.contract_id}
                  className="p-4 bg-gray-100 shadow rounded-xl border"
                >
                  <div className="flex flex-col gap-4">
                    {/* Basic Contract Info */}
                    <div className="space-y-1">
                      <p>
                        <strong>Contract ID:</strong> {contract.contract_id}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className="text-green-600 capitalize">
                          {contract.contract_status}
                        </span>
                      </p>
                      <p>
                        <strong>Signed At:</strong>{" "}
                        {contract.contract_signed_at
                          ? new Date(
                              contract.contract_signed_at
                            ).toLocaleString()
                          : "Not signed"}
                      </p>
                    </div>

                    {/* Proposal Info */}
                    <div className="space-y-1">
                      <hr className="my-2" />
                      <p>
                        <strong>Proposal Title:</strong>{" "}
                        {contract.proposal_title}
                      </p>
                      <p>
                        <strong>Budget Estimate:</strong> ₱
                        {parseFloat(
                          contract.budget_estimate
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>Timeline:</strong>{" "}
                        {contract.timeline_estimate}
                      </p>
                      {contract.scope_of_work && (
                        <details className="mt-1">
                          <summary className="text-blue-600 underline cursor-pointer">
                            View Scope of Work
                          </summary>
                          <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
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

                    {/* Contract Links */}
                    <div>
                      <p className="font-medium mb-1">View Contract:</p>
                      <a
                        href={contract.contract_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        View Contract PDF
                      </a>
                    </div>

                    {/* Access Link + Button */}
                    <div className="flex flex-col justify-between">
                      {contract.access_link && (
                        <a
                          href={contract.access_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mb-3"
                        >
                          Access Link (for Client)
                        </a>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            handleSendToClient(contract.contract_id)
                          }
                          disabled={sending[contract.contract_id]}
                          className={`bg-[#4c735c] text-white px-4 py-2 rounded hover:bg-[#4c735c]/80 transition ${
                            sending[contract.contract_id]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {sending[contract.contract_id]
                            ? "Sending..."
                            : "Send to Client"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedContracts;
