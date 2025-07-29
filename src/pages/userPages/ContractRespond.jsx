import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useParams } from 'react-router-dom';

const ContractRespond = () => {
  const { proposalId } = useParams();
  const [contractUrl, setContractUrl] = useState('');
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
          setContractUrl(data.contract_file_url);
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
    const dataURL = canvas.toDataURL('image/png');
    setTrimmedSignature(dataURL);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Signature: dataURL,
          proposalId: proposalId
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResponseStatus("Successfully saved the signature!");
        setMessage({ success: data.message, error: '' });
        setShowSignPad(false);
      } else {
        setMessage({ error: data.error || 'Signature upload failed.', success: '' });
      }
    } catch (err) {
      setMessage({ error: 'Error uploading signature.', success: '' });
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

      {contractUrl ? (
        <div className="bg-white p-4 shadow-lg rounded-lg border mb-6">
          <iframe
            src={`${import.meta.env.VITE_REACT_APP_API_URL}${contractUrl}`}
            title="Contract PDF"
            className="w-full h-[600px] rounded border"
            allow="fullscreen"
          />
        </div>
      ) : (
        <p>No contract found for this proposal.</p>
      )}

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
