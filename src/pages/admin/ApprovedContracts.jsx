import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ModifyContract from "../../components/adminComponents/Engineering/ModifyContract";

const ApprovedContracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [viewMode, setViewMode] = useState("status");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedContractForModification, setSelectedContractForModification] =
    useState(null);

  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/projectManager/getApprovedContracts`
      );
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      console.error("Failed to fetch contracts", err);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = (contract) => {
    setSelectedContract(contract);
    setSignatureFile(null);
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedContract(null);
    setSignatureFile(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSignatureFile(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleUploadSignedContract = async () => {
    if (!selectedContract || !signatureFile) {
      toast.error("Please select a signed contract image");
      return;
    }

    setUploading((prev) => ({ ...prev, [selectedContract.id]: true }));

    try {
      const formData = new FormData();
      formData.append("signature_photo", signatureFile);

      const res = await fetch(
        `${BASE_URL}/api/projectManager/uploadSignInPerson/${selectedContract.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to upload signed contract.");
      }

      toast.success("Signed contract uploaded successfully.");
      handleCloseUploadModal();
      fetchContracts();

      // Auto-generate payment schedule + invoice
      try {
        const scheduleRes = await fetch(
          `${BASE_URL}/api/payments/payment-schedule/${selectedContract.id}`,
          {
            method: "POST",
          }
        );

        if (!scheduleRes.ok) {
          throw new Error("Failed to generate payment schedule");
        }

        const scheduleData = await scheduleRes.json();

        // Send first invoice
        const invoiceRes = await fetch(`${BASE_URL}/api/invoice/send-next`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contractId: scheduleData.contractId || selectedContract.id,
          }),
        });

        if (!invoiceRes.ok) {
          throw new Error("Failed to send invoice");
        }

        toast.success(
          "Payment schedule generated and invoice sent to client successfully."
        );
      } catch (paymentErr) {
        console.error("Payment/invoice error:", paymentErr);
        toast.error(
          "Contract uploaded but failed to generate payment schedule or send invoice."
        );
      }
    } catch (err) {
      console.error("Error uploading signed contract:", err);
      toast.error(
        err.message || "An error occurred while uploading the contract."
      );
    } finally {
      setUploading((prev) => ({ ...prev, [selectedContract.id]: false }));
    }
  };

  // Filter contracts based on view mode - UPDATED FOR CLEAR SEPARATION
  const filteredContracts = contracts.filter((contract) => {
    if (viewMode === "status") {
      // Show ALL contracts except signed ones - show all status combinations
      return contract.status !== "signed";
    } else if (viewMode === "in-person") {
      // Show finance-approved contracts marked for in-person signing that aren't signed yet
      return (
        contract.approval_status === "approved" &&
        contract.sign_method === "in_person" &&
        contract.status !== "signed"
      );
    } else if (viewMode === "signed") {
      // Show ONLY signed contracts
      return contract.status === "signed";
    }
    return false;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sent":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "✅";
      case "rejected":
        return "❌";
      case "draft":
        return "📝";
      case "approved":
        return "👍";
      default:
        return "📄";
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "📄";
    }
  };

  const getSigningMethodDisplay = (contract) => {
    if (contract.sign_method === "in_person") {
      return "In-Person Signing";
    } else if (contract.sign_method === "digital") {
      return "Digital Signature";
    } else if (contract.contract_signed_at) {
      return "Signed (Method Unknown)";
    }
    return "Not Signed";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );

  const handleOpenModifyModal = (contract) => {
    setSelectedContractForModification(contract);
    setShowModifyModal(true);
  };

  const handleCloseModifyModal = () => {
    setShowModifyModal(false);
    setSelectedContractForModification(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex items-center justify-center">
            <span className="mr-3">📋</span>
            Contract Management
          </h1>
        </div>

        {/* Toggle Buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={() => setViewMode("status")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === "status"
                  ? "bg-[#4c735c] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📊 Contract Status
            </button>
            <button
              onClick={() => setViewMode("in-person")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === "in-person"
                  ? "bg-[#4c735c] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📝 In-Person Signing
            </button>
            <button
              onClick={() => setViewMode("signed")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === "signed"
                  ? "bg-[#4c735c] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✅ Signed Contracts
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {
                contracts.filter(
                  (c) =>
                    c.approval_status === "approved" &&
                    c.sign_method === "in_person" &&
                    c.status !== "signed"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">In-Person</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {
                contracts.filter(
                  (c) =>
                    c.status === "rejected" || c.approval_status === "rejected"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter((c) => c.status === "signed").length}
            </div>
            <div className="text-sm text-gray-600">Signed</div>
          </div>
        </div>

        {/* Contract List */}
        <div className="bg-white rounded-2xl shadow-sm p-6 max-h-screen overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">
                {viewMode === "status"
                  ? "📊"
                  : viewMode === "in-person"
                  ? "📝"
                  : "✅"}
              </span>
              {viewMode === "status" && "Contract Status Overview"}
              {viewMode === "in-person" && "Contracts for In-Person Signing"}
              {viewMode === "signed" && "Signed Contracts"}
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {filteredContracts.length} contracts
              </span>
            </h2>
          </div>

          {filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">
                {viewMode === "status"
                  ? "📊"
                  : viewMode === "in-person"
                  ? "📝"
                  : "✅"}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {viewMode === "status" && "No Contracts in Progress"}
                {viewMode === "in-person" &&
                  "No Contracts for In-Person Signing"}
                {viewMode === "signed" && "No Signed Contracts"}
              </h3>
              <p className="text-gray-600">
                {viewMode === "status" &&
                  "All contracts are either signed or there are no contracts to display."}
                {viewMode === "in-person" &&
                  "All in-person contracts have been processed or there are no contracts marked for in-person signing."}
                {viewMode === "signed" && "No contracts have been signed yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {contract.proposal_title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
                            {/* For Signed View - Simplified Display */}
                            {viewMode === "signed" ? (
                              <>
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200 whitespace-nowrap flex items-center space-x-1`}
                                >
                                  <span>✅</span>
                                  <span>Signed</span>
                                </div>
                                {contract.sign_method && (
                                  <div
                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                      contract.sign_method === "in_person"
                                        ? "bg-orange-100 text-orange-800 border-orange-200"
                                        : "bg-purple-100 text-purple-800 border-purple-200"
                                    } whitespace-nowrap`}
                                  >
                                    {contract.sign_method === "in_person"
                                      ? "In-Person"
                                      : "Digital"}
                                  </div>
                                )}
                              </>
                            ) : (
                              /* For Status and In-Person Views - Detailed Status */
                              <>
                                {/* Client Status */}
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                    contract.status
                                  )} whitespace-nowrap flex items-center space-x-1`}
                                >
                                  <span>{getStatusIcon(contract.status)}</span>
                                  <span>
                                    Client: {contract.status || "Unknown"}
                                  </span>
                                </div>

                                {/* Finance Approval Status */}
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getApprovalStatusColor(
                                    contract.approval_status
                                  )} whitespace-nowrap flex items-center space-x-1`}
                                >
                                  <span>
                                    {getApprovalStatusIcon(
                                      contract.approval_status
                                    )}
                                  </span>
                                  <span>
                                    Finance:{" "}
                                    {contract.approval_status || "Unknown"}
                                  </span>
                                </div>

                                {contract.sign_method && (
                                  <div
                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                      contract.sign_method === "in_person"
                                        ? "bg-orange-100 text-orange-800 border-orange-200"
                                        : "bg-purple-100 text-purple-800 border-purple-200"
                                    } whitespace-nowrap`}
                                  >
                                    {contract.sign_method === "in_person"
                                      ? "In-Person"
                                      : "Digital"}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Contract ID: {contract.id} | Proposal ID:{" "}
                          {contract.proposal_id}
                        </p>
                      </div>
                    </div>

                    {/* Contract Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">💰</span>
                          <span className="font-medium">Budget:</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ₱
                          {parseFloat(
                            contract.budget_estimate
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">⏱️</span>
                          <span className="font-medium">Timeline:</span>
                        </div>
                        <p>
                          {contract.start_date && contract.end_date
                            ? `${new Date(
                                contract.start_date
                              ).toLocaleDateString()} - ${new Date(
                                contract.end_date
                              ).toLocaleDateString()}`
                            : "Not specified"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">📅</span>
                          <span className="font-medium">
                            {viewMode === "signed"
                              ? "Signed Date:"
                              : "Created:"}
                          </span>
                        </div>
                        <p>
                          {viewMode === "signed" && contract.contract_signed_at
                            ? new Date(
                                contract.contract_signed_at
                              ).toLocaleDateString()
                            : contract.created_at
                            ? new Date(contract.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">🔄</span>
                          <span className="font-medium">
                            {viewMode === "signed"
                              ? "Signing Method:"
                              : "Status:"}
                          </span>
                        </div>
                        <p>
                          {viewMode === "signed"
                            ? getSigningMethodDisplay(contract)
                            : contract.status}
                        </p>
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">👤</span>
                        Client Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{" "}
                          {contract.client_name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {contract.client_email}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium">Phone:</span>{" "}
                          {contract.client_phone}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Notes (show for rejected contracts in status view) */}
                    {viewMode === "status" &&
                      contract.status === "rejected" &&
                      contract.client_rejection_notes && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                            <span className="mr-2">📝</span>
                            Client Rejection Notes
                          </h4>
                          <p className="text-red-800 text-sm">
                            {contract.client_rejection_notes}
                          </p>
                        </div>
                      )}

                    {/* Finance Rejection Notes */}
                    {viewMode === "status" &&
                      contract.approval_status === "rejected" &&
                      contract.finance_rejection_notes && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                            <span className="mr-2">💰</span>
                            Finance Rejection Notes
                          </h4>
                          <p className="text-red-800 text-sm">
                            {contract.finance_rejection_notes}
                          </p>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {/* Contract Links */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {contract.contract_file_url && (
                          <a
                            href={contract.contract_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <span>📄</span>
                            <span>View Contract PDF</span>
                          </a>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {viewMode === "in-person" && (
                          <button
                            onClick={() => handleOpenUploadModal(contract)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                          >
                            <span>📤</span>
                            <span>Upload Signed Contract</span>
                          </button>
                        )}

                        {viewMode === "signed" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/admin-dashboard/project/create/${contract.id}`
                              )
                            }
                            className="px-4 py-2 bg-[#4c735c] hover:bg-[#3a5a4a] text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                          >
                            <span>🚀</span>
                            <span>Create Project</span>
                          </button>
                        )}

                        {/* Modify button for rejected contracts in status view */}
                        {viewMode === "status" &&
                          (contract.status === "rejected" ||
                            contract.approval_status === "rejected") && (
                            <button
                              onClick={() => handleOpenModifyModal(contract)}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                            >
                              <span>✏️</span>
                              <span>Modify Contract</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Signed Contract Modal */}
      {showUploadModal && selectedContract && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Signed Contract
              </h3>
              <button
                onClick={handleCloseUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Upload an image of the signed contract for:
              </p>
              <p className="font-semibold text-gray-900">
                {selectedContract.proposal_title}
              </p>
              <p className="text-sm text-gray-600">
                Client: {selectedContract.client_name}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signed Contract Image
              </label>
              <input
                name="signature_photo"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPG, PNG, GIF
              </p>
            </div>

            {signatureFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Selected file: {signatureFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(signatureFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseUploadModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSignedContract}
                disabled={!signatureFile || uploading[selectedContract.id]}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  !signatureFile || uploading[selectedContract.id]
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4c735c] hover:bg-[#3a5a4a]"
                }`}
              >
                {uploading[selectedContract.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Signed Contract"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Contract Modal */}
      {showModifyModal && selectedContractForModification && (
        <ModifyContract
          contract={selectedContractForModification}
          isOpen={showModifyModal}
          onClose={handleCloseModifyModal}
          onContractUpdated={(updated) => {
            console.log("Updated contract:", updated);
            fetchContracts();
          }}
        />
      )}
    </div>
  );
};

export default ApprovedContracts;
