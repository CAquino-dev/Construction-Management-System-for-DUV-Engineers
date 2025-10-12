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
  const itemsPerPage = 5;
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  useEffect(() => {
    const fetchProposalResponse = async () => {
      const results = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/getProposalResponse`
      );
      if (results.ok) {
        const data = await results.json();
        setProposals(data);
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
        success:
          "Contract generated successfully!, Sent to finance for approval",
        error: "",
        approvalLink: `${data.approvalLink}`,
      });
    } catch (err) {
      setMessage({
        error: err.message || "Error generating contract.",
        success: "",
        approvalLink: "",
      });
      console.error(err);
    }
  };

  // ✅ Helper to get status color class
  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "pending") return "text-yellow-600 font-semibold";
    if (s === "approve" || s === "approved")
      return "text-green-600 font-semibold";
    if (s === "rejected" || s === "reject") return "text-red-600 font-semibold"; // 🔴 rejected = red
    return "";
  };

  // Pagination logic
  const totalPages = Math.ceil(proposals.length / itemsPerPage);
  const paginatedProposals = proposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Helper to check if button should be disabled
  const isButtonDisabled = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === "pending" || s === "rejected";
  };

  return (
    <div className="mt-6 mx-auto px-4 bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Submitted Proposals</h2>

      {/* ✅ Success/Error Message */}
      {(message.success || message.error) && (
        <div
          className={`p-4 mb-6 rounded shadow ${
            message.error
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {message.success && (
            <p className="font-semibold">{message.success}</p>
          )}
          {message.error && <p className="font-semibold">{message.error}</p>}
        </div>
      )}

      {/* Table for md+ screens */}
      <div className="hidden md:block">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Title</th>
              <th className="border p-2">Client</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Responded At</th>
              <th className="border p-2">IP Address</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProposals.map((p) => (
              <tr key={p.id}>
                <td className="border p-2 text-center">{p.title}</td>
                <td className="border p-2 text-center">{p.client_name}</td>
                <td
                  className={`border p-2 capitalize text-center ${getStatusClass(
                    p.status
                  )}`}
                >
                  {p.status}
                </td>
                <td
                  className={`border p-2 text-center ${
                    !p.responded_at ||
                    p.responded_at.toLowerCase() === "pending"
                      ? "text-yellow-600 font-semibold"
                      : ""
                  }`}
                >
                  {p.responded_at || "Pending"}
                </td>
                <td
                  className={`border p-2 text-center ${
                    !p.approved_by_ip ||
                    p.approved_by_ip.toLowerCase() === "n/a"
                      ? "text-gray-400 font-semibold"
                      : ""
                  }`}
                >
                  {p.approved_by_ip || "N/A"}
                </td>
                <td className="border p-2 text-center">
                  <button
                    className={`px-3 py-1 rounded text-white ${
                      isButtonDisabled(p.status)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#4c735c] cursor-pointer"
                    }`}
                    onClick={() => handleOpenConfirm(p.id)}
                    disabled={isButtonDisabled(p.status)} // ✅ disabled here
                  >
                    Generate Contract
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedProposals.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 shadow-sm bg-gray-50"
          >
            <div className="mb-2">
              <span className="font-semibold">Title:</span> {p.title}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Client:</span> {p.client_name}
            </div>
            <div className={`mb-2 capitalize ${getStatusClass(p.status)}`}>
              <span className="font-semibold">Status:</span> {p.status}
            </div>
            <div
              className={`mb-2 ${
                !p.responded_at || p.responded_at.toLowerCase() === "pending"
                  ? "text-yellow-600 font-semibold"
                  : ""
              }`}
            >
              <span className="font-semibold">Responded At:</span>{" "}
              {p.responded_at || "Pending"}
            </div>
            <div
              className={`mb-2 ${
                !p.approved_by_ip || p.approved_by_ip.toLowerCase() === "n/a"
                  ? "text-gray-400 font-semibold"
                  : ""
              }`}
            >
              <span className="font-semibold">IP Address:</span>{" "}
              {p.approved_by_ip || "N/A"}
            </div>
            <div className="flex justify-end mt-2">
              <button
                className={`px-3 py-1 rounded text-white ${
                  isButtonDisabled(p.status)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4c735c] cursor-pointer"
                }`}
                onClick={() => handleGenerateContract(p.id)}
                disabled={isButtonDisabled(p.status)}
              >
                Generate Contract
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="w-full overflow-x-auto flex justify-center mt-4">
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
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
