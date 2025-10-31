import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";

const ProposalRespond = () => {
  const { token } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ error: "", success: "" });
  const [showRejectionPrompt, setShowRejectionPrompt] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_REACT_APP_API_URL
      }/api/projectManager/respond/${token}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage({ error: data.error, success: "" });
        } else {
          setProposal(data);
        }
      })
      .catch(() =>
        setMessage({ error: "Failed to load proposal.", success: "" })
      )
      .finally(() => setLoading(false));
  }, [token]);

  const handleDecision = async (status) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            response: status,
            notes: status === "rejected" ? rejectionNotes : undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ success: `Proposal ${status} successfully.`, error: "" });
      setProposal({ ...proposal, status }); // update UI
      setShowRejectionPrompt(false);
      setRejectionNotes("");
    } catch (err) {
      setMessage({ error: err.message, success: "" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{message.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Proposal Review
              </h1>
              <p className="text-gray-600">
                From:{" "}
                <span className="font-semibold">{proposal.client_name}</span>
              </p>
            </div>
            <div
              className={`mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm font-medium ${
                proposal.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : proposal.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Status:{" "}
              {proposal.status.charAt(0).toUpperCase() +
                proposal.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Proposal Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Project Interest
                </label>
                <p className="text-gray-900 font-medium">
                  {proposal.project_interest}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Title
                </label>
                <p className="text-gray-900 font-medium">{proposal.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Budget Estimate
                </label>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{proposal.budget_estimate?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Timeline
                </label>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-500">Start:</span>
                    <p className="text-gray-900 font-medium">
                      {new Date(proposal.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div>
                    <span className="text-gray-500">End:</span>
                    <p className="text-gray-900 font-medium">
                      {new Date(proposal.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Payment Terms
                </label>
                <p className="text-gray-900 font-medium">
                  {proposal.payment_terms}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Description
            </label>
            <p className="text-gray-900 leading-relaxed">
              {proposal.description}
            </p>
          </div>

          {/* Scope of Work */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Scope of Work
            </label>
            <ul className="space-y-2">
              {proposal.scope_of_work.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* File Attachment */}
          {proposal.file_url && (
            <div className="p-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-3">
                Attached Proposal
              </label>
              <a
                href={`${import.meta.env.VITE_REACT_APP_API_URL}${
                  proposal.file_url
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View/Download PDF
              </a>
            </div>
          )}

          {/* Action Buttons */}
          {proposal.status === "pending" && (
            <div className="p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  onClick={() => setShowConfirmApprove(true)}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve Proposal
                </button>

                <button
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                  onClick={() => setShowRejectionPrompt(true)}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reject Proposal
                </button>
              </div>

              {/* Rejection Notes */}
              {showRejectionPrompt && (
                <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Reason for Rejection
                  </h3>
                  <p className="text-red-700 mb-4">
                    Please provide a detailed reason for rejecting this
                    proposal. This will be shared with the client.
                  </p>
                  <textarea
                    className="w-full border border-red-300 rounded-lg p-4 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={4}
                    placeholder="Enter your reasons for rejection..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
                      onClick={() => setShowConfirmReject(true)}
                      disabled={!rejectionNotes.trim()}
                    >
                      Confirm Rejection
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      onClick={() => {
                        setShowRejectionPrompt(false);
                        setRejectionNotes("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {proposal.status !== "pending" && (
            <div className="p-6 bg-gray-50">
              <div
                className={`p-4 rounded-lg text-center ${
                  proposal.status === "approved"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <p className="font-medium">
                  This proposal has been{" "}
                  <span className="font-bold">{proposal.status}</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {message.success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {message.success}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {showConfirmApprove && (
        <ConfirmationModal
          isOpen={showConfirmApprove}
          onClose={() => setShowConfirmApprove(false)}
          onConfirm={() => {
            handleDecision("approved");
            setShowConfirmApprove(false);
          }}
          actionType="Approve"
        />
      )}

      {showConfirmReject && (
        <ConfirmationModal
          isOpen={showConfirmReject}
          onClose={() => setShowConfirmReject(false)}
          onConfirm={() => {
            handleDecision("rejected");
            setShowConfirmReject(false);
            setShowRejectionPrompt(false);
          }}
          actionType="Reject this"
          setRemark={setRejectionNotes}
        />
      )}
    </div>
  );
};

export default ProposalRespond;
