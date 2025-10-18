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
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/finance/contracts/${id}/${action}`,
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex items-center justify-center">
            <span className="mr-3">💰</span>
            Pending Contracts for Review
          </h1>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📋</span>
              Contracts Awaiting Approval
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {contracts.length} contracts
              </span>
            </h2>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600">
                No pending contracts to review at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-110 overflow-y-auto">
              {contracts.map((contract) => (
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
                          <div className="mt-1 sm:mt-0 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200 whitespace-nowrap">
                            Pending Review
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
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {contract.client_phone}
                        </div>
                        <div>
                          <span className="font-medium">Interest:</span>{" "}
                          {contract.project_interest}
                        </div>
                      </div>
                    </div>

                    {/* Scope of Work */}
                    {contract.scope_of_work && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <details className="group">
                          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                            <span className="flex items-center">
                              <span className="mr-2">📝</span>
                              Scope of Work
                            </span>
                            <span className="text-gray-500 group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>
                          <div className="mt-3 p-3 bg-white rounded border text-sm text-gray-700">
                            {(() => {
                              try {
                                // Try to parse as JSON array first
                                const scopeArray = JSON.parse(
                                  contract.scope_of_work
                                );
                                if (Array.isArray(scopeArray)) {
                                  return scopeArray.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2 mb-2"
                                    >
                                      <span className="text-blue-500 mt-1 flex-shrink-0">
                                        •
                                      </span>
                                      <span className="flex-1">{item}</span>
                                    </div>
                                  ));
                                }
                              } catch (e) {
                                // If parsing fails, check if it's a string with array-like format
                                const cleanScope = contract.scope_of_work
                                  .replace(/^\[/, "")
                                  .replace(/\]$/, "")
                                  .replace(/"/g, "")
                                  .trim();

                                if (cleanScope.includes(",")) {
                                  // Split by commas and clean up
                                  return cleanScope
                                    .split(",")
                                    .map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start space-x-2 mb-2"
                                      >
                                        <span className="text-blue-500 mt-1 flex-shrink-0">
                                          •
                                        </span>
                                        <span className="flex-1">
                                          {item.trim()}
                                        </span>
                                      </div>
                                    ));
                                } else {
                                  // Fallback: treat as regular text with newlines
                                  return contract.scope_of_work
                                    .split("\n")
                                    .map((line, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start space-x-2 mb-2"
                                      >
                                        <span className="text-blue-500 mt-1 flex-shrink-0">
                                          •
                                        </span>
                                        <span className="flex-1">
                                          {line.trim()}
                                        </span>
                                      </div>
                                    ));
                                }
                              }
                              return null;
                            })()}
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {/* Contract Link */}
                      <div>
                        {contract.contract_file_url && (
                          <button
                            onClick={() =>
                              window.open(
                                `${import.meta.env.VITE_REACT_APP_API_URL}${
                                  contract.contract_file_url
                                }`,
                                "_blank"
                              )
                            }
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <span>📄</span>
                            <span>View Contract PDF</span>
                          </button>
                        )}
                      </div>

                      {/* Action Buttons - Stack on mobile, side by side on desktop */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() =>
                            handleAction(contract.contract_id, "approve")
                          }
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            handleAction(contract.contract_id, "reject")
                          }
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>Reject</span>
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

export default FinanceContracts;
