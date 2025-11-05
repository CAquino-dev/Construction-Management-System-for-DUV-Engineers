import React, { useState, useEffect, useRef } from 'react';

export const ClientPayment = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofPhoto, setProofPhoto] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientPayments, setClientPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPaidPayment, setSelectedPaidPayment] = useState(null);
  const signatureRef = useRef(null);

  const userId = localStorage.getItem('userId');  
  const API = import.meta.env.VITE_REACT_APP_API_URL;

  // 🟢 Load all projects with pending payments
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/with-pending-payments`)
      .then(res => res.json())
      .then(data => setProjects(data.data || []))
      .catch(console.error);
  }, []);

  // 🟢 Load client payments when viewing tab is active
  useEffect(() => {
    if (activeTab === 'view') {
      loadClientPayments();
    }
  }, [activeTab]);

  // 🟢 Update payments when project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setPayments([]);
      setSelectedPaymentId('');
      setAmountPaid('');
      return;
    }

    const project = projects.find(p => p.project_id == selectedProjectId);
    setPayments(project ? project.pending_payments : []);
  }, [selectedProjectId, projects]);

  // 🟢 Update amountPaid when payment selected
  useEffect(() => {
    const payment = payments.find(p => p.schedule_id == selectedPaymentId);
    if (payment) setAmountPaid(payment.amount.toLocaleString());
    else setAmountPaid('');
  }, [selectedPaymentId, payments]);

  // 🔹 Load client payments
  const loadClientPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/clientPayments`);
      const result = await response.json();
      if (result.success) {
        setClientPayments(result.data || []);
      } else {
        setMessage('Failed to load client payments');
      }
    } catch (error) {
      console.error('Error loading client payments:', error);
      setMessage('Error loading client payments');
    } finally {
      setLoadingPayments(false);
    }
  };

  // 🔹 Generate reference number
  const generateReference = () => {
    const ref = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setReferenceNumber(ref);
  };

  // 🔹 Upload proof photo
  const handleProofPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setMessage('Error: Please upload an image file');
    if (file.size > 5 * 1024 * 1024) return setMessage('Error: File size must be less than 5MB');
    setProofPhoto({ file, preview: URL.createObjectURL(file), name: file.name });
  };

  const removeProofPhoto = () => {
    if (proofPhoto?.preview) URL.revokeObjectURL(proofPhoto.preview);
    setProofPhoto(null);
  };

  // 🔹 Signature handlers
  const handleSignatureCapture = () => {
    if (!signatureRef.current) return;
    const canvas = signatureRef.current;
    const signature = canvas.toDataURL('image/png');
    setSignatureData(signature);
    setIsSignatureEmpty(false);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      const ctx = signatureRef.current.getContext('2d');
      ctx.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
    }
    setSignatureData(null);
    setIsSignatureEmpty(true);
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  // 🟢 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!selectedProjectId) return setMessage('Please select a project.'), setLoading(false);
    if (!selectedPaymentId) return setMessage('Please select a pending payment.'), setLoading(false);
    if (!amountPaid || isNaN(amountPaid)) return setMessage('Invalid amount.'), setLoading(false);
    if (!proofPhoto) return setMessage('Upload proof of payment.'), setLoading(false);
    if (!signatureData) return setMessage('Provide client signature.'), setLoading(false);

    try {
      const formData = new FormData();
      formData.append('payment_schedule_id', selectedPaymentId);
      formData.append('payment_date', paymentDate);
      formData.append('amount_paid', amountPaid);
      formData.append('payment_method', 'cash');
      formData.append('reference_number', referenceNumber);
      formData.append('notes', notes);
      formData.append('proof_photo', proofPhoto.file);
      const signatureBlob = dataURLtoBlob(signatureData);
      formData.append('client_signature', signatureBlob, `signature_${Date.now()}.png`);
      formData.append('processed_by', userId);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/recordClientCashPayment`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to record payment');

      setMessage('Payment recorded successfully!');
      setSelectedProjectId('');
      setSelectedPaymentId('');
      setAmountPaid('');
      setReferenceNumber('');
      setNotes('');
      removeProofPhoto();
      clearSignature();
      setPayments([]);
      
      // Reload client payments if we're on the view tab
      if (activeTab === 'view') {
        loadClientPayments();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // 🔹 Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔹 Parse attachments
  const parseAttachments = (attachmentsString) => {
    try {
      if (!attachmentsString) return [];
      const attachments = JSON.parse(attachmentsString);
      return Array.isArray(attachments) ? attachments : [];
    } catch (error) {
      console.error('Error parsing attachments:', error);
      return [];
    }
  };

  // 🔹 Get full URL for file paths
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // Handle both paths with and without /public prefix
    const cleanPath = filePath.startsWith('/public') ? filePath.slice(7) : filePath;
    return `${import.meta.env.VITE_REACT_APP_API_URL}${cleanPath}`;
  };

  // 🔹 View attachment
  const viewAttachment = (attachment) => {
    setSelectedAttachment({
      ...attachment,
      url: getFileUrl(attachment.path)
    });
  };

  // 🔹 View signature
  const viewSignature = (signaturePath) => {
    setSelectedSignature({
      url: getFileUrl(signaturePath),
      path: signaturePath
    });
  };

  // 🔹 Close modals
  const closeAttachmentModal = () => setSelectedAttachment(null);
  const closeSignatureModal = () => setSelectedSignature(null);

  // 🔹 Handle view action for paid payments
  const handleViewAction = (payment) => {
    setSelectedPaidPayment(payment);
    setShowViewModal(true);
  };

  const selectedProject = projects.find(p => p.project_id == selectedProjectId);
  const selectedPayment = payments.find(p => p.schedule_id == selectedPaymentId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Payment Portal</h1>
          <p className="text-gray-600">Record and view client payments for project milestones</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('record')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'record'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💵 Record Payment
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'view'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 View Payments
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                <div className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={message.includes('Error') 
                      ? "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      : "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    } clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            {/* Record Payment Tab */}
            {activeTab === 'record' && (
              <div className="space-y-6">
                {/* Payment Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Cash Payment Processing</h2>
                      <p className="text-green-100 mt-1">Secure payment recording system</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">₱</span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project & Payment Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Select Project
                      </label>
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Choose a project...</option>
                        {projects.map((p) => (
                          <option key={p.project_id} value={p.project_id}>
                            {p.project_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Select Pending Payment
                      </label>
                      <select
                        value={selectedPaymentId}
                        onChange={(e) => setSelectedPaymentId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!selectedProjectId}
                        required
                      >
                        <option value="">Choose a pending payment...</option>
                        {payments.map((p) => (
                          <option key={p.schedule_id} value={p.schedule_id}>
                            {p.payment_name} — ₱{p.amount?.toLocaleString()} (Due {new Date(p.due_date).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Payment Method Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-yellow-600 text-2xl mr-3">💵</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Cash Payment</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          This form is for recording cash payments. Please ensure you have collected the physical cash 
                          and obtained proper documentation before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">Payment Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Amount Received
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            required
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Payment Date */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          max={new Date().toISOString().slice(0, 10)}
                          required
                        />
                      </div>

                      {/* Reference Number */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Reference Number
                        </label>
                        <div className="flex space-x-2 max-w-md">
                          <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Payment reference number"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={generateReference}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Generate
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Optional: Generate or enter a reference number for tracking
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Proof of Payment Photo */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      📸 Proof of Payment (Required)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofPhotoUpload}
                        className="hidden"
                        id="proof-photo"
                      />
                      <label
                        htmlFor="proof-photo"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📷 Upload Proof Photo
                      </label>
                      <p className="text-gray-500 text-sm mt-2">
                        Upload a clear photo of the receipt, cash handover, or payment documentation
                      </p>
                    </div>

                    {/* Proof Photo Preview */}
                    {proofPhoto && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={proofPhoto.preview}
                              alt="Proof of payment"
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <div>
                              <p className="font-medium text-gray-700">{proofPhoto.name}</p>
                              <p className="text-sm text-gray-500">Proof of payment</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeProofPhoto}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Client Signature */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      ✍️ Client Signature (Required)
                    </label>
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                      <div className="mb-4">
                        <canvas
                          ref={signatureRef}
                          width={600}
                          height={200}
                          className="w-full h-32 border border-gray-300 rounded bg-white touch-none cursor-crosshair"
                          onMouseDown={(e) => {
                            const canvas = signatureRef.current;
                            const ctx = canvas.getContext('2d');
                            ctx.beginPath();
                            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                            
                            const draw = (e) => {
                              ctx.lineTo(e.offsetX, e.offsetY);
                              ctx.stroke();
                            };
                            
                            canvas.onmousemove = draw;
                            canvas.onmouseup = () => {
                              canvas.onmousemove = null;
                              canvas.onmouseup = null;
                              setIsSignatureEmpty(false);
                            };
                          }}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleSignatureCapture}
                          disabled={isSignatureEmpty}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            isSignatureEmpty
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          ✅ Save Signature
                        </button>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          🗑️ Clear
                        </button>
                      </div>
                      {signatureData && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-700 text-sm">✓ Signature captured successfully</p>
                          <p className="text-green-600 text-xs mt-1">Signed by: Client</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information about this cash payment..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Project & Payment Info */}
                  {(selectedProject || selectedPayment) && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3">Payment Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {selectedProject && (
                          <div>
                            <h4 className="font-medium text-blue-700">Project Information</h4>
                            <p><span className="text-gray-600">Client:</span> {selectedProject.client_name}</p>
                            <p><span className="text-gray-600">Project:</span> {selectedProject.project_name}</p>
                          </div>
                        )}
                        {selectedPayment && (
                          <div>
                            <h4 className="font-medium text-blue-700">Payment Information</h4>
                            <p><span className="text-gray-600">Payment:</span> {selectedPayment.payment_name}</p>
                            <p><span className="text-gray-600">Due Amount:</span> <span className="font-bold text-green-700">₱{selectedPayment.amount?.toLocaleString()}</span></p>
                            <p><span className="text-gray-600">Due Date:</span> {new Date(selectedPayment.due_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        💵 Record Cash Payment
                      </div>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* View Payments Tab */}
            {activeTab === 'view' && (
              <div className="space-y-6">
                {/* View Payments Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Client Payment History</h2>
                      <p className="text-blue-100 mt-1">View all recorded client payments</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">📋</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-end">
                  <button
                    onClick={loadClientPayments}
                    disabled={loadingPayments}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 mr-2 ${loadingPayments ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loadingPayments ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {/* Payments Table */}
                {loadingPayments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading payments...</p>
                  </div>
                ) : clientPayments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-700">No payments found</h3>
                    <p className="text-gray-500">No client payments have been recorded yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Project & Milestone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Documentation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clientPayments.map((payment) => {
                            const attachments = parseAttachments(payment.attachments);
                            const hasAttachments = attachments.length > 0;
                            const hasSignature = !!payment.recipient_signature;

                            return (
                              <tr key={payment.payment_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {payment.project_name}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {payment.milestone_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Ref: {payment.reference_number}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-semibold text-green-600">
                                      {formatCurrency(parseFloat(payment.amount))}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {payment.payment_method}
                                    </div>
                                    {payment.notes && (
                                      <div className="text-sm text-gray-600 mt-1 max-w-xs">
                                        {payment.notes}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    {hasAttachments ? (
                                      attachments.map((attachment, index) => (
                                        <button
                                          key={index}
                                          onClick={() => viewAttachment(attachment)}
                                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                        >
                                          📎 {attachment.name}
                                        </button>
                                      ))
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        No attachments
                                      </span>
                                    )}
                                    {hasSignature ? (
                                      <button
                                        onClick={() => viewSignature(payment.recipient_signature)}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                                      >
                                        ✍️ View Signature
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        No signature
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  <div>
                                    <div>{formatDate(payment.transaction_date)}</div>
                                    <div className="text-xs">
                                      Recorded: {formatDate(payment.created_at)}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                  <button
                                    onClick={() => handleViewAction(payment)}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                {clientPayments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {clientPayments.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Payments</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          clientPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(clientPayments.map(p => p.project_id)).size}
                      </div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attachment Modal */}
        {selectedAttachment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedAttachment.name}</h3>
                <button
                  onClick={closeAttachmentModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-auto">
                <img
                  src={selectedAttachment.url}
                  alt={selectedAttachment.name}
                  className="max-w-full h-auto mx-auto"
                  onError={(e) => {
                    e.target.alt = 'Failed to load image';
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{selectedAttachment.name}</span>
                  <a
                    href={selectedAttachment.url}
                    download={selectedAttachment.name}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {selectedSignature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Client Signature</h3>
                <button
                  onClick={closeSignatureModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-auto">
                <img
                  src={selectedSignature.url}
                  alt="Client Signature"
                  className="max-w-full h-auto mx-auto border border-gray-300"
                  onError={(e) => {
                    e.target.alt = 'Failed to load signature';
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaWduYXR1cmUgbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Client signature</span>
                  <a
                    href={selectedSignature.url}
                    download={`signature_${Date.now()}.png`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Paid Payment Modal */}
        {showViewModal && selectedPaidPayment && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Project
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.project_name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Milestone
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.milestone_name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Reference Number
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.reference_number}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Amount
                          </label>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(parseFloat(selectedPaidPayment.amount))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Transaction Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Payment Method
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedPaidPayment.payment_method}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Transaction Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {formatDate(selectedPaidPayment.transaction_date)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Recorded Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {formatDate(selectedPaidPayment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedPaidPayment.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Notes
                        </h3>
                        <p className="text-sm text-gray-900">
                          {selectedPaidPayment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Photos & Attachments */}
                  <div className="space-y-6">
                    {/* Recipient Signature */}
                    {selectedPaidPayment.recipient_signature && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Client Signature
                        </h3>
                        <div className="border rounded-lg p-4 bg-white">
                          <img
                            src={`${API}${selectedPaidPayment.recipient_signature}`}
                            alt="Client Signature"
                            className="max-w-full h-auto max-h-48 mx-auto"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                          <div
                            style={{ display: "none" }}
                            className="text-center text-gray-500 text-sm"
                          >
                            Signature image not available
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {parseAttachments(selectedPaidPayment.attachments).length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Attachments
                        </h3>
                        <div className="space-y-3">
                          {parseAttachments(selectedPaidPayment.attachments).map((attachment, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-3 bg-white"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900 truncate">
                                  {attachment.name}
                                </span>
                                <a
                                  href={getFileUrl(attachment.path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  View
                                </a>
                              </div>
                              {attachment.path && (
                                <div className="mt-2 border rounded">
                                  <img
                                    src={getFileUrl(attachment.path)}
                                    alt={attachment.name}
                                    className="w-full h-auto max-h-48 object-contain"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Secure Payment Processing System • All transactions are encrypted and recorded</p>
        </div>
      </div>
    </div>
  );
};