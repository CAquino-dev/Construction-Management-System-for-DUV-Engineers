import React, { useEffect, useState } from 'react'
import axios from 'axios';

export const MyprojectLegals = ({ selectedProject }) => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  }, [selectedProject]); 

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Contract</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Contract</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!contractData || !contractData.contract_file_url) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Contract</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No contract document found for this project
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Contract</h2>
      
      {/* Contract Information */}
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

      {/* Contract Document */}
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
          <span>Download Contract</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};