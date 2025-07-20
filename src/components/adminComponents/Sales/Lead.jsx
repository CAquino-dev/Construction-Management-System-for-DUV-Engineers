import React, { useEffect, useState } from 'react'

const Lead = () => {
  const [formData, setFormData] = useState({
    client_name: '',
    contact_info: '',
    project_interest: '',
    budget: '',
    timeline: ''
  });
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch leads list on mount
  useEffect(() => {
    const fetchLeads = async() => {
      try{
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getLeads`);
        const data = await response.json();
        console.log(data);
        setLeads(data);
      }catch(err){
        setError("Failed to fetch leads")
      }
    }

    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/createLead`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(formData),  // Send the FormData (multipart/form-data)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Lead Added Successfully');
      } else {
        alert('An error occurred while adding the Lead');
      }
    } catch (error) {
      console.log('Error message:', error);
    }
  };

  return (
    <div className="mt-15 p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Capture Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input
          type="text"
          name="client_name"
          placeholder="Client Name"
          value={formData.client_name}
          onChange={handleChange}
          className="border rounded p-2 w-full"
          required
        />
        <input
          type="text"
          name="contact_info"
          placeholder="Contact Info"
          value={formData.contact_info}
          onChange={handleChange}
          className="border rounded p-2 w-full"
          required
        />
        <textarea
          name="project_interest"
          placeholder="Project Interest"
          value={formData.project_interest}
          onChange={handleChange}
          className="border rounded p-2 w-full"
          required
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget (optional)"
          value={formData.budget}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          name="timeline"
          placeholder="Timeline (optional)"
          value={formData.timeline}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save Lead</button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}

      <h3 className="text-xl mt-8 mb-4">Lead List</h3>
      <ul className="space-y-2">
        {leads.map((lead) => (
          <li key={lead.id} className="border rounded p-4 bg-gray-50">
            <p><strong>Name:</strong> {lead.client_name}</p>
            <p><strong>Contact:</strong> {lead.contact_info}</p>
            <p><strong>Interest:</strong> {lead.project_interest}</p>
            <p><strong>Budget:</strong> {lead.budget}</p>
            <p><strong>Timeline:</strong> {lead.timeline}</p>
            <p><strong>Status:</strong> {lead.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lead
