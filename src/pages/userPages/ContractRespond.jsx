import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ContractRespond = () => {
  const { proposalId } = useParams();
  const [contract, setContract] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState('');
  const [message, setMessage] = useState({ error: '', success: '' });

  const sigPad = useRef();
  const [showSignPad, setShowSignPad] = useState(false);
  const [trimmedSignature, setTrimmedSignature] = useState(null);

  useEffect(() => {
    const getContract = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/contract/${proposalId}`);
        if (response.ok) {
          const data = await response.json();
          setContract(data);
        } else {
          setMessage({ error: 'Failed to fetch contract.', success: '' });
        }
      } catch (err) {
        setMessage({ error: 'An error occurred.', success: '' });
      } finally {
        setLoading(false);
      }
    };

    getContract();
  }, [proposalId]);

  const clearSignature = () => sigPad.current.clear();

const handleSaveSignature = async () => {
  if (sigPad.current.isEmpty()) {
    alert("Please provide a signature.");
    return;
  }

  const canvas = sigPad.current.getCanvas();
  const dataURL = canvas.toDataURL("image/png");
  setTrimmedSignature(dataURL);

  try {
    // 1. Save signature
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/signature`,
      {
        base64Signature: dataURL,
        proposalId: proposalId,
      }
    );

    setResponseStatus("Successfully saved the signature!");
    setMessage({ success: response.data.message, error: "" });
    setShowSignPad(false);

    // 2. Auto-generate payment schedule
    try {
      const scheduleRes = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/payments/payment-schedule/${proposalId}`
      );

      console.log("Payment schedule generated:", scheduleRes.data.schedule);

      // 3. Send invoice for the first schedule automatically
      try {
        const invoiceRes = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/invoice/send-next`,
          { contractId: scheduleRes.data.contractId } // use the returned contractId
        );

        console.log("Invoice sent:", invoiceRes.data);
        setMessage(prev => ({ ...prev, success: `Invoice sent to client. ${invoiceRes.data.invoiceNumber}` }));
      } catch (invErr) {
        console.error("Invoice sending failed:", invErr.response?.data || invErr.message);
        setMessage(prev => ({ ...prev, error: "Failed to send invoice." }));
      }

    } catch (err) {
      console.error("Schedule generation failed:", err.response?.data || err.message);
      setMessage(prev => ({ ...prev, error: "Failed to generate payment schedule." }));
    }

  } catch (err) {
    setMessage({
      error: err.response?.data?.error || "Signature upload failed.",
      success: "",
    });
  }
};


  const handleRejectContract = async () => {
    const notes = window.prompt("Please provide a reason for rejection:");
    if (!notes || !notes.trim()) {
      alert("Rejection notes are required.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/contracts/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_rejection_notes: notes }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ success: "Contract rejected successfully.", error: '' });
      } else {
        setMessage({ error: data.error || 'Failed to reject contract.', success: '' });
      }
    } catch (err) {
      setMessage({ error: 'Error rejecting contract.', success: '' });
    }
  };

  if (loading) return <p className="p-4">Loading contract...</p>;

  return (
    <div className="mt-20">
      <h1 className="text-2xl font-bold mb-4">Contract Review</h1>

      {contract?.contract_file_url ? (
        <iframe
          src={`${import.meta.env.VITE_REACT_APP_API_URL}${contract.contract_file_url}`}
          title="Contract PDF"
          className="w-full h-[600px] rounded border"
        />
      ) : (
        <p>No contract found for this proposal.</p>
      )}

      {/* Action buttons */}
      {contract?.status === "draft" && (
        <div className="flex gap-4 mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowSignPad(true)}
          >
            Sign Digitally
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Sign In Person
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleRejectContract}
          >
            Reject Contract
          </button>
        </div>
      )}

      {contract?.status === "signed" && (
        <p className="text-green-700 font-medium mt-4">
          ✅ This contract has already been signed.
        </p>
      )}

      {contract?.status === "rejected" && (
        <p className="text-red-700 font-medium mt-4">
          ❌ This contract was rejected.
        </p>
      )}

      {showSignPad && (
        <div className="border p-4 bg-gray-50 rounded">
          <SignatureCanvas
            penColor="black"
            ref={sigPad}
            canvasProps={{ width: 500, height: 200, className: 'border border-black' }}
          />
          <div className="mt-2 flex gap-2">
            <button className="bg-gray-300 px-3 py-1 rounded" onClick={clearSignature}>Clear</button>
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleSaveSignature}>Submit Signature</button>
          </div>
        </div>
      )}

      {trimmedSignature && (
        <div className="mt-4">
          <p className="mb-2 font-medium">Preview:</p>
          <img src={trimmedSignature} alt="Signature Preview" className="border w-[300px]" />
        </div>
      )}

      {responseStatus && (
        <p className="mt-4 font-medium text-green-700">{responseStatus}</p>
      )}

      {message.error && (
        <p className="text-red-600 mt-2">{message.error}</p>
      )}
      {message.success && (
        <p className="text-green-600 mt-2">{message.success}</p>
      )}
    </div>
  );
};

export default ContractRespond;