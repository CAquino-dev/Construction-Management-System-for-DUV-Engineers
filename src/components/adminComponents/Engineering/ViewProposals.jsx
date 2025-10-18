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
        success: "Contract generated successfully! Sent to finance for approval",
        error: "",
        approvalLink: `${data.approvalLink}`,
      });
      
      // Refresh proposals to update status
      const results = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/getProposalResponse`
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
    }
  };

  // ✅ Helper to get status color class and badge
  const getStatusInfo = (status) => {
    if (!status) return { class: "", badge: "bg-gray-100 text-gray-800" };
    const s = status.toLowerCase();
    
    if (s === "pending") 
      return { class: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800 border border-yellow-200" };
    if (s === "approve" || s === "approved")
      return { class: "text-green-800", badge: "bg-green-100 text-green-800 border border-green-200" };
    if (s === "rejected" || s === "reject") 
      return { class: "text-red-800", badge: "bg-red-100 text-red-800 border border-red-200" };
    
    return { class: "", badge: "bg-gray-100 text-gray-800" };
  };

  // ✅ Helper to check if button should be disabled
  const isButtonDisabled = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === "pending" || s === "rejected";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString.toLowerCase() === "pending") return "Pending";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Submitted Proposals</h2>

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
            <span className={`text-lg mr-2 ${message.error ? "text-red-500" : "text-green-500"}`}>
              {message.error ? "⚠️" : "✅"}
            </span>
            <p className="font-semibold">{message.success || message.error}</p>
          </div>
          {message.approvalLink && (
            <div className="mt-2 pl-6">
              <p className="text-sm font-medium">Approval Link:</p>
              <a
                href={message.approvalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all text-sm"
              >
                {message.approvalLink}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Table for md+ screens */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">Proposal Details</th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">Client</th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">Status</th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">Responded At</th>
              <th className="p-4 text-left font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProposals.map((p) => {
              const statusInfo = getStatusInfo(p.status);
              return (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-gray-50 transition-colors border-b">
                    <td className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{p.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Budget: ₱{p.budget_estimate || "N/A"}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleProposalDetails(p.id)}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded"
                        >
                          {expandedProposal === p.id ? "▲" : "▼"}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{p.client_name}</div>
                      {p.email && (
                        <div className="text-sm text-gray-500">{p.email}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badge}`}>
                        {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Unknown"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(p.responded_at)}
                    </td>
                    <td className="p-4">
                      <button
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          isButtonDisabled(p.status)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#4c735c] text-white hover:bg-[#3a5a48] cursor-pointer shadow-sm"
                        }`}
                        onClick={() => handleOpenConfirm(p.id)}
                        disabled={isButtonDisabled(p.status)}
                      >
                        Generate Contract
                      </button>
                    </td>
                  </tr>
                  {expandedProposal === p.id && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan="5" className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Description:</span>
                            <p className="mt-1 text-gray-600">{p.description || "No description provided"}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Scope of Work:</span>
                            <ul className="mt-1 list-disc list-inside text-gray-600">
                              {p.scope_of_work && JSON.parse(p.scope_of_work).map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Timeline:</span>
                            <p className="mt-1 text-gray-600">
                              {p.start_date && p.end_date 
                                ? `${new Date(p.start_date).toLocaleDateString()} - ${new Date(p.end_date).toLocaleDateString()}`
                                : "Not specified"
                              }
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Payment Terms:</span>
                            <p className="mt-1 text-gray-600">{p.payment_terms || "Not specified"}</p>
                          </div>
                          {p.approved_by_ip && p.approved_by_ip.toLowerCase() !== "n/a" && (
                            <div>
                              <span className="font-semibold text-gray-700">IP Address:</span>
                              <p className="mt-1 text-gray-600">{p.approved_by_ip}</p>
                            </div>
                          )}
                          {/* Rejection Message Display */}
                          {p.status && p.status.toLowerCase() === "rejected" && p.rejection_notes && (
                            <div className="col-span-2">
                              <span className="font-semibold text-red-700">Rejection Reason:</span>
                              <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800">{p.rejection_notes}</p>
                              </div>
                            </div>
                          )}
                          {p.status && p.status.toLowerCase() === "rejected" && !p.rejection_notes && (
                            <div className="col-span-2">
                              <span className="font-semibold text-red-700">Rejection Reason:</span>
                              <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 italic">No reason provided</p>
                              </div>
                            </div>
                          )}
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
          return (
            <div
              key={p.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{p.title}</h3>
                  <p className="text-gray-600">{p.client_name}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                  {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Unknown"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-semibold">Budget:</span> ₱{p.budget_estimate || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Responded:</span> {formatDate(p.responded_at)}
                </div>
                {p.email && (
                  <div>
                    <span className="font-semibold">Email:</span> {p.email}
                  </div>
                )}
                {p.approved_by_ip && p.approved_by_ip.toLowerCase() !== "n/a" && (
                  <div>
                    <span className="font-semibold">IP:</span> {p.approved_by_ip}
                  </div>
                )}
              </div>

              {/* Expandable Details */}
              {expandedProposal === p.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Description:</span>
                    <p className="mt-1 text-gray-600">{p.description || "No description provided"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Scope of Work:</span>
                    <ul className="mt-1 list-disc list-inside text-gray-600 pl-2">
                      {p.scope_of_work && JSON.parse(p.scope_of_work).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Timeline:</span>
                    <p className="mt-1 text-gray-600">
                      {p.start_date && p.end_date 
                        ? `${new Date(p.start_date).toLocaleDateString()} - ${new Date(p.end_date).toLocaleDateString()}`
                        : "Not specified"
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Payment Terms:</span>
                    <p className="mt-1 text-gray-600">{p.payment_terms || "Not specified"}</p>
                  </div>
                  
                  {/* Rejection Message Display */}
                  {p.status && p.status.toLowerCase() === "rejected" && p.rejection_message && (
                    <div>
                      <span className="font-semibold text-red-700">Rejection Reason:</span>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{p.rejection_message}</p>
                      </div>
                    </div>
                  )}
                  {p.status && p.status.toLowerCase() === "rejected" && !p.rejection_message && (
                    <div>
                      <span className="font-semibold text-red-700">Rejection Reason:</span>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 italic">No reason provided</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => toggleProposalDetails(p.id)}
                  className="text-[#4c735c] hover:text-[#3a5a48] font-medium text-sm"
                >
                  {expandedProposal === p.id ? "Show Less" : "View Details"}
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isButtonDisabled(p.status)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#4c735c] text-white hover:bg-[#3a5a48] cursor-pointer shadow-sm"
                  }`}
                  onClick={() => handleOpenConfirm(p.id)}
                  disabled={isButtonDisabled(p.status)}
                >
                  Generate Contract
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
          <h3 className="text-lg font-semibold text-gray-500">No Proposals Found</h3>
          <p className="text-gray-400 mt-2">There are no submitted proposals to display.</p>
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