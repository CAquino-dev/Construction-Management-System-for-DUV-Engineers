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
        { base64Signature: dataURL, contractId }
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

  if (loading) return <p className="p-4">Loading contract...</p>;

  const handleSignInPerson = async () => {
    try {
    const response = await axios.put(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/signInPerson/${contractId}`
    );

    if (response.data.success) {
      toast.success("Contract marked for in-person signing.");
      setMessage({ success: "Contract marked for in-person signing.", error: "" });
      setIsSigned(true); // Disable further actions
    }
  } catch (error) {
    console.error("Error marking in-person sign:", error);
    toast.error("Failed to mark contract for in-person signing.");
    setMessage({
      error: error.response?.data?.error || "Failed to mark contract for in-person signing.",
      success: "",
    });
  }
  };

  return (
    <div className="mt-20 px-4 sm:px-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Contract Review</h1>

      {/* Contract PDF */}
      {contract?.contract_file_url ? (
        <iframe
          src={`${import.meta.env.VITE_REACT_APP_API_URL}${
            contract.contract_file_url
          }`}
          title="Contract PDF"
          className="w-full h-[60vh] sm:h-[80vh] rounded-lg border shadow-sm"
        />
      ) : (
        <p>No contract found for this proposal.</p>
      )}

      {/* Action Buttons */}
      {contract?.status === "draft" && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            disabled={isSigned || isRejected}
            className={`px-4 py-2 rounded-lg shadow transition ${
              isSigned || isRejected
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={() => setShowSignPad(true)}
          >
            ✍️ Sign Digitally
          </button>

          <button
            disabled={isSigned || isRejected}
            className={`px-4 py-2 rounded-lg shadow transition ${
              isSigned || isRejected
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={() => handleSignInPerson()}
          >
            🧾 Sign In Person
          </button>

          <button
            disabled={isSigned || isRejected}
            className={`px-4 py-2 rounded-lg shadow transition ${
              isSigned || isRejected
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            onClick={() => setShowRejectModal(true)}
          >
            ❌ Reject Contract
          </button>
        </div>
      )}

      {/* Status Messages */}
      {isSigned && (
        <p className="text-green-700 font-medium mt-4">
          ✅ This contract has been signed.
        </p>
      )}
      {isRejected && (
        <p className="text-red-700 font-medium mt-4">
          ❌ This contract was rejected.
        </p>
      )}

      {/* Signature Preview */}
      {trimmedSignature && (
        <div className="mt-6">
          <p className="font-medium mb-2">Your Digital Signature Preview:</p>
          <img
            src={trimmedSignature}
            alt="Signature Preview"
            className="border w-full max-w-xs rounded shadow"
          />
        </div>
      )}

      {/* Signature Modal */}
      <FinalModal isOpen={showSignPad} onClose={() => setShowSignPad(false)}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Sign Contract Digitally
        </h2>
        <div className="border border-gray-300 bg-gray-50 rounded-lg p-2 flex justify-center">
          <SignatureCanvas
            penColor="black"
            ref={sigPad}
            canvasProps={{
              width: 300,
              height: 150,
              className: "bg-white rounded-md border shadow-inner w-full",
            }}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="bg-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-400 transition"
            onClick={clearSignature}
          >
            Clear
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
            onClick={() => setShowConfirmModal(true)}
          >
            Submit
          </button>
        </div>
      </FinalModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitSignature}
        title="Confirm Signature Submission"
        message="Are you sure you want to submit this digital signature? Once submitted, this contract will be marked as signed."
        confirmText="Yes, Submit"
        cancelText="Cancel"
      />

      {/* Rejection Modal */}
      <FinalModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      >
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Reject Contract
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Please provide a reason for rejecting this contract:
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          rows={4}
          value={rejectionNotes}
          onChange={(e) => setRejectionNotes(e.target.value)}
          placeholder="Enter your reason here..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-400 transition"
            onClick={() => setShowRejectModal(false)}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition"
            onClick={handleRejectContract}
          >
            Confirm Rejection
          </button>
        </div>
      </FinalModal>
    </div>
  );
};

export default ContractRespond;
