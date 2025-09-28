import React, { useEffect, useState } from "react";
import axios from "axios";

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
          const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/getPaymentTerms`);
          if(res.data){
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
    data.append("payment_terms", paymentTerms.find(t => t.id == formData.payment_terms)?.name || "");
    data.append("proposal_file", pdfFile);

    data.forEach((data) => {
      console.log(data);
    })

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
                    ? "border-[#4c735c] bg-[#4c735c]"
                    : "hover:bg-[#4c735c]/10"
                }`}
                onClick={() => handleLeadSelect(lead)}
              >
                <h3 className="font-bold">{lead.client_name}</h3>
                <p className="text-sm text-gray-600">{lead.project_interest}</p>
                <p className="text-xs text-gray-500">Budget: ₱{lead.budget}</p>
                <p className="text-xs text-gray-500">
                  Timeline: {lead.timeline}
                </p>
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
              {message.approvalLink && (
                <div className="mt-2">
                  <p className="text-sm">Approval Link:</p>
                  <a
                    href={message.approvalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {message.approvalLink}
                  </a>
                </div>
              )}
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
                type="submit"
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
      </div>
    </div>
  );
};

export default CreateProposal;
