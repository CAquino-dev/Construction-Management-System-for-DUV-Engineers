import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const ModifyProposal = ({ isOpen, onClose, proposal, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scope_of_work: [""],
    start_date: "",
    end_date: "",
    payment_terms: "",
    budget: ""
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentTerms, setPaymentTerms] = useState([]);

  // Fetch payment terms on component mount
  useEffect(() => {
    const fetchPaymentTerms = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/getPaymentTerms`
        );
        if (res.data) {
          setPaymentTerms(res.data);
        }
      } catch (error) {
        console.error("Error fetching payment terms:", error);
      }
    };
    fetchPaymentTerms();
  }, []);

  // Initialize form when proposal changes
  useEffect(() => {
    if (proposal) {
      const scopeOfWork = parseScopeOfWork(proposal.scope_of_work);
      
      setFormData({
        title: proposal.title || "",
        description: proposal.description || "",
        scope_of_work: scopeOfWork.length > 0 ? scopeOfWork : [""],
        start_date: proposal.start_date ? proposal.start_date.split('T')[0] : "",
        end_date: proposal.end_date ? proposal.end_date.split('T')[0] : "",
        payment_terms: proposal.payment_terms || "",
        budget: proposal.budget_estimate || ""
      });

      // Set existing PDF URL if available
      if (proposal.file_url) {
        setExistingPdfUrl(`${import.meta.env.VITE_REACT_APP_API_URL}${proposal.file_url}`);
      }
    }
  }, [proposal]);

  const parseScopeOfWork = (scopeString) => {
    if (!scopeString) return [""];
    try {
      if (scopeString.startsWith('"')) {
        scopeString = scopeString.replace(/^"+|"+$/g, "");
      }
      if (scopeString.includes('\\"')) {
        scopeString = scopeString.replace(/\\"/g, '"');
      }
      const parsed = JSON.parse(scopeString);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("Error parsing scope of work:", error);
      return [scopeString];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleScopeChange = (index, value) => {
    const newScope = [...formData.scope_of_work];
    newScope[index] = value;
    setFormData(prev => ({
      ...prev,
      scope_of_work: newScope
    }));
  };

  const addScopeItem = () => {
    setFormData(prev => ({
      ...prev,
      scope_of_work: [...prev.scope_of_work, ""]
    }));
  };

  const removeScopeItem = (index) => {
    if (formData.scope_of_work.length > 1) {
      const newScope = formData.scope_of_work.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        scope_of_work: newScope
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      // Clear any existing file error
      if (errors.pdfFile) {
        setErrors(prev => ({ ...prev, pdfFile: "" }));
      }
    } else if (file) {
      setErrors(prev => ({ ...prev, pdfFile: "Please select a valid PDF file" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.scope_of_work.some(item => !item.trim())) {
      newErrors.scope_of_work = "All scope items must be filled";
    }
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (!formData.payment_terms) newErrors.payment_terms = "Payment terms are required";
    if (!formData.budget) newErrors.budget = "Budget is required";
    if (!pdfFile && !existingPdfUrl) newErrors.pdfFile = "PDF file is required";

    // Validate end date is after start date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);

  try {
    const data = new FormData();

    // Append form data
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append(
      "scope_of_work",
      JSON.stringify(formData.scope_of_work.filter(item => item.trim() !== ""))
    );
    data.append("start_date", formData.start_date);
    data.append("end_date", formData.end_date);
    data.append("payment_term_id", formData.payment_terms);
    data.append(
      "payment_terms",
      paymentTerms.find(t => t.id == formData.payment_terms)?.name || ""
    );
    data.append("budget_estimate", formData.budget);
    data.append("status", "pending"); // reset status
    data.append("client_email", proposal.email); // reset status
    data.append("client_name", proposal.client_name); // reset status

    // Append PDF file if a new one was selected
    if (pdfFile) {
      data.append("proposal_file", pdfFile);
    }

    for (const [key, value] of data.entries()) {
    console.log(`${key}:`, value);
    }   

    //🟢 Use proposal ID in the URL (param), not in FormData
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/modifyProposal/${proposal.id}`,
      {
        method: "PUT",
        body: data,
      }
    );

    if (!response.ok) throw new Error("Failed to update proposal");

    const result = await response.json();

    // Optionally show toast or update UI
    toast.success("Proposal updated successfully!");
    onSave(result);

  } catch (error) {
    console.error("Error updating proposal:", error);
    setErrors({ submit: error.message || "Failed to update proposal" });
    toast.error("Failed to update proposal");
  } finally {
    setLoading(false);
  }
};

  const handleViewPdf = () => {
    if (existingPdfUrl) {
      window.open(existingPdfUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-gray-900/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Modify Proposal</h2>
          <p className="text-gray-600 mt-1">Edit the proposal details and resubmit for approval</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter proposal title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe the project"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.budget ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter project budget"
                />
                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
              </div>
            </div>

            {/* Timeline and Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Timeline & Payment
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms *
                </label>
                <select
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.payment_terms ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select Payment Terms --</option>
                  {paymentTerms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
                {errors.payment_terms && <p className="text-red-500 text-sm mt-1">{errors.payment_terms}</p>}
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Scope of Work *</h3>
              <button
                type="button"
                onClick={addScopeItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Item
              </button>
            </div>
            
            {formData.scope_of_work.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleScopeChange(index, e.target.value)}
                  className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.scope_of_work && !item.trim() ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={`Scope item ${index + 1}`}
                />
                {formData.scope_of_work.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScopeItem(index)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {errors.scope_of_work && <p className="text-red-500 text-sm mt-1">{errors.scope_of_work}</p>}
          </div>

          {/* PDF File Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Proposal Document</h3>
            
            {/* Existing PDF */}
            {existingPdfUrl && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">Current PDF:</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {proposal.file_url?.split('/').pop() || 'proposal.pdf'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleViewPdf}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View PDF
                  </button>
                </div>
              </div>
            )}

            {/* New PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {existingPdfUrl ? "Replace PDF File" : "Upload PDF File *"}
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.pdfFile ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.pdfFile && <p className="text-red-500 text-sm mt-1">{errors.pdfFile}</p>}
              <p className="text-sm text-gray-500 mt-1">
                {existingPdfUrl 
                  ? "Select a new PDF file to replace the current one, or keep the existing file."
                  : "Upload the proposal document in PDF format."
                }
              </p>
              
              {/* Show selected file name */}
              {pdfFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected file: {pdfFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Proposal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyProposal;