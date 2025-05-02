import React, { useState, useEffect } from "react";

export const AddProject = () => {
  const [projectData, setProjectData] = useState({
    projectCode: "",
    projectName: "",
    client: "",
    location: "",
    projectType: "",
    description: "",
    projectManager: "",
    startDate: "",
    endDate: "",
    completionDate: "",
    contractValue: "",
    budgetAllocated: "",
    budgetUsed: "",
    status: "",
    budget: "",
    progress: "",
    remarks: "",
    createdAt: "",
    updatedAt: ""
  });

  const [engineers, setEngineers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(""); // Store selected engineer ID
  const [selectedEngineer, setSelectedEngineer] = useState(""); // Store selected engineer ID

  useEffect(() => {
    const getEngineers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/engr/getEngineers');
        const data = await response.json();
        if (response.ok) {
          setEngineers(data);
        }
      } catch (error) {
        console.error("Error fetching engineers:", error);
      }
    };

    const getClients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/engr/getClients');
        const data = await response.json();
        if (response.ok) {
          setClients(data);
        }
      } catch (error) {
        console.error("Error fetching engineers:", error);
      }
    };
    getEngineers();
    getClients();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectDataToSubmit = {
      project_name: projectData.projectName,
      client_id: selectedClient ,
      project_type: projectData.projectType,
      description: projectData.description,
      location: projectData.location,
      start_date: projectData.startDate,
      end_date: projectData.endDate,
      budget: projectData.budgetAllocated,
      status: projectData.status,
      cost_breakdown: projectData.costBreakdown,
      payment_schedule: projectData.paymentSchedule,
      engineer_id: selectedEngineer, // Include selected engineer in the project data
    };

    console.log(projectDataToSubmit);

    // You can now submit this data to your backend for storing in the database.
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add a New Project</h2>
      <div className="space-y-4">
        {/* Project Code Input */}
        <div>
          <label htmlFor="projectCode" className="block text-sm font-medium text-gray-700">
            Project Code
          </label>
          <input
            id="projectCode"
            type="text"
            value={projectData.projectCode}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Project Name Input */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            id="projectName"
            type="text"
            value={projectData.projectName}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Client Name Input */}
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name} ({client.username})
              </option>
            ))}
          </select>
        </div>

        {/* Engineer Selection Dropdown */}
        <div>
          <label htmlFor="engineer" className="block text-sm font-medium text-gray-700">
            Select Engineer
          </label>
          <select
            id="engineer"
            value={selectedEngineer}
            onChange={(e) => setSelectedEngineer(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Engineer</option>
            {engineers.map((engineer) => (
              <option key={engineer.id} value={engineer.id}>
                {engineer.full_name} ({engineer.username})
              </option>
            ))}
          </select>
        </div>

        {/* Project Type Dropdown */}
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
            Project Type
          </label>
          <select
            id="projectType"
            value={projectData.projectType}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Project Type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        </div>

        {/* Project Scope & Details */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Project Scope & Details</h3>
          <div className="space-y-3 mt-2">
            <textarea
              value={projectData.description}
              onChange={handleChange}
              id="description"
              placeholder="Project Description"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <input
              value={projectData.location}
              onChange={handleChange}
              id="location"
              type="text"
              placeholder="Location"
              className="w-full p-2 border rounded-md"
            />
            <input
              value={projectData.startDate}
              onChange={handleChange}
              id="startDate"
              type="date"
              className="w-full p-2 border rounded-md"
            />
            <input
              value={projectData.endDate}
              onChange={handleChange}
              id="endDate"
              type="date"
              className="w-full p-2 border rounded-md"
            />
            <input
              value={projectData.budgetAllocated}
              onChange={handleChange}
              id="budgetAllocated"
              type="number"
              placeholder="Budget Allocated"
              className="w-full p-2 border rounded-md"
            />
            <select
              value={projectData.status}
              onChange={handleChange}
              id="status"
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>

        {/* Financials & Payments */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Financials & Payments</h3>
          <div className="space-y-3 mt-2">
            <textarea
              value={projectData.costBreakdown}
              onChange={handleChange}
              id="costBreakdown"
              placeholder="Project Cost Breakdown"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <textarea
              value={projectData.paymentSchedule}
              onChange={handleChange}
              id="paymentSchedule"
              placeholder="Payment Schedule"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-[#3b5d47] text-white rounded-md"
          >
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
