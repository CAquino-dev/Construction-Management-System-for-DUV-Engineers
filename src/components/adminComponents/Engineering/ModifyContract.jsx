import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const ModifyContract = ({
  contract,
  isOpen,
  onClose,
  onContractUpdated,
}) => {
  const [formData, setFormData] = useState({
    proposal_title: "",
    budget_estimate: "",
    start_date: "",
    end_date: "",
    scope_of_work: [""],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    if (contract && isOpen) {
      let scopeOfWork = contract.scope_of_work;

      try {
        if (typeof scopeOfWork === "string") {
          const parsed = JSON.parse(scopeOfWork);
          scopeOfWork = Array.isArray(parsed) ? parsed : [scopeOfWork];
        } else if (!Array.isArray(scopeOfWork)) {
          scopeOfWork = [scopeOfWork || ""];
        }
      } catch {
        scopeOfWork = [scopeOfWork || ""];
      }

      if (!scopeOfWork || scopeOfWork.length === 0) {
        scopeOfWork = [""];
      }

      setFormData({
        proposal_title: contract.proposal_title || "",
        budget_estimate: contract.budget_estimate || "",
        start_date: contract.start_date
          ? contract.start_date.split("T")[0]
          : "",
        end_date: contract.end_date ? contract.end_date.split("T")[0] : "",
        scope_of_work: scopeOfWork,
      });
      setErrors({});
    }
  }, [contract, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleScopeChange = (index, value) => {
    const updated = [...formData.scope_of_work];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, scope_of_work: updated }));

    if (errors.scope_of_work) {
      setErrors((prev) => ({ ...prev, scope_of_work: "" }));
    }
  };

  const addScopeField = () => {
    setFormData((prev) => ({
      ...prev,
      scope_of_work: [...prev.scope_of_work, ""],
    }));
  };

  const removeScopeField = (index) => {
    if (formData.scope_of_work.length > 1) {
      const updated = [...formData.scope_of_work];
      updated.splice(index, 1);
      setFormData((prev) => ({ ...prev, scope_of_work: updated }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.start_date) >= new Date(formData.end_date)
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // ✅ Only send editable fields
      const payload = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        scope_of_work: formData.scope_of_work.filter((item) => item.trim() !== ""),
      };

      console.log('payload', payload);
      console.log('contractId', contract.id);

      const res = await fetch(
        `${BASE_URL}/api/projectManager/regenerateContract/${contract.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to update contract.");

      toast.success("Contract regenerated successfully!");
      onContractUpdated(result);
      onClose();
    } catch (err) {
      toast.error(err.message || "An error occurred while updating the contract.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    if (contract) {
      let scopeOfWork = contract.scope_of_work;
      try {
        if (typeof scopeOfWork === "string") {
          const parsed = JSON.parse(scopeOfWork);
          scopeOfWork = Array.isArray(parsed) ? parsed : [scopeOfWork];
        } else if (!Array.isArray(scopeOfWork)) {
          scopeOfWork = [scopeOfWork || ""];
        }
      } catch {
        scopeOfWork = [scopeOfWork || ""];
      }

      if (!scopeOfWork || scopeOfWork.length === 0) {
        scopeOfWork = [""];
      }

      setFormData({
        proposal_title: contract.proposal_title || "",
        budget_estimate: contract.budget_estimate || "",
        start_date: contract.start_date
          ? contract.start_date.split("T")[0]
          : "",
        end_date: contract.end_date ? contract.end_date.split("T")[0] : "",
        scope_of_work: scopeOfWork,
      });
    }
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">✏️</span>
            Modify Contract
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Proposal Title (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Title
                </label>
                <input
                  type="text"
                  name="proposal_title"
                  value={formData.proposal_title}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                />
              </div>

              {/* Budget Estimate (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Estimate (₱)
                </label>
                <input
                  type="number"
                  name="budget_estimate"
                  value={formData.budget_estimate}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                />
              </div>

              {/* Original and New Dates */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📅</span>
                    Original Dates
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Start Date:</span>
                      <p className="text-gray-800">
                        {formatDate(contract.start_date)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">End Date:</span>
                      <p className="text-gray-800">
                        {formatDate(contract.end_date)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🔄</span>
                    New Dates
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent ${
                          errors.start_date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.start_date && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.start_date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent ${
                          errors.end_date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.end_date && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.end_date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Read-only Client Info */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">👤</span>
                  Client Information
                </h4>
                <div className="text-gray-700 text-sm">
                  <p>
                    <strong>Name:</strong> {contract.client_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {contract.client_email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {contract.client_phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Scope of Work */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Scope of Work *
              </label>
              <div className="space-y-2">
                {formData.scope_of_work.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleScopeChange(index, e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent ${
                        errors.scope_of_work
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={`Scope item ${index + 1}`}
                    />
                    {formData.scope_of_work.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScopeField(index)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addScopeField}
                className="mt-3 px-3 py-1 text-sm text-[#4c735c] hover:text-[#3a5a4a] font-medium flex items-center space-x-1 transition-colors"
              >
                <span>+</span>
                <span>Add Another Scope Item</span>
              </button>
              {errors.scope_of_work && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.scope_of_work}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center"
            >
              <span className="mr-2">🔄</span>
              Reset Changes
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4c735c] hover:bg-[#3a5a4a]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Update Contract
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyContract;