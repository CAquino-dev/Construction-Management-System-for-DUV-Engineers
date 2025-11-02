import React, { useEffect, useState } from "react";
import axios from "axios";

export const MyprojectLegals = ({ selectedProject }) => {
  const [contractData, setContractData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Other",
    remarks: "",
    file: null,
  });

  const userId = localStorage.getItem("userId");

  // Fetch contract data
  useEffect(() => {
    const fetchLegals = async () => {
      if (!selectedProject?.id) return;

      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getLegals/${
            selectedProject.id
          }`
        );
        setContractData(response.data.data);
      } catch (err) {
        setError("Failed to fetch contract document");
        console.error("Error fetching contract:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLegals();
    fetchDocuments();
  }, [selectedProject]);

  // Fetch documents
  const fetchDocuments = async () => {
    if (!selectedProject?.id) return;

    setDocumentsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getDocuments/${
          selectedProject.id
        }`
      );
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
        title: prev.title || file.name.split(".")[0],
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpload = async () => {
    if (!formData.file) {
      setError("Please select a file");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(formData.file.type)) {
      setError("Please upload a PDF, Word, or image file");
      return;
    }

    if (formData.file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("document_file", formData.file);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("remarks", formData.remarks);
      uploadFormData.append("uploaded_by", userId);

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/uploadDocument/${
          selectedProject.id
        }`,
        uploadFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ Refresh document list from backend to ensure consistency
      await fetchDocuments();

      // ✅ Reset form and close modal cleanly
      setFormData({
        title: "",
        category: "Other",
        remarks: "",
        file: null,
      });

      // Delay slightly to avoid flicker on fast uploads
      setTimeout(() => {
        setShowUploadModal(false);
      }, 300);
    } catch (err) {
      setError("Failed to upload document");
      console.error("Error uploading document:", err);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(extension)) return "📄";
    if (["doc", "docx"].includes(extension)) return "📝";
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "🖼️";
    return "📎";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate long text with ellipsis
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get filename without extension for display
  const getDisplayFileName = (fileUrl) => {
    const fileName = fileUrl.split("/").pop() || "";
    // Remove extension for display
    return fileName.split(".").slice(0, -1).join(".") || fileName;
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Project Documents</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Project Documents
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage contracts and project documents
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Document</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Contract Section */}
      {contractData && contractData.contract_file_url && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Contract Document
          </h3>

          {/* Contract Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-700 sm:w-32">
                  Contract ID:
                </span>
                <span className="text-gray-900 font-semibold">
                  #{contractData.contract_id}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-700 sm:w-32">
                  Signed Date:
                </span>
                <span className="text-gray-900">
                  {contractData.contract_signed_at
                    ? formatDate(contractData.contract_signed_at)
                    : "Not signed"}
                </span>
              </div>
            </div>
          </div>

          {/* Contract Preview Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Document Preview */}
              <div
                className="flex-shrink-0 w-full lg:w-64 h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:bg-gray-100 hover:border-blue-300 transition-all cursor-pointer"
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_REACT_APP_API_URL}${
                      contractData.contract_file_url
                    }`,
                    "_blank"
                  )
                }
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="text-base font-medium text-gray-700 text-center mb-1">
                  Contract Document
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Click to view contract
                </p>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  PDF Document
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                <button
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_REACT_APP_API_URL}${
                        contractData.contract_file_url
                      }`,
                      "_blank"
                    )
                  }
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span>View Contract</span>
                </button>

                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `${import.meta.env.VITE_REACT_APP_API_URL}${
                      contractData.contract_file_url
                    }`;
                    link.download = `contract-${contractData.contract_id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-4 h-4"
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
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Documents Section */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Project Documents
          </h3>
          <div className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </div>
        </div>

        {documentsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4 text-gray-300">📄</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Documents Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Upload project documents like blueprints, permits, or reports to
                get started.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Upload First Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl mt-1 flex-shrink-0">
                      {getFileIcon(doc.file_url)}
                    </span>
                    <div className="flex-1 min-w-0">
                      {/* Title with proper truncation */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h4
                          className="font-medium text-gray-900 break-words"
                          title={doc.title}
                        >
                          {truncateText(doc.title, 60)}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shrink-0">
                          {doc.category}
                        </span>
                      </div>

                      {/* Remarks with truncation */}
                      {doc.remarks && (
                        <p
                          className="text-sm text-gray-600 mb-2 line-clamp-2 break-words"
                          title={doc.remarks}
                        >
                          {truncateText(doc.remarks, 80)}
                        </p>
                      )}

                      {/* File info with proper truncation */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1 shrink-0">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(doc.uploaded_at)}
                        </span>
                        <span
                          className="text-gray-400 break-all"
                          title={getDisplayFileName(doc.file_url)}
                        >
                          {truncateText(getDisplayFileName(doc.file_url), 30)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_REACT_APP_API_URL}${
                          doc.file_url
                        }`,
                        "_blank"
                      )
                    }
                    className="ml-3 flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    title="View Document"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg
                        className="w-8 h-8 text-gray-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 break-words">
                        {formData.file
                          ? truncateText(formData.file.name, 40)
                          : "Click to select file"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, or image files, max 10MB
                      </p>
                    </label>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter document title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {/* Category Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Blueprint">Blueprint</option>
                    <option value="Permit">Permit</option>
                    <option value="Inspection Report">Inspection Report</option>
                    <option value="Contract">Contract</option>
                    <option value="Progress Report">Progress Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Remarks Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    placeholder="Add any remarks..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !formData.file}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    "Upload Document"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
