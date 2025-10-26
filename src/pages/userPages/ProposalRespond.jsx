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
    } catch (err) {
      setMessage({ error: err.message, success: "" });
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (message.error) return <p className="p-6 text-red-600">{message.error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-15">
      <h1 className="text-2xl font-bold mb-4">
        Proposal from {proposal.client_name}
      </h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <p>
          <strong>Project Interest:</strong> {proposal.project_interest}
        </p>
        <p>
          <strong>Title:</strong> {proposal.title}
        </p>
        <p>
          <strong>Description:</strong> {proposal.description}
        </p>
        <p>
          <strong>Budget Estimate:</strong> ₱{proposal.budget_estimate}
        </p>
        <p>
          <strong>Start Date:</strong>{" "}
          {new Date(proposal.start_date).toLocaleDateString()}
        </p>
        <p>
          <strong>End Date:</strong>{" "}
          {new Date(proposal.end_date).toLocaleDateString()}
        </p>
        <p>
          <strong>Payment Terms:</strong> {proposal.payment_terms}
        </p>

        <div>
          <strong>Scope of Work:</strong>
          <ul className="list-disc pl-5">
            {proposal.scope_of_work.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {proposal.file_url && (
          <div>
            <strong>Attached Proposal PDF:</strong>
            <br />
            <a
              href={`${import.meta.env.VITE_REACT_APP_API_URL}${
                proposal.file_url
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View/Download PDF
            </a>
          </div>
        )}

        {proposal.status === "pending" ? (
          <>
            <div className="flex gap-4 mt-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => setShowConfirmApprove(true)}
              >
                Approve
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setShowRejectionPrompt(true)}
              >
                Reject
              </button>
            </div>

            {showRejectionPrompt && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="mb-2 font-medium text-red-700">
                  Please provide a reason for rejection:
                </p>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => setShowConfirmReject(true)}
                    disabled={!rejectionNotes.trim()}
                  >
                    Confirm Reject
                  </button>
                  <button
                    className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
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
          </>
        ) : (
          <p className="text-green-700 font-semibold mt-4">
            This proposal has already been {proposal.status}.
          </p>
        )}

        {message.success && (
          <p className="text-green-600 mt-2">{message.success}</p>
        )}
      </div>
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
          setRemark={setRejectionNotes} // still allow remark
        />
      )}
    </div>
  );
};

export default ProposalRespond;
