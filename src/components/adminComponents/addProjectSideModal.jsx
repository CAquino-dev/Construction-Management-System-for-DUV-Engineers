import React, { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const AddProjectSideModal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  // States to hold the form data
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState("Pending");
  const [projectManager, setProjectManager] = useState("");
  const [contractorDetails, setContractorDetails] = useState("");
  const [costBreakdown, setCostBreakdown] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState("");
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState("");

  useEffect(() => {
    const getEngineers = async () => {
      try {
        const response = await fetch('${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/getEngineers');
        const data = await response.json();
        if(response.ok){
          setEngineers(data)
        }
      } catch (error) {
        console.error("Error fetching payroll records:", error);
      }
    };
    getEngineers();
  }, [])


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const projectData = {
      engineer: selectedEngineer,
      project_name: projectName,
      client_name: clientName,
      project_type: projectType,
      description,
      location,
      start_date: startDate,
      end_date: endDate,
      budget,
      status,
      contractor_details: contractorDetails,
      cost_breakdown: costBreakdown,
      payment_schedule: paymentSchedule
    };

    console.log(projectData);

    // try {
    //   const response = await fetch("${import.meta.env.VITE_REACT_APP_API_URL}/api/projects", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(projectData),
    //   });

    //   const result = await response.json();
    //   if (response.ok) {
    //     console.log("Project created successfully:", result);
    //     closeModal(); // Close the modal after successful creation
    //   } else {
    //     console.error("Failed to create project:", result);
    //   }
    // } catch (error) {
    //   console.error("Error creating project:", error);
    // }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900/70 flex justify-end z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-1/3 bg-white shadow-lg h-full rounded-2xl p-6 overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Project</h2>
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-red-500 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
        

        {/* Basic Project Information */}
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Engineer
          </h3>
          <select
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
          <h3 className="text-lg font-semibold text-gray-700">
            Basic Project Information
          </h3>
          <div className="space-y-3 mt-2">
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Project Type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Project Scope & Details */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Project Scope & Details
          </h3>
          <div className="space-y-3 mt-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project Description"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              type="text"
              placeholder="Location"
              className="w-full p-2 border rounded-md"
            />
            <input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              className="w-full p-2 border rounded-md"
            />
            <input
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              type="date"
              className="w-full p-2 border rounded-md"
            />
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              type="number"
              placeholder="Project Budget ($)"
              className="w-full p-2 border rounded-md"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Financials & Payments */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Financials & Payments
          </h3>
          <div className="space-y-3 mt-2">
            <textarea
              value={costBreakdown}
              onChange={(e) => setCostBreakdown(e.target.value)}
              placeholder="Project Cost Breakdown"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <textarea
              value={paymentSchedule}
              onChange={(e) => setPaymentSchedule(e.target.value)}
              placeholder="Payment Schedule"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <motion.button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
          >
            Add Project
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddProjectSideModal;
