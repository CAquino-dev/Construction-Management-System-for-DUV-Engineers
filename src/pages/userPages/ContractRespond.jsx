import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ContractRespond = () => {
  const { proposalId } = useParams();
  const [contractUrl, setContractUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState('');
  const [message, setMessage] = useState({ error: '', success: '' });

  useEffect(() => {
    const getContract = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/contract/${proposalId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("contract url", data);
          setContractUrl(data.contract_file_url); // ✅ Fix here
        } else {
          setMessage({ error: 'Failed to fetch contract.', success: '' });
        }
      } catch (err) {
        console.error(err);
        setMessage({ error: 'An error occurred.', success: '' });
      } finally {
        setLoading(false);
      }
    };

    getContract();
  }, [proposalId]);

  const respondToContract = async (action) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/respondToContract`, {
        proposal_id: proposalId,
        action, // 'digital', 'in_person', 'rejected'
      });

      setResponseStatus(`Successfully submitted: ${action}`);
    } catch (err) {
      console.error('Failed to submit response:', err);
      setResponseStatus('Failed to submit response');
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

      <div className="flex gap-4">
        <button
          onClick={() => respondToContract('digital')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign Digitally
        </button>
        <button
          onClick={() => respondToContract('in_person')}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Sign In Person
        </button>
        <button
          onClick={() => respondToContract('rejected')}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Reject Contract
        </button>
      </div>

      {responseStatus && (
        <p className="mt-4 font-medium text-gray-700">{responseStatus}</p>
      )}

      {message.error && (
        <p className="text-red-600 mt-2">{message.error}</p>
      )}
    </div>
  );
};

export default ContractRespond;
