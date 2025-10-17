import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ApprovedContracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});
  const [viewMode, setViewMode] = useState("pending");

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
      toast.error("Failed to load contracts");
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
      toast.error("An error occurred while sending the contract.");
    } finally {
      setSending((prev) => ({ ...prev, [contractId]: false }));
    }
  };

  const filteredContracts = contracts.filter((contract) =>
    viewMode === "pending"
      ? contract.contract_status !== "signed"
      : contract.contract_status === "signed"
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approved contracts...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex items-center justify-center">
            <span className="mr-3">📋</span>
            Approved Contracts
          </h1>
        </div>

        {/* Toggle Buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={() => setViewMode("pending")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === "pending"
                  ? "bg-[#4c735c] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending to Send
            </button>
            <button
              onClick={() => setViewMode("signed")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === "signed"
                  ? "bg-[#4c735c] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Signed Contracts
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {contracts.filter((c) => c.contract_status !== "signed").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter((c) => c.contract_status === "signed").length}
            </div>
            <div className="text-sm text-gray-600">Signed</div>
          </div>
        </div>

        {/* Contract List */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">
                {viewMode === "pending" ? "📤" : "✅"}
              </span>
              {viewMode === "pending"
                ? "Pending Contracts"
                : "Signed Contracts"}
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {filteredContracts.length} contracts
              </span>
            </h2>
          </div>

          {filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">
                {viewMode === "pending" ? "📤" : "✅"}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {viewMode === "pending"
                  ? "No Pending Contracts"
                  : "No Signed Contracts"}
              </h3>
              <p className="text-gray-600">
                {viewMode === "pending"
                  ? "All contracts have been sent to clients or are awaiting approval."
                  : "No contracts have been signed by clients yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.contract_id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {contract.proposal_title}
                          </h3>
                          <div
                            className={`mt-1 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              contract.contract_status
                            )} whitespace-nowrap`}
                          >
                            {contract.contract_status}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Contract ID: {contract.contract_id}
                        </p>
                      </div>
                    </div>

                    {/* Contract Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">💰</span>
                          <span className="font-medium">Budget:</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ₱
                          {parseFloat(
                            contract.budget_estimate
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">⏱️</span>
                          <span className="font-medium">Timeline:</span>
                        </div>
                        <p>{contract.timeline_estimate}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">📅</span>
                          <span className="font-medium">Signed:</span>
                        </div>
                        <p>
                          {contract.contract_signed_at
                            ? new Date(
                                contract.contract_signed_at
                              ).toLocaleDateString()
                            : "Not signed"}
                        </p>
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">👤</span>
                        Client Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {contract.client_name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {contract.client_email}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium">Phone:</span>{" "}
                          {contract.client_phone}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {/* Contract Links */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {contract.contract_file_url && (
                          <a
                            href={contract.contract_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <span>📄</span>
                            <span>View Contract PDF</span>
                          </a>
                        )}
                        {contract.access_link && (
                          <a
                            href={contract.access_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                          >
                            <span>🔗</span>
                            <span>Client Access Link</span>
                          </a>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {viewMode === "pending" ? (
                          <button
                            onClick={() =>
                              handleSendToClient(contract.contract_id)
                            }
                            disabled={sending[contract.contract_id]}
                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors flex items-center space-x-2 ${
                              sending[contract.contract_id]
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#4c735c] hover:bg-[#3a5a4a]"
                            }`}
                          >
                            {sending[contract.contract_id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <span>Send to Client</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 text-green-600 font-medium px-3 py-2">
                              <span>✅</span>
                              <span>Signed</span>
                            </div>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin-dashboard/project/create/${contract.contract_id}`
                                )
                              }
                              className="px-4 py-2 bg-[#4c735c] hover:bg-[#3a5a4a] text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                            >
                              <span>Create Project</span>
                            </button>
                          </>
                        )}
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
