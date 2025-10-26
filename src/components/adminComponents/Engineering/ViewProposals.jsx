import React, { useEffect, useState } from "react";
import PaginationComponent from "../Pagination";
import ConfirmationModal from "../ConfirmationModal";

const ViewProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState({
    success: "",
    error: "",
    approvalLink: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const itemsPerPage = 5;
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  useEffect(() => {
    const fetchProposalResponse = async () => {
      try {
        const results = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/projectManager/getProposalResponse`
        );
        if (results.ok) {
          const data = await results.json();
          setProposals(data);
        }
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
      }
    };

    fetchProposalResponse();
  }, []);

  const handleOpenConfirm = (proposalId) => {
    setSelectedProposalId(proposalId);
    setIsConfirmModalOpen(true);
  };

  const handleGenerateContract = async (proposalId) => {
    setMessage({ success: "", error: "", approvalLink: "" });

    // Set loading state for this specific proposal
    setLoadingStates((prev) => ({
      ...prev,
      [proposalId]: true,
    }));

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/generateContract/${proposalId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Failed to generate contract");

      const data = await res.json();

      setMessage({
        success:
          "Contract generated successfully! Sent to finance for approval",
        error: "",
        approvalLink: `${data.approvalLink}`,
      });

      // Refresh proposals to update status
      const results = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/getProposalResponse`
      );
      if (results.ok) {
        const updatedData = await results.json();
        setProposals(updatedData);
      }
    } catch (err) {
      setMessage({
        error: err.message || "Error generating contract.",
        success: "",
        approvalLink: "",
      });
      console.error(err);
    } finally {
      // Clear loading state regardless of success or failure
      setLoadingStates((prev) => ({
        ...prev,
        [proposalId]: false,
      }));
    }
  };

  // ✅ Helper to get status color class and badge
  const getStatusInfo = (status) => {
    if (!status) return { class: "", badge: "bg-gray-100 text-gray-800" };
    const s = status.toLowerCase();

    if (s === "pending")
      return {
        class: "text-yellow-800",
        badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      };
    if (s === "approve" || s === "approved")
      return {
        class: "text-green-800",
        badge: "bg-green-100 text-green-800 border border-green-200",
      };
    if (s === "rejected" || s === "reject")
      return {
        class: "text-red-800",
        badge: "bg-red-100 text-red-800 border border-red-200",
      };

    return { class: "", badge: "bg-gray-100 text-gray-800" };
  };

  // ✅ Helper to check if button should be disabled
  const isButtonDisabled = (status, proposalId) => {
    if (!status) return loadingStates[proposalId] || false;
    const s = status.toLowerCase();
    return loadingStates[proposalId] || s === "pending" || s === "rejected";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString.toLowerCase() === "pending") return "Pending";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Parse scope of work safely
  const parseScopeOfWork = (scopeString) => {
    if (!scopeString) return [];
    try {
      // Handle different formats in your data
      if (scopeString.startsWith('"')) {
        scopeString = scopeString.replace(/^"+|"+$/g, "");
      }
      if (scopeString.includes('\\"')) {
        scopeString = scopeString.replace(/\\"/g, '"');
      }
      const parsed = JSON.parse(scopeString);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("Error parsing scope of work:", error);
      return [scopeString];
    }
  };

  // Toggle proposal details
  const toggleProposalDetails = (proposalId) => {
    setExpandedProposal(expandedProposal === proposalId ? null : proposalId);
  };

  // Pagination logic
  const totalPages = Math.ceil(proposals.length / itemsPerPage);
  const paginatedProposals = proposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mt-6 mx-auto px-4 bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
        Submitted Proposals
      </h2>

      {/* ✅ Success/Error Message */}
      {(message.success || message.error) && (
        <div
          className={`p-4 mb-6 rounded-lg shadow ${
            message.error
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          <div className="flex items-center">
            <span
              className={`text-lg mr-2 ${
                message.error ? "text-red-500" : "text-green-500"
              }`}
            >
              {message.error ? "⚠️" : "✅"}
            </span>
            <p className="font-semibold">{message.success || message.error}</p>
          </div>
        </div>
      )}

      {/* Table for md+ screens */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">
                Proposal Details
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">
                Client
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">
                Status
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">
                Submitted
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">
                Responded
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProposals.map((p) => {
              const statusInfo = getStatusInfo(p.status);
              const scopeOfWork = parseScopeOfWork(p.scope_of_work);
              const isLoading = loadingStates[p.id];

              return (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-gray-50 transition-colors border-b">
                    <td className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {p.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {p.description
                              ? `${p.description.substring(0, 60)}${
                                  p.description.length > 60 ? "..." : ""
                                }`
                              : "No description"}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleProposalDetails(p.id)}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                        >
                          {expandedProposal === p.id ? "▲" : "▼"}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {p.client_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badge}`}
                      >
                        {p.status
                          ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(p.responded_at)}
                    </td>
                    <td className="p-4">
                      <button
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center min-w-[140px] ${
                          isButtonDisabled(p.status, p.id)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#4c735c] text-white hover:bg-[#3a5a48] cursor-pointer shadow-sm"
                        }`}
                        onClick={() => handleOpenConfirm(p.id)}
                        disabled={isButtonDisabled(p.status, p.id)}
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          "Generate Contract"
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedProposal === p.id && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan="6" className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-4">
                            <div>
                              <span className="font-semibold text-gray-700">
                                Description:
                              </span>
                              <p className="mt-1 text-gray-600">
                                {p.description || "No description provided"}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                Scope of Work:
                              </span>
                              <ul className="mt-1 space-y-1 text-gray-600">
                                {scopeOfWork.map((item, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-green-600 mr-2 mt-1">
                                      •
                                    </span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <span className="font-semibold text-gray-700">
                                Timeline:
                              </span>
                              <p className="mt-1 text-gray-600">
                                {p.start_date && p.end_date
                                  ? `${new Date(
                                      p.start_date
                                    ).toLocaleDateString()} - ${new Date(
                                      p.end_date
                                    ).toLocaleDateString()}`
                                  : "Not specified"}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                Payment Terms:
                              </span>
                              <p className="mt-1 text-gray-600">
                                {p.payment_terms || "Not specified"}
                              </p>
                            </div>
                            {p.approved_by_ip &&
                              p.approved_by_ip.toLowerCase() !== "n/a" && (
                                <div>
                                  <span className="font-semibold text-gray-700">
                                    Approved By IP:
                                  </span>
                                  <p className="mt-1 text-gray-600">
                                    {p.approved_by_ip}
                                  </p>
                                </div>
                              )}
                            {/* Rejection Message Display */}
                            {p.status &&
                              p.status.toLowerCase() === "rejected" &&
                              p.rejection_notes && (
                                <div>
                                  <span className="font-semibold text-red-700">
                                    Rejection Reason:
                                  </span>
                                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800">
                                      {p.rejection_notes}
                                    </p>
                                  </div>
                                </div>
                              )}
                            {p.status &&
                              p.status.toLowerCase() === "rejected" &&
                              !p.rejection_notes && (
                                <div>
                                  <span className="font-semibold text-red-700">
                                    Rejection Reason:
                                  </span>
                                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 italic">
                                      No reason provided
                                    </p>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedProposals.map((p) => {
          const statusInfo = getStatusInfo(p.status);
          const scopeOfWork = parseScopeOfWork(p.scope_of_work);
          const isLoading = loadingStates[p.id];

          return (
            <div
              key={p.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {p.title}
                  </h3>
                  <p className="text-gray-600">{p.client_name}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}
                >
                  {p.status
                    ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
                    : "Unknown"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-semibold">Submitted:</span>{" "}
                  {formatDate(p.created_at)}
                </div>
                <div>
                  <span className="font-semibold">Responded:</span>{" "}
                  {formatDate(p.responded_at)}
                </div>
                {p.approved_by_ip &&
                  p.approved_by_ip.toLowerCase() !== "n/a" && (
                    <div>
                      <span className="font-semibold">Approved By:</span>{" "}
                      {p.approved_by_ip}
                    </div>
                  )}
              </div>

              {/* Expandable Details */}
              {expandedProposal === p.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Description:
                    </span>
                    <p className="mt-1 text-gray-600">
                      {p.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Scope of Work:
                    </span>
                    <ul className="mt-1 space-y-1 text-gray-600">
                      {scopeOfWork.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Timeline:
                    </span>
                    <p className="mt-1 text-gray-600">
                      {p.start_date && p.end_date
                        ? `${new Date(
                            p.start_date
                          ).toLocaleDateString()} - ${new Date(
                            p.end_date
                          ).toLocaleDateString()}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Payment Terms:
                    </span>
                    <p className="mt-1 text-gray-600">
                      {p.payment_terms || "Not specified"}
                    </p>
                  </div>

                  {/* Rejection Message Display */}
                  {p.status &&
                    p.status.toLowerCase() === "rejected" &&
                    p.rejection_notes && (
                      <div>
                        <span className="font-semibold text-red-700">
                          Rejection Reason:
                        </span>
                        <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800">{p.rejection_notes}</p>
                        </div>
                      </div>
                    )}
                  {p.status &&
                    p.status.toLowerCase() === "rejected" &&
                    !p.rejection_notes && (
                      <div>
                        <span className="font-semibold text-red-700">
                          Rejection Reason:
                        </span>
                        <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 italic">
                            No reason provided
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => toggleProposalDetails(p.id)}
                  className="text-[#4c735c] hover:text-[#3a5a48] font-medium text-sm transition-colors"
                >
                  {expandedProposal === p.id ? "Show Less" : "View Details"}
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center min-w-[140px] ${
                    isButtonDisabled(p.status, p.id)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#4c735c] text-white hover:bg-[#3a5a48] cursor-pointer shadow-sm"
                  }`}
                  onClick={() => handleOpenConfirm(p.id)}
                  disabled={isButtonDisabled(p.status, p.id)}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Contract"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {proposals.length > 0 && (
        <div className="flex justify-center mt-6">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {proposals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-500">
            No Proposals Found
          </h3>
          <p className="text-gray-400 mt-2">
            There are no submitted proposals to display.
          </p>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          if (selectedProposalId) {
            handleGenerateContract(selectedProposalId);
          }
          setIsConfirmModalOpen(false);
        }}
        actionType="Generate Contract"
      />
    </div>
  );
};

export default ViewProposals;
