import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FinalModal } from "../../components/FinalModal";
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";
import { toast } from "sonner";

const ContractRespond = () => {
  const { contractId } = useParams();
  const [contract, setContract] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ error: "", success: "" });

  const sigPad = useRef();
  const [showSignPad, setShowSignPad] = useState(false);
  const [trimmedSignature, setTrimmedSignature] = useState(null);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Button disable states
  const [isSigned, setIsSigned] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  // Fetch contract
  useEffect(() => {
    const getContract = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/projectManager/contract/${contractId}`
        );
        if (response.ok) {
          const data = await response.json();
          setContract(data);

          // Handle existing status
          if (data.status === "signed") setIsSigned(true);
          if (data.status === "rejected") setIsRejected(true);
        } else {
          setMessage({ error: "Failed to fetch contract.", success: "" });
        }
      } catch (err) {
        setMessage({ error: "An error occurred.", success: "" });
      } finally {
        setLoading(false);
      }
    };
    getContract();
  }, [contractId]);

  const clearSignature = () => sigPad.current.clear();

  // Submit digital signature
  const submitSignature = async () => {
    if (sigPad.current.isEmpty()) {
      toast.error("Please provide a signature.");
      return;
    }

    const dataURL = sigPad.current.getCanvas().toDataURL("image/png");
    setTrimmedSignature(dataURL);
    setShowConfirmModal(false);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/signature`,
        { base64Signature: dataURL, proposalId: contractId }
      );

      toast.success("Signature submitted successfully!");
      setMessage({ success: response.data.message, error: "" });
      setShowSignPad(false);
      setIsSigned(true); // ✅ Disable buttons after success

      // Auto-generate payment schedule + invoice
      try {
        const scheduleRes = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/payments/payment-schedule/${contractId}`
        );

        await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/invoice/send-next`,
          { contractId: scheduleRes.data.contractId }
        );

        toast.success("Invoice sent to client successfully.");
      } catch {
        toast.error("Failed to generate payment schedule or send invoice.");
      }
    } catch (err) {
      toast.error("Signature upload failed.");
      setMessage({
        error: err.response?.data?.error || "Signature upload failed.",
        success: "",
      });
    }
  };

  // Reject contract
  const handleRejectContract = async () => {
    if (!rejectionNotes.trim()) {
      toast.error("Please provide a rejection note.");
      return;
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/contracts/${contractId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_rejection_notes: rejectionNotes }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Contract has been rejected successfully.");
        setMessage({ success: "Contract rejected successfully.", error: "" });
        setShowRejectModal(false);
        setRejectionNotes("");
        setIsRejected(true); // ✅ Disable buttons after rejection
      } else {
        toast.error("Failed to reject contract.");
      }
    } catch {
      toast.error("Error rejecting contract.");
    }
  };

  const handleSignInPerson = async () => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/signInPerson/${contractId}`
      );

      if (response.data.success) {
        toast.success("Contract marked for in-person signing.");
        setMessage({
          success: "Contract marked for in-person signing.",
          error: "",
        });
        setIsSigned(true); // Disable further actions
      }
    } catch (error) {
      console.error("Error marking in-person sign:", error);
      toast.error("Failed to mark contract for in-person signing.");
      setMessage({
        error:
          error.response?.data?.error ||
          "Failed to mark contract for in-person signing.",
        success: "",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (message.error && !contract) {
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Contract Review
              </h1>
              <p className="text-gray-600">
                Contract ID:{" "}
                <span className="font-mono font-semibold">{contractId}</span>
              </p>
            </div>
            <div
              className={`mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm font-medium ${
                contract?.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : contract?.status === "signed"
                  ? "bg-green-100 text-green-800"
                  : contract?.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Status:{" "}
              {contract?.status
                ? contract.status.charAt(0).toUpperCase() +
                  contract.status.slice(1)
                : "Unknown"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Contract PDF */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contract Document
                </h2>

                {contract?.contract_file_url ? (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <iframe
                      src={`${import.meta.env.VITE_REACT_APP_API_URL}${
                        contract.contract_file_url
                      }`}
                      title="Contract PDF"
                      className="w-full h-[70vh] sm:h-[80vh]"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500">
                      No contract document available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Actions & Information */}
          <div className="space-y-6">
            {/* Action Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Actions
              </h3>

              {contract?.status === "draft" && !isSigned && !isRejected ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSignPad(true)}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Sign Digitally
                  </button>

                  <button
                    onClick={handleSignInPerson}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Sign In Person
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
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
                    Reject Contract
                  </button>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-lg text-center ${
                    isSigned
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : isRejected
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-gray-50 text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="font-medium">
                    {isSigned && "✅ This contract has been signed."}
                    {isRejected && "❌ This contract was rejected."}
                    {!isSigned && !isRejected && "No actions available."}
                  </p>
                </div>
              )}
            </div>

            {/* Signature Preview */}
            {trimmedSignature && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Digital Signature
                </h3>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Your signature preview:
                  </p>
                  <img
                    src={trimmedSignature}
                    alt="Signature Preview"
                    className="border-2 border-gray-200 rounded-lg mx-auto max-w-full h-24 object-contain bg-white p-2"
                  />
                </div>
              </div>
            )}

            {/* Status Messages */}
            {message.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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

            {message.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium flex items-center">
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
                  {message.error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <FinalModal isOpen={showSignPad} onClose={() => setShowSignPad(false)}>
        <div className="bg-white rounded-xl max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Sign Contract Digitally
          </h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Please provide your digital signature in the canvas below:
            </p>
            <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-4 flex justify-center">
              <SignatureCanvas
                penColor="black"
                ref={sigPad}
                canvasProps={{
                  width: 400,
                  height: 200,
                  className: "bg-white rounded-md border shadow-inner w-full",
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
              onClick={clearSignature}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear Signature
            </button>

            <div className="flex gap-3">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                onClick={() => setShowSignPad(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                onClick={() => setShowConfirmModal(true)}
              >
                Submit Signature
              </button>
            </div>
          </div>
        </div>
      </FinalModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitSignature}
        title="Confirm Signature Submission"
        message="Are you sure you want to submit this digital signature? Once submitted, this contract will be marked as signed and cannot be undone."
        confirmText="Yes, Submit Signature"
        cancelText="Cancel"
      />

      {/* Rejection Modal */}
      <FinalModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      >
        <div className="bg-white rounded-xl max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-red-600"
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
            Reject Contract
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Please provide a detailed reason for rejecting this contract. This
            information will be shared with relevant parties.
          </p>

          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            rows={4}
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
            placeholder="Enter your reason for rejection here..."
          />

          <div className="flex justify-end gap-3">
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
              onClick={handleRejectContract}
              disabled={!rejectionNotes.trim()}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </FinalModal>
    </div>
  );
};

export default ContractRespond;
