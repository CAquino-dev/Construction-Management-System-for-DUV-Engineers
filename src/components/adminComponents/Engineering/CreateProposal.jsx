import React, { useEffect, useState } from 'react';

const CreateProposal = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope_of_work: [''],
    budget_estimate: '',
    timeline_estimate: '',
    payment_terms: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState({ success: '', error: '', approvalLink: '' });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getLeads`)
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(() => setMessage({ error: 'Failed to fetch leads', success: '', approvalLink: '' }));
  }, []);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setMessage({ success: '', error: '', approvalLink: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScopeChange = (index, value) => {
    const updated = [...formData.scope_of_work];
    updated[index] = value;
    setFormData(prev => ({ ...prev, scope_of_work: updated }));
  };

  const addScopeField = () => {
    setFormData(prev => ({ ...prev, scope_of_work: [...prev.scope_of_work, ''] }));
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ success: '', error: '', approvalLink: '' });

    if (!pdfFile || pdfFile.type !== 'application/pdf') {
      return setMessage({ error: 'Please upload a valid PDF file', success: '', approvalLink: '' });
    }

    const data = new FormData();
    data.append('lead_id', selectedLead.id);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('scope_of_work', JSON.stringify(formData.scope_of_work));
    data.append('budget_estimate', formData.budget_estimate);
    data.append('timeline_estimate', formData.timeline_estimate);
    data.append('payment_terms', formData.payment_terms);
    data.append('proposal_file', pdfFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/createProposal`, {
        method: 'POST',
        body: data
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Something went wrong');

      setMessage({
        success: result.message || 'Proposal created successfully!',
        error: '',
        approvalLink: result.approvalLink || ''
      });

      setFormData({
        title: '',
        description: '',
        scope_of_work: [''],
        budget_estimate: '',
        timeline_estimate: '',
        payment_terms: ''
      });
      setPdfFile(null);
      setSelectedLead(null);
    } catch (err) {
      setMessage({ error: err.message, success: '', approvalLink: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-15">
      <h1 className="text-2xl font-bold mb-4">Create Proposal</h1>

      {/* ✅ Success/Error Message */}
      {(message.success || message.error) && (
        <div className={`p-4 mb-6 rounded shadow ${message.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message.success && <p className="font-semibold">{message.success}</p>}
          {message.error && <p className="font-semibold">{message.error}</p>}
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

      {/* ✅ Lead Selection */}
      <h2 className="text-lg font-semibold mb-2">Select a Lead</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {leads.map(lead => (
          <div
            key={lead.id}
            className={`border p-4 rounded shadow cursor-pointer ${selectedLead?.id === lead.id ? 'border-blue-500' : ''}`}
            onClick={() => handleLeadSelect(lead)}
          >
            <h3 className="font-bold">{lead.client_name}</h3>
            <p className="text-sm text-gray-600">{lead.project_interest}</p>
            <p className="text-xs text-gray-500">Budget: ₱{lead.budget}</p>
            <p className="text-xs text-gray-500">Timeline: {lead.timeline}</p>
          </div>
        ))}
      </div>

      {/* ✅ Proposal Form */}
      {selectedLead && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4" encType="multipart/form-data">
          <h2 className="text-xl font-semibold">Proposal for {selectedLead.client_name}</h2>

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

          <input
            type="text"
            name="timeline_estimate"
            placeholder="Estimated Timeline"
            value={formData.timeline_estimate}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />

          <input
            type="text"
            name="payment_terms"
            placeholder="Payment Terms (e.g. 50% down, 30% progress, 20% completion)"
            value={formData.payment_terms}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <div>
            <label className="block mb-1 font-medium">Attach Proposal PDF</label>
            <input
              name='proposal_file'
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className="block w-full"
            />
          </div>

          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Submit Proposal
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateProposal;
