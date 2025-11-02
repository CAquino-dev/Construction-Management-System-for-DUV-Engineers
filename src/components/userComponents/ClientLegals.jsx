import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download, Eye, Folder, AlertCircle } from "lucide-react";

export const ClientLegals = ({ selectedProject }) => {
  const [contractData, setContractData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = `${import.meta.env.VITE_REACT_APP_API_URL}${fileUrl}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a project to view documents</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c735c]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Header */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-[#4c735c]" />
          Project Documents
        </h4>
        <p className="text-sm text-gray-600">
          Contract and project-related documents
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Contract Section */}
      {contractData && contractData.contract_file_url && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4c735c]" />
            Contract
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Contract ID:</span>
                <span className="ml-2 text-gray-900">
                  #{contractData.contract_id}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Signed Date:</span>
                <span className="ml-2 text-gray-900">
                  {contractData.contract_signed_at
                    ? formatDate(contractData.contract_signed_at)
                    : "Not signed"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Contract document box */}
            <div
              className="w-full max-w-[280px] mx-auto h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:bg-gray-100 hover:border-[#4c735c] transition-all cursor-pointer"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_REACT_APP_API_URL}${
                    contractData.contract_file_url
                  }`,
                  "_blank"
                )
              }
            >
              <div className="text-4xl mb-2">📄</div>
              <p className="text-base font-medium text-gray-700 text-center mb-1">
                Contract Document
              </p>
              <p className="text-xs text-gray-500 text-center">
                Click to view the signed contract
              </p>
              <p className="text-xs text-gray-400 mt-2 text-center">
                PDF Document
              </p>
            </div>

            {/* Vertically stacked buttons */}
            <div className="flex flex-col space-y-2 w-full max-w-[280px] mx-auto">
              <button
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_REACT_APP_API_URL}${
                      contractData.contract_file_url
                    }`,
                    "_blank"
                  )
                }
                className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full"
              >
                <Eye className="w-4 h-4" />
                <span>View Contract</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Photo Section */}
      {selectedProject.project_photo && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4c735c]" />
            Project Photos
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex justify-center">
              <img
                src={`${selectedProject.project_photo}`}
                alt="Project"
                className="h-40 w-auto rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() =>
                  window.open(selectedProject.project_photo, "_blank")
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Other Documents Section - Now with view/download buttons like contracts */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Folder className="w-5 h-5 text-[#4c735c]" />
          Project Documents
        </h3>

        {documentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4c735c]"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-4xl mb-3 text-gray-300">📄</div>
              <h3 className="text-base font-medium text-gray-700 mb-1">
                No Project Documents
              </h3>
              <p className="text-gray-500 text-sm">
                No additional documents have been uploaded for this project yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Document Preview Box - Like Contract */}
                <div
                  className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-3 hover:bg-gray-100 hover:border-[#4c735c] transition-all cursor-pointer mb-3"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_REACT_APP_API_URL}${
                        doc.file_url
                      }`,
                      "_blank"
                    )
                  }
                >
                  <div className="text-3xl mb-1">
                    {getFileIcon(doc.file_url)}
                  </div>
                  <p className="text-sm font-medium text-gray-700 text-center mb-1">
                    {doc.title}
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Click to view document
                  </p>
                </div>

                {/* Document Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Category:
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Uploaded:
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(doc.uploaded_at)}
                    </span>
                  </div>

                  {doc.remarks && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Remarks:
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {doc.remarks}
                      </p>
                    </div>
                  )}
                </div>

                {/* View/Download Buttons - Like Contract */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() =>
                      window.open(
                        `${import.meta.env.VITE_REACT_APP_API_URL}${
                          doc.file_url
                        }`,
                        "_blank"
                      )
                    }
                    className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
