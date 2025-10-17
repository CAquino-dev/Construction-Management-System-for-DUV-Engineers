import React, { useState, useRef, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, payment, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDetails, setPaymentDetails] = useState({
    referenceNumber: '',
    bankName: '',
    accountNumber: '',
    transactionDate: new Date().toISOString().split('T')[0],
    amount: payment?.amount || 0,
    notes: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [signatureData, setSignatureData] = useState(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signatureRef = useRef(null);

  const userId = localStorage.getItem('userId');

    useEffect(() => {
    if (isOpen && payment) {
      setPaymentDetails({
        referenceNumber: '',
        bankName: '',
        accountNumber: '',
        transactionDate: new Date().toISOString().split('T')[0],
        amount: payment.amount,
        notes: ''
      });
    }
  }, [isOpen, payment]);

  if (!isOpen) return null;

  // Generate reference number
  const generateReference = () => {
    const ref = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPaymentDetails(prev => ({ ...prev, referenceNumber: ref }));
  };

  // Handle file attachment
  const handleFileAttach = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Handle signature capture
  const handleSignatureCapture = () => {
    if (signatureRef.current) {
      const canvas = signatureRef.current;
      const signature = canvas.toDataURL('image/png');
      setSignatureData(signature);
      setIsSignatureEmpty(false);
    }
  };

  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      const canvas = signatureRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
      setIsSignatureEmpty(true);
    }
  };

  // Convert base64 signature to blob for file upload
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!signatureData) {
    alert('Please provide recipient signature');
    return;
  }

  setIsSubmitting(true);

  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Add payment data
    formData.append('paymentType', payment?.paymentType || 'purchase_order');
    formData.append('referenceId', payment?.id?.toString() || '');
    formData.append('paymentMethod', paymentMethod);
    formData.append('referenceNumber', paymentDetails.referenceNumber);
    formData.append('bankName', paymentDetails.bankName || '');
    formData.append('accountNumber', paymentDetails.accountNumber || '');
    formData.append('transactionDate', paymentDetails.transactionDate);
    formData.append('amount', paymentDetails.amount.toString());
    formData.append('notes', paymentDetails.notes || '');
    formData.append('userId', userId); // Replace with actual user ID

    // Log FormData content for debugging
    console.log('=== FormData Contents ===');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Add signature file
    if (signatureData) {
      const signatureBlob = dataURLtoBlob(signatureData);
      formData.append('signature', signatureBlob, `signature_${Date.now()}.png`);
      console.log('signature: [File]', signatureBlob);
    }

    // Add attachment files
    attachments.forEach((attachment, index) => {
      formData.append('attachments', attachment.file, attachment.name);
      console.log(`attachments[${index}]: [File]`, attachment.file.name);
    });

    console.log('=== End FormData Log ===');

    // Send request to backend with better error handling
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/processFinancePayment`, {
      method: 'POST',
      body: formData,
    });

    // Check if response is OK first
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    // Try to parse as JSON, but handle non-JSON responses
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Server returned invalid JSON response');
    }

    if (result.success) {
      // Create payment record for local state update
      const paymentRecord = {
        id: payment?.id,
        paymentMethod,
        paymentDetails,
        attachments,
        signature: signatureData,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      onPaymentComplete(paymentRecord);
      handleClose();
      alert('✅ Payment processed successfully!');
    } else {
      throw new Error(result.message || 'Failed to process payment');
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    
    // More specific error messages
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      alert('❌ Network error: Could not connect to server. Please check your connection.');
    } else if (error.message.includes('CORS')) {
      alert('❌ CORS error: Please check server configuration.');
    } else {
      alert(`❌ Error processing payment: ${error.message}`);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Reset form and close
  const handleClose = () => {
    setPaymentMethod('cash');
    setPaymentDetails({
      referenceNumber: '',
      bankName: '',
      accountNumber: '',
      transactionDate: new Date().toISOString().split('T')[0],
      amount: payment?.amount || 0,
      notes: ''
    });
    setAttachments([]);
    setSignatureData(null);
    setIsSignatureEmpty(true);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Process Payment</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {payment?.projectName} - {payment?.vendor}
          </p>
          <p className="text-lg font-bold text-green-600">
            ₱{payment?.amount?.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                disabled={isSubmitting}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">💵 Cash Payment</div>
                <div className="text-sm text-gray-500 mt-1">Physical cash handover</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                disabled={isSubmitting}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  paymentMethod === 'online'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">🌐 Online Transfer</div>
                <div className="text-sm text-gray-500 mt-1">Bank transfer or digital payment</div>
              </button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={paymentDetails.referenceNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    referenceNumber: e.target.value 
                  }))}
                  placeholder="Payment reference"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={generateReference}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={paymentDetails.transactionDate}
                onChange={(e) => setPaymentDetails(prev => ({ 
                  ...prev, 
                  transactionDate: e.target.value 
                }))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Online Payment Details */}
          {paymentMethod === 'online' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={paymentDetails.bankName}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    bankName: e.target.value 
                  }))}
                  placeholder="e.g., BDO, BPI, Metrobank"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={paymentDetails.accountNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    accountNumber: e.target.value 
                  }))}
                  placeholder="Last 4 digits"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-yellow-600 text-lg mr-2">💵</div>
                <div>
                  <h4 className="font-medium text-yellow-800">Cash Payment Instructions</h4>
                  <p className="text-yellow-700 text-sm">
                    Ensure you get a signed receipt and take photos of the cash handover process.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Attachments (Receipts, Documents, Photos)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                name="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileAttach}
                disabled={isSubmitting}
                className="hidden"
                id="file-attachment"
              />
              <label
                htmlFor="file-attachment"
                className={`cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                📎 Add Files
              </label>
              <p className="text-gray-500 text-sm mt-2">
                Upload receipts, photos of cash handover, or bank transfer confirmations
              </p>
            </div>

            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-700">Attached Files:</h4>
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {attachment.type.startsWith('image/') ? (
                        <img
                          src={attachment.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          📄
                        </div>
                      )}
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signature Capture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recipient Signature *
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <div className="mb-4">
                <canvas
                  ref={signatureRef}
                  width={600}
                  height={200}
                  className={`w-full h-32 border border-gray-300 rounded bg-white touch-none ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'
                  }`}
                  onMouseDown={(e) => {
                    if (isSubmitting) return;
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
                  disabled={isSignatureEmpty || isSubmitting}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isSignatureEmpty || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  ✅ Save Signature
                </button>
                <button
                  type="button"
                  onClick={clearSignature}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  🗑️ Clear
                </button>
              </div>
              {signatureData && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">✓ Signature captured successfully</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={paymentDetails.notes}
              onChange={(e) => setPaymentDetails(prev => ({ 
                ...prev, 
                notes: e.target.value 
              }))}
              placeholder="Any additional information about this payment..."
              rows="3"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !signatureData}
              className={`flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center ${
                isSubmitting || !signatureData ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                '💳 Complete Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;