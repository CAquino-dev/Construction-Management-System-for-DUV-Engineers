import React, { useEffect, useState } from "react";

const Lead = () => {
  const [formData, setFormData] = useState({
    client_name: "",
    email: "",
    phone_number: "",
    project_interest: "",
    budget: "",
    timeline: "",
  });

  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getLeads`
        );
        const data = await response.json();
        console.log(data);
        setLeads(data);
      } catch (err) {
        setError("Failed to fetch leads");
      }
    };

    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/createLead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Lead Added Successfully");
      } else {
        alert("An error occurred while adding the Lead");
      }
    } catch (error) {
      console.log("Error message:", error);
    }
  };

  return (
    <div className="sm:h-screen">
      <div className="flex flex-col sm:flex-row gap-4 justify-center h-3/5">
        {/* Left Panel */}
        <div className="sm:w-6/11 p-4 rounded shadow bg-white">
          <h2 className="text-2xl font-bold mb-4">Capture Lead</h2>
          <form onSubmit={handleSubmit} className="space-y-4 p-6 h-6/7">
            <input
              type="text"
              name="client_name"
              placeholder="Client Name"
              value={formData.client_name}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-gray-100"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-gray-100"
              required
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number (optional)"
              value={formData.phone_number}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-gray-100"
            />
            <textarea
              name="project_interest"
              placeholder="Project Interest"
              value={formData.project_interest}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full max-h-32 overflow-y-auto bg-gray-100"
              required
            />
            <input
              type="number"
              name="budget"
              placeholder="Budget (optional)"
              value={formData.budget}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-gray-100"
            />
            <input
              type="text"
              name="timeline"
              placeholder="Timeline (optional)"
              value={formData.timeline}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full bg-gray-100"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#4c735c] shadow-lg text-white px-4 py-2 rounded hover:bg-[#4c735c]/90 cursor-pointer transition duration-300 ease-in-out"
              >
                Save Lead
              </button>
            </div>
          </form>

          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </div>

        {/* Right Panel */}
        <div className="sm:w-5/11 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Lead List</h3>
          <div className="overflow-y-auto h-64 sm:h-6/7">
            <ul className="space-y-2 border-t">
              {leads.map((lead) => (
                <li
                  key={lead.id}
                  className="border border-gray-100 rounded p-4 bg-gray-50 shadow-md rounded-xl"
                >
                  <p className="text-gray-700">
                    <span className="font-semibold">Name:</span> {lead.client_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Email:</span> {lead.email}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Phone:</span> {lead.phone_number}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Project Interest:</span>{" "}
                    {lead.project_interest}
                  </p>
                  <p className="text-gray-700">
                    <strong>Budget:</strong> {lead.budget}
                  </p>
                  <p className="text-gray-700">
                    <strong>Timeline:</strong> {lead.timeline}
                  </p>
                  <p className="text-gray-700">
                    <strong>Status:</strong> {lead.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lead;
