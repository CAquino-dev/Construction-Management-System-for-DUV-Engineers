import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, Folder, AlertCircle } from 'lucide-react';

export const ClientLegals = ({ selectedProject }) => {
  const [contractData, setContractData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch contract data
  useEffect(() => {
    const fetchLegals = async () => {
      if (!selectedProject?.id) return;
      
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getLegals/${selectedProject.id}`
        );
        setContractData(response.data.data);
      } catch (err) {
        setError('Failed to fetch contract document');
        console.error('Error fetching contract:', err);
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getDocuments/${selectedProject.id}`
      );
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) return '📄';
    if (['doc', 'docx'].includes(extension)) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return '🖼️';
    return '📎';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#4c735c]" />
            Project Documents
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Contract and project-related documents
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Contract Section */}
      {contractData && contractData.contract_file_url && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4c735c]" />
            Contract
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Contract ID:</span>
                <span className="ml-2 text-gray-900">#{contractData.contract_id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Signed Date:</span>
                <span className="ml-2 text-gray-900">
                  {contractData.contract_signed_at ? formatDate(contractData.contract_signed_at) : 'Not signed'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div 
              className="w-64 h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 hover:bg-gray-100 hover:border-[#4c735c] transition-all cursor-pointer"
              onClick={() => window.open(`${import.meta.env.VITE_REACT_APP_API_URL}${contractData.contract_file_url}`, '_blank')}
            >
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium text-gray-700 text-center mb-2">
                Contract Document
              </p>
              <p className="text-sm text-gray-500 text-center">
                Click to view the signed contract
              </p>
              <p className="text-xs text-gray-400 mt-4 text-center">
                PDF Document
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => window.open(`${import.meta.env.VITE_REACT_APP_API_URL}${contractData.contract_file_url}`, '_blank')}
                className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Contract</span>
              </button>

              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `${import.meta.env.VITE_REACT_APP_API_URL}${contractData.contract_file_url}`;
                  link.download = `contract-${contractData.contract_id}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Photo Section */}
      {selectedProject.project_photo && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4c735c]" />
            Project Photos
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex overflow-x-auto space-x-4 py-2">
              <img 
                src={`${selectedProject.project_photo}`} 
                alt="Project" 
                className="h-48 w-auto rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(selectedProject.project_photo, '_blank')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Other Documents Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5 text-[#4c735c]" />
          Project Documents
        </h3>
        
        {documentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4c735c]"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4 text-gray-300">📄</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Project Documents
              </h3>
              <p className="text-gray-500 mb-4">
                No additional documents have been uploaded for this project yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="col-span-5">Document</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-3">Remarks</div>
              <div className="col-span-2">Uploaded</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-5 flex items-center space-x-3">
                    <span className="text-xl">{getFileIcon(doc.file_url)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{doc.title}</div>
                      <div className="text-sm text-gray-500">
                        {doc.file_url.split('/').pop()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.category}
                    </span>
                  </div>
                  
                  <div className="col-span-3 text-sm text-gray-600">
                    {doc.remarks || '-'}
                  </div>
                  
                  <div className="col-span-2 text-sm text-gray-500">
                    {formatDate(doc.uploaded_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};