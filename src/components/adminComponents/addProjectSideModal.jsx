import React from "react";
import { X } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const AddProjectSideModal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

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
            Basic Project Information
          </h3>
          <div className="space-y-3 mt-2">
            <input
              type="text"
              placeholder="Project Name"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Client Name"
              className="w-full p-2 border rounded-md"
            />
            <select className="w-full p-2 border rounded-md">
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
              placeholder="Project Description"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <input
              type="text"
              placeholder="Location"
              className="w-full p-2 border rounded-md"
            />
            <input type="date" className="w-full p-2 border rounded-md" />
            <input type="date" className="w-full p-2 border rounded-md" />
            <input
              type="number"
              placeholder="Project Budget ($)"
              className="w-full p-2 border rounded-md"
            />
            <select className="w-full p-2 border rounded-md">
              <option value="">Select Project Status</option>
              <option value="Planning">Planning</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Team & Resources */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Team & Resources</h3>
          <div className="space-y-3 mt-2">
            <input
              type="text"
              placeholder="Project Manager"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Assigned Team Members"
              className="w-full p-2 border rounded-md"
            />
            <textarea
              placeholder="Materials & Resources"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
        </div>

        {/* Contract & Documentation */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Contract & Documentation
          </h3>
          <div className="space-y-3 mt-2">
            <input
              type="text"
              placeholder="Contractor Details"
              className="w-full p-2 border rounded-md"
            />
            <label className="block text-sm font-medium text-gray-700">
              Upload Contract Documents
            </label>
            <input type="file" className="w-full p-2 border rounded-md" />
            <textarea
              placeholder="Milestones & Tasks"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
        </div>

        {/* Financials & Payments */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Financials & Payments
          </h3>
          <div className="space-y-3 mt-2">
            <textarea
              placeholder="Project Cost Breakdown"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <textarea
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
          >
            Add Project
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddProjectSideModal;
