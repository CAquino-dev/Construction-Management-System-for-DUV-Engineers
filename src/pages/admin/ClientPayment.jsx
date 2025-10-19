import React, { useState, useEffect, useRef } from 'react';

export const ClientPayment = () => {
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
  const signatureRef = useRef(null);

    const userId = localStorage.getItem('userId');  

  // 🟢 Load all projects with pending payments
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/projects/with-pending-payments`)
      .then(res => res.json())
      .then(data => setProjects(data.data || []))
      .catch(console.error);
  }, []);

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
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.project_id == selectedProjectId);
  const selectedPayment = payments.find(p => p.schedule_id == selectedPaymentId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Payment Portal</h1>
          <p className="text-gray-600">Record and process client payments for project milestones</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
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

          {/* Payment Form */}
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

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Payment Processing
              </div>
              <div>All cash transactions are encrypted and recorded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};