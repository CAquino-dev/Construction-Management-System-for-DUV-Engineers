import React, { useState } from 'react';

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [id]: value
    }));
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
            Client Name
          </label>
          <input
            id="client"
            type="text"
            value={projectData.client}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Location Input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={projectData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
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

        {/* Project Manager Input */}
        <div>
          <label htmlFor="projectManager" className="block text-sm font-medium text-gray-700">
            Project Manager
          </label>
          <input
            id="projectManager"
            type="text"
            value={projectData.projectManager}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            {/* Start Date Input */}
            <div >
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Start Date
            </label>
            <input
                id="startDate"
                type="date"
                value={projectData.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
            />
            </div>
            {/* End Date Input */}
            <div>
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                End Date
            </label>
            <input
                id="endDate"
                type="date"
                value={projectData.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
            />
            </div>
        </div>
        

        {/* Completion Date Input */}
        <div>
          <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
            Completion Date
          </label>
          <input
            id="completionDate"
            type="date"
            value={projectData.completionDate}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Contract Value Input */}
        <div>
          <label htmlFor="contractValue" className="block text-sm font-medium text-gray-700">
            Contract Value
          </label>
          <input
            id="contractValue"
            type="text"
            value={projectData.contractValue}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Budget Allocated Input */}
        <div>
          <label htmlFor="budgetAllocated" className="block text-sm font-medium text-gray-700">
            Budget Allocated
          </label>
          <input
            id="budgetAllocated"
            type="text"
            value={projectData.budgetAllocated}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Budget Used Input */}
        <div>
          <label htmlFor="budgetUsed" className="block text-sm font-medium text-gray-700">
            Budget Used
          </label>
          <input
            id="budgetUsed"
            type="text"
            value={projectData.budgetUsed}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={projectData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>

        {/* Budget Input */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Budget
          </label>
          <input
            id="budget"
            type="text"
            value={projectData.budget}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Progress Input */}
        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
            Progress
          </label>
          <input
            id="progress"
            type="number"
            value={projectData.progress}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button
            className="w-full py-2 bg-[#3b5d47] text-white rounded-md"
          >
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
};
