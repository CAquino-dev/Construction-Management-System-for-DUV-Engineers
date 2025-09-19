import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ApprovedContracts = () => {
  const navigate = useNavigate(); // ✅ move here
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});
  const [viewMode, setViewMode] = useState("pending"); // "pending" or "signed"

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
        toast.error(`Error: ${result.error || "Failed to send to client."}`);
      } else {
        toast.success("Contract sent to client successfully.");
        fetchApprovedContracts();
      }
    } catch (err) {
      console.error("Error sending contract to client:", err);
      alert("An error occurred while sending the contract.");
    } finally {
      setSending((prev) => ({ ...prev, [contractId]: false }));
    }
  };

  const filteredContracts = contracts.filter((contract) =>
    viewMode === "pending"
      ? contract.contract_status !== "signed"
      : contract.contract_status === "signed"
  );

  if (loading)
    return (
      <div className="text-center mt-10">Loading approved contracts...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 py-4">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg h-full sm:h-[90vh] px-4 py-6 overflow-hidden flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Approved Contracts
        </h1>

        {/* Toggle Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => setViewMode("pending")}
            className={`px-4 py-2 rounded ${
              viewMode === "pending"
                ? "bg-[#4c735c] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Pending to Send
          </button>
          <button
            onClick={() => setViewMode("signed")}
            className={`px-4 py-2 rounded ${
              viewMode === "signed"
                ? "bg-[#4c735c] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Signed Contracts
          </button>
        </div>

        {/* Contract List */}
        <div className="space-y-4 overflow-y-auto flex-1 border-t pt-2">
          {filteredContracts.length === 0 ? (
            <p className="text-gray-500 text-center">
              {viewMode === "pending"
                ? "No contracts pending to send."
                : "No signed contracts found."}
            </p>
          ) : (
            filteredContracts.map((contract) => (
              <div
                key={contract.contract_id}
                className="p-4 bg-gray-100 shadow rounded-xl border"
              >
                <div className="flex flex-col gap-4 text-sm sm:text-base">
                  {/* Basic Info */}
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
                        ? new Date(contract.contract_signed_at).toLocaleString()
                        : "Not signed"}
                    </p>
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
                  </div>

                  {/* View & Action */}
                  <div className="flex flex-col gap-2">
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

                    {contract.access_link && (
                      <a
                        href={contract.access_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Access Link (for Client)
                      </a>
                    )}

                    {/* Conditional Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3">
                      {viewMode === "pending" ? (
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
                      ) : (
                        <div className="text-green-600 font-medium flex items-center">
                          <span>Already Signed</span>
                        </div>
                      )}

                      {viewMode === "signed" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/admin-dashboard/project/create/${contract.contract_id}`
                            )
                          }
                          className="bg-[#4c735c] text-white px-4 py-2 rounded hover:bg-[#4c735c]/80 transition cursor-pointer"
                        >
                          Create Project
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedContracts;
