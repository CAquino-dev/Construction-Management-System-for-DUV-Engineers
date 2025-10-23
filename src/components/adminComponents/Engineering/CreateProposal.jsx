import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfirmationModal from "../ConfirmationModal";
import SiteVisitReport from "./SiteVisitReport";

const CreateProposal = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scope_of_work: [""],
    budget_estimate: "",
    start_date: "",
    end_date: "",
    payment_terms: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState({
    success: "",
    error: "",
    approvalLink: "",
  });
  const [showFormMobile, setShowFormMobile] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState(false);
  const [selectedLeadForSiteVisit, setSelectedLeadForSiteVisit] = useState(null);

  const handleOpenConfirm = () => {
    if (!selectedLead) {
      setMessage({ error: "Please select a lead first.", success: "" });
      return;
    }

    const requiredFields = [
      formData.title,
      formData.description,
      formData.scope_of_work[0],
      formData.budget_estimate,
      formData.start_date,
      formData.end_date,
      formData.payment_terms,
      pdfFile,
    ];

    const hasEmpty = requiredFields.some(
      (field) => !field || (typeof field === "string" && field.trim() === "")
    );

    if (hasEmpty) {
      setMessage({
        error:
          "⚠️ Please fill out all required fields and upload a PDF before submitting.",
        success: "",
      });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getLeads`)
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch(() =>
        setMessage({
          error: "Failed to fetch leads",
          success: "",
          approvalLink: "",
        })
      );

    const fetchPaymentTerms = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/projectManager/getPaymentTerms`
        );
        if (res.data) {
          setPaymentTerms(res.data);
          console.log(res.data);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };
    fetchPaymentTerms();
  }, []);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setMessage({ success: "", error: "", approvalLink: "" });
    // On mobile, show the form and hide the leads list
    if (window.innerWidth < 768) setShowFormMobile(true);
  };

  const handleBackMobile = () => {
    setShowFormMobile(false);
    setSelectedLead(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScopeChange = (index, value) => {
    const updated = [...formData.scope_of_work];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, scope_of_work: updated }));
  };

  const addScopeField = () => {
    setFormData((prev) => ({
      ...prev,
      scope_of_work: [...prev.scope_of_work, ""],
    }));
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ success: "", error: "", approvalLink: "" });

    if (!pdfFile || pdfFile.type !== "application/pdf") {
      return setMessage({
        error: "Please upload a valid PDF file",
        success: "",
        approvalLink: "",
      });
    }

    const data = new FormData();
    data.append("lead_id", selectedLead.id);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("scope_of_work", JSON.stringify(formData.scope_of_work));
    data.append("budget_estimate", formData.budget_estimate);
    data.append("start_date", formData.start_date);
    data.append("end_date", formData.end_date);
    data.append("payment_term_id", formData.payment_terms); // the ID from select
    data.append(
      "payment_terms",
      paymentTerms.find((t) => t.id == formData.payment_terms)?.name || ""
    );
    data.append("proposal_file", pdfFile);

    data.forEach((data) => {
      console.log(data);
    });

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/projectManager/createProposal`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      setMessage({
        success: result.message || "Proposal created successfully!",
        error: "",
        approvalLink: result.approvalLink || "",
      });

      setFormData({
        title: "",
        description: "",
        scope_of_work: [""],
        start_date: "",
        end_date: "",
        payment_terms: "",
      });
      setPdfFile(null);
      setSelectedLead(null);
    } catch (err) {
      setMessage({ error: err.message, success: "", approvalLink: "" });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 h-full md:h-3/3">
      {/* Left Pane: Scrollable Leads List */}
      <div
        className={`w-full md:w-2/5 border-r pr-4 bg-white shadow px-4 py-2 rounded-md mb-4 md:mb-0 ${
          showFormMobile ? "hidden" : ""
        } md:block`}
        style={{ maxHeight: "100%" }}
      >
        <h2 className="text-lg font-semibold mb-2">Select a Lead</h2>
        <div className="h-96 md:h-8/9 overflow-y-auto border-t">
          <ul className="space-y-2 my-4 ">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className={`p-4 rounded shadow cursor-pointer bg-gray-100 border ${
                  selectedLead?.id === lead.id
                    ? "border-[#4c735c] bg-[#4c735c] text-white"
                    : "hover:bg-[#4c735c]/10"
                }`}
                onClick={() => handleLeadSelect(lead)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{lead.client_name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedLead?.id === lead.id 
                      ? "bg-white text-[#4c735c]" 
                      : "bg-[#4c735c] text-white"
                  }`}>
                    {lead.status?.replace('_', ' ') || 'New'}
                  </span>
                </div>
                
                <p className="text-sm mb-3 font-medium">{lead.project_interest}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="font-semibold">Budget:</span>
                    <p>{lead.budget ? `₱${lead.budget}` : 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Timeline:</span>
                    <p>{lead.timeline || 'Not specified'}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t pt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">📧</span>
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">📞</span>
                    <span>{lead.phone_number || 'Not provided'}</span>
                  </div>
                  {lead.site_visit_date && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">📅</span>
                      <span>
                        {formatDate(lead.site_visit_date)} at {formatTime(lead.site_visit_time)}
                      </span>
                    </div>
                  )}
                  {lead.site_location && (
                    <div className="flex items-start gap-1">
                      <span className="font-semibold mt-0.5">📍</span>
                      <span className="text-xs line-clamp-2">{lead.site_location}</span>
                    </div>
                  )}
                </div>

                {lead.site_visit_notes && (
                  <div className="mt-2 p-2 bg-black/10 rounded text-xs">
                    <span className="font-semibold">Notes:</span>
                    <p className="line-clamp-2">{lead.site_visit_notes}</p>
                  </div>
                )}

                {/* Site Visit Report Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLeadForSiteVisit(lead.id);
                    setIsSiteVisitOpen(true);
                  }}
                  className="mt-2 w-full text-xs text-center bg-[#4c735c] text-white py-1 rounded hover:bg-[#3e5e4b]"
                >
                  📋 View Site Visit Report
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Right Pane: Proposal Form or Message */}
      <div
        className={`w-full md:w-3/5 pl-0 md:pl-6 flex flex-col h-full md:h-3/3 overflow-y-auto bg-white shadow px-2 md:px-4 py-2 rounded-md ${
          showFormMobile ? "" : "hidden"
        } md:block`}
      >
        {/* Back button for mobile */}
        <div className="md:hidden mb-4">
          <button
            onClick={handleBackMobile}
            className="text-[#4c735c] font-semibold flex items-center gap-1 mb-2"
          >
            <span className="text-xl">←</span> Back
          </button>
        </div>
        <h1 className="text-lg font-semibold pb-2">Create Proposal</h1>
        <div className="flex-grow overflow-y-auto border-t">
          {/* Success/Error Message */}
          {(message.success || message.error) && (
            <div
              className={`mt-5 p-4 mb-6 rounded shadow ${
                message.error
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message.success && (
                <p className="font-semibold">{message.success}</p>
              )}
              {message.error && (
                <p className="font-semibold">{message.error}</p>
              )}
                <div className="mt-2">
                  <p className="text-sm">Approval Link has been sent to client</p>
                </div>
            </div>
          )}
          {selectedLead ? (
            <form
              onSubmit={handleSubmit}
              className=" p-6 rounded space-y-4"
              encType="multipart/form-data"
            >
              <h2 className="text-xl font-semibold">
                Proposal for{" "}
                <span className="text-[#4c735c] font-bold">
                  {selectedLead.client_name}
                </span>
              </h2>
              
              {/* Lead Information Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                <h3 className="font-semibold text-[#4c735c] mb-2">Lead Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Project:</span>
                    <p>{selectedLead.project_interest}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p>{selectedLead.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p>{selectedLead.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="truncate">{selectedLead.site_location || 'Not specified'}</p>
                  </div>
                  {selectedLead.site_visit_date && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Site Visit:</span>
                      <p>
                        {formatDate(selectedLead.site_visit_date)} at {formatTime(selectedLead.site_visit_time)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                name="title"
                placeholder="Proposal Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="border p-2 rounded w-full"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
                className="border p-2 rounded w-full"
              />
              <div>
                <label className="block font-medium mb-1">Scope of Work</label>
                {formData.scope_of_work.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => handleScopeChange(index, e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                    placeholder={`Scope item ${index + 1}`}
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={addScopeField}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  + Add More
                </button>
              </div>
              <input
                type="number"
                name="budget_estimate"
                placeholder="Estimated Budget (₱)"
                value={formData.budget_estimate}
                onChange={handleChange}
                required
                className="border p-2 rounded w-full"
              />
              <div>
                <label className="block font-medium">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Payment Terms</label>
                <select
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                >
                  <option value="">-- Select Payment Terms --</option>
                  {paymentTerms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Attach Proposal PDF
                </label>
                <input
                  name="proposal_file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="block w-full"
                />
              </div>
              <button
                type="button"
                onClick={handleOpenConfirm}
                className="bg-[#4c735c] text-white px-4 py-2 rounded cursor-pointer"
              >
                Submit Proposal
              </button>
            </form>
          ) : (
            <div className="flex-1 flex items-center justify-center  text-gray-500 text-lg mt-24">
              Select a lead to create a proposal
            </div>
          )}
        </div>
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            setIsConfirmModalOpen(false);
            handleSubmit(new Event("submit"));
          }}
          actionType={`Submit Proposal for ${
            selectedLead?.client_name || "Lead"
          }`}
        />

        {/* Site Visit Report Modal */}
        <SiteVisitReport
          isOpen={isSiteVisitOpen}
          onClose={() => setIsSiteVisitOpen(false)}
          leadId={selectedLeadForSiteVisit}
        />
      </div>
    </div>
  );
};

export default CreateProposal;