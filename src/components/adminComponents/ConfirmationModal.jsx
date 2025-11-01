import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  setRemark,
}) => {
  if (!isOpen) return null;

  const handleChange = (event) => {
    setRemark(event.target.value);
  };

  // Determine modal styling based on action type
  const getModalStyles = () => {
    const isRejection = actionType?.includes("Rejected");
    return {
      icon: isRejection ? "❌" : "⚠️",
      confirmButton: isRejection
        ? "bg-red-600 hover:bg-red-700"
        : "bg-[#4c735c] hover:bg-[#3a5b47]",
      title: isRejection ? "Confirm Rejection" : "Confirm Action",
    };
  };

  const modalStyles = getModalStyles();
  const requiresRemark = actionType?.includes("Rejected");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-1000000 animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start p-6 pb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mr-4">
            <span className="text-xl">{modalStyles.icon}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {modalStyles.title}
            </h2>
            <p className="mt-2 text-gray-600 leading-relaxed">
              Are you sure you want to{" "}
              <strong className="text-gray-800">{actionType}</strong>?
              {requiresRemark && " This action requires a remark."}
            </p>
          </div>
        </div>

        {/* Remark Input */}
        {requiresRemark && (
          <div className="px-6 pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent resize-none"
              placeholder="Please provide a reason for rejection..."
              rows="3"
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This remark will be visible to the user.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row-reverse gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            onClick={onConfirm}
            className={`px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 ${modalStyles.confirmButton} focus:ring-2 focus:ring-offset-2 focus:ring-[#4c735c] focus:outline-none`}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
