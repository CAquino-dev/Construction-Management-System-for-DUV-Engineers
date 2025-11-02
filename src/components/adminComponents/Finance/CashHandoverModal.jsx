import React, { useState, useRef, useEffect } from "react";

const CashHandoverModal = ({ isOpen, onClose, handover, onHandoverComplete }) => {
  const [formData, setFormData] = useState({
    recipient_name: "",
    handover_date: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [signatureData, setSignatureData] = useState(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signatureRef = useRef(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (isOpen && handover) {
      setFormData(prev => ({
        ...prev,
        handover_date: new Date().toISOString().slice(0, 16)
      }));
      setSignatureData(null);
      setIsSignatureEmpty(true);
    }
  }, [isOpen, handover]);

  if (!isOpen || !handover) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate cost breakdown
  const calculateCostBreakdown = () => {
    const totalAmount = handover.amount || 0;
    
    // You can adjust these based on your actual data structure
    const laborAmount = handover.laborAmount || totalAmount * 0.7;
    const equipmentAmount = handover.equipmentAmount || totalAmount * 0.3;
    
    return {
      labor: laborAmount,
      equipment: equipmentAmount,
      total: totalAmount
    };
  };

  const costBreakdown = calculateCostBreakdown();

  // Parse equipment items from description
  const parseEquipmentItems = () => {
    if (!handover.description) return [];
    
    // Split by new lines or commas and filter out empty items
    const items = handover.description.split(/[\n,]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    return items;
  };

  const equipmentItems = parseEquipmentItems();

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signatureData) {
      alert('Please provide recipient signature');
      return;
    }

    if (!formData.recipient_name) {
      alert('Please enter recipient name');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form data (matches your backend expectations)
      formDataToSend.append('milestone_id', handover?.milestoneId?.toString() || '');
      formDataToSend.append('amount', handover.amount.toString());
      formDataToSend.append('recipient_name', formData.recipient_name);
      formDataToSend.append('handover_date', formData.handover_date.replace('T', ' '));
      formDataToSend.append('notes', formData.notes || '');
      formDataToSend.append('processed_by', userId);

      // Add signature as file (your backend expects 'recipient_signature' as file field)
      if (signatureData) {
        // Convert base64 to blob
        const response = await fetch(signatureData);
        const blob = await response.blob();
        formDataToSend.append('recipient_signature', blob, `signature_${Date.now()}.png`);
      }

      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/processCashHandover`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Create handover record for local state update
        const handoverRecord = {
          id: result.data?.id,
          milestone_id: handover.milestoneId,
          amount: handover.amount,
          recipient_name: formData.recipient_name,
          handover_date: formData.handover_date,
          notes: formData.notes,
          processed_by: parseInt(userId),
          created_at: new Date().toISOString(),
          status: 'completed'
        };

        onHandoverComplete(handoverRecord);
        handleClose();
        alert('✅ Cash handover processed successfully!');
      } else {
        throw new Error(result.message || 'Failed to process cash handover');
      }
    } catch (error) {
      console.error('Error processing cash handover:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      recipient_name: "",
      handover_date: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    setSignatureData(null);
    setIsSignatureEmpty(true);
    setIsSubmitting(false);
    onClose();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Cash Handover</h2>
              <p className="text-blue-100 text-sm">
                {handover?.projectName} - {handover?.milestoneTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Amount Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(costBreakdown.total)}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="font-bold text-green-600">
                  {formatCurrency(costBreakdown.labor)}
                </div>
                <div className="text-xs text-gray-600">Labor</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="font-bold text-orange-600">
                  {formatCurrency(costBreakdown.equipment)}
                </div>
                <div className="text-xs text-gray-600">Equipment</div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Project Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{handover.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{handover.paymentTypeDisplay}</span>
                  </div>
                  {handover.days && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days:</span>
                      <span className="font-medium">{handover.days}</span>
                    </div>
                  )}
                  {handover.dailyRate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-medium">{formatCurrency(handover.dailyRate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Items */}
              {equipmentItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="space-y-2">
                    {equipmentItems.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Handover Form */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Handover Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      placeholder="Enter recipient's name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Handover Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="handover_date"
                      value={formData.handover_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      placeholder="Additional notes..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recipient Signature *</h3>
            <div className="space-y-3">
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
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
                    ctx.strokeStyle = '#1f2937';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
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
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSignatureCapture}
                  disabled={isSignatureEmpty || isSubmitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isSignatureEmpty || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Save Signature
                </button>
                <button
                  type="button"
                  onClick={clearSignature}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
              
              {signatureData && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Signature captured
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !signatureData || !formData.recipient_name}
              className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center ${
                isSubmitting || !signatureData || !formData.recipient_name ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Complete Handover'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashHandoverModal;