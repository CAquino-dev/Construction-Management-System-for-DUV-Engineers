import React, { useEffect, useState } from 'react'
import axios from 'axios';

export const MyprojectLegals = ({ selectedProject }) => {
  const [contractData, setContractData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    remarks: '',
    file: null
  });

  const userId = localStorage.getItem('userId');

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

  // Fetch documents (you can implement this when your endpoint is ready)
  const fetchDocuments = async () => {
    if (!selectedProject?.id) return;
    
    setDocumentsLoading(true);
    try {
      // This will be your new endpoint
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getDocuments/${selectedProject.id}`
      );
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Don't show error for documents since it's secondary data
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file,
        title: prev.title || file.name.split('.')[0] // Use filename as default title
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = async () => {
    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(formData.file.type)) {
      setError('Please upload a PDF, Word, or image file');
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (formData.file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('document_file', formData.file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('remarks', formData.remarks);
      uploadFormData.append('uploaded_by', userId);

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/uploadDocument/${selectedProject.id}`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Add the new document to the list
      setDocuments(prev => [response.data.data, ...prev]);
      
      // Reset form and close modal
      setFormData({
        title: '',
        category: 'Other',
        remarks: '',
        file: null
      });
      setShowUploadModal(false);
      
    } catch (err) {
      setError('Failed to upload document');
      console.error('Error uploading document:', err);
    } finally {
      setUploading(false);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Documents</h2>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Document</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Contract Section */}
      {contractData && contractData.contract_file_url && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Contract</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
              className="w-64 h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>View Contract</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
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
                <span>Download</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Documents Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Other Project Documents</h3>
        
        {documentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4 text-gray-300">📄</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Additional Documents
              </h3>
              <p className="text-gray-500 mb-4">
                Upload other project documents like blueprints, permits, or reports.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="col-span-4">Document</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-3">Remarks</div>
              <div className="col-span-2">Uploaded</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4 flex items-center space-x-3">
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
                  
                  <div className="col-span-1">
                    <button
                      onClick={() => window.open(`${import.meta.env.VITE_REACT_APP_API_URL}${doc.file_url}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-900/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Word, or image files, max 10MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter document title"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="Blueprint">Blueprint</option>
                  <option value="Permit">Permit</option>
                  <option value="Inspection Report">Inspection Report</option>
                  <option value="Contract">Contract</option>
                  <option value="Progress Report">Progress Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Add any remarks..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !formData.file}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};