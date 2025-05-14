import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"; // Assuming you're using shadcn UI library

export const AddEmployeeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    contactNo: "",
    age: "",
    birthday: "",
    address: "",
    employeeId: "",
    department: "",
    employmentStatus: "",
    jobTitle: "",
    dateHired: "",
    workingHours: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyContact: "",
    email: "",
  });

  const departments = ["Engineer", "Architect", "Finance"];
  const employmentStatuses = ["Active", "On Leave", "Resigned"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-lg shadow-lg w-[38rem] overflow-y-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold text-gray-800">Add Employee</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Personal Details */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input type="text" name="fullname" placeholder="Full Name" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <input type="number" name="age" placeholder="Age" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <select name="gender" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                <option value="" disabled>Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input type="date" name="birthday" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <input type="text" name="contactNo" placeholder="Contact No" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <input type="text" name="address" placeholder="Address" onChange={handleChange} className="col-span-2 w-full px-3 py-2 border rounded-md" required />
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">Employment Information</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input type="text" name="employeeId" placeholder="Employee ID" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <select name="department" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                <option value="" disabled>Select Department</option>
                {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <select name="employmentStatus" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                <option value="" disabled>Employment Status</option>
                {employmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input type="text" name="jobTitle" placeholder="Job Title" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <input type="date" name="dateHired" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
            </div>
          </div>

          {/* Work Schedule & Attendance */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">Work Schedule & Attendance</h3>
            <input type="text" name="workingHours" placeholder="Working Hours (e.g., 9 AM - 5 PM)" onChange={handleChange} className="w-full px-3 py-2 border rounded-md mt-2" required />
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input type="text" name="emergencyName" placeholder="Contact Name" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <input type="text" name="emergencyRelationship" placeholder="Relationship (e.g., Parent, Spouse)" onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              <input type="text" name="emergencyContact" placeholder="Contact No" onChange={handleChange} className="col-span-2 w-full px-3 py-2 border rounded-md" required />
            </div>
          </div>

          {/*System Access*/}
          {/*System Access*/}
<div>
  <Tabs defaultValue="department" className="mt-4">
    <TabsList>
      <TabsTrigger value="department">Access Per Department</TabsTrigger>
      <TabsTrigger value="customized">Customized Access</TabsTrigger>
    </TabsList>
    
    <TabsContent value="department">
      {/* Access Per Department */}
      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="text-md font-semibold text-gray-700">Access Per Department</h3>
        {/* You can add specific department-based access here */}
        <select name="departmentAccess" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
          <option value="" disabled>Select Department Access</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
    </TabsContent>
    
    <TabsContent value="customized">
      {/* Customized Access */}
      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="text-md font-semibold text-gray-700">Customized Access</h3>
        <p className="text-sm text-gray-600">Customize the modules this employee can access.</p>
        {/* Add customization options for specific modules */}
        <div className="flex flex-col gap-4 mt-2">

          {/* HR */}
          <div className="bg-[#3b5d47]/40 p-4 rounded-md">
            <p>HR</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hr-view-access" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="hr-view-access" className="text-sm text-gray-800">View</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hr-edit-access" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="hr-edit-access" className="text-sm text-gray-800">Edit</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hr-delete-access" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="hr-delete-access" className="text-sm text-gray-800">Delete</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hr-add-access" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="hr-add-access" className="text-sm text-gray-800">Add</label>
              </div>
            </div>
          </div>

          {/* Finance */}
          <div className="bg-[#3b5d47]/40 p-4 rounded-md">
            <p>Finance</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="finance--access" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="inventory-access" className="text-sm text-gray-800">kineme</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="finance--access" className="w-5 h-5 cursor-pointer" />
                <label htmlFor="inventory-access" className="text-sm text-gray-800">kineme</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</div>

          {/* <div>
            <h3 className="text-md font-semibold text-gray-700">System Access</h3>
            <div className="bg-[#3b5d47]/40 p-4 rounded-md mt-2 font-semidbold">
              <p>User Permisions</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="can-view" className="w-5 h-5 cursor-pointer" />
                  <label htmlFor="can-view" className="text-sm text-gray-800">Can view</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="can-view" className="w-5 h-5 cursor-pointer" />
                  <label htmlFor="can-view" className="text-sm text-gray-800">Can view</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="can-view" className="w-5 h-5 cursor-pointer" />
                  <label htmlFor="can-view" className="text-sm text-gray-800">Can view</label>
                </div>
              </div>
            </div>
            <div>
            <div className="bg-[#3b5d47]/40 p-4 rounded-md mt-2 font-semidbold">
              <p>HR Permisions</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="can-view" className="w-5 h-5 cursor-pointer" />
                  <label htmlFor="can-view" className="text-sm text-gray-800">Can view</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="can-view" className="w-5 h-5 cursor-pointer" />
                  <label htmlFor="can-view" className="text-sm text-gray-800">Can view</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="can-view" className="w-5 h-5 cursor-pointer" />
                  <label htmlFor="can-view" className="text-sm text-gray-800">Can view</label>
                </div>
              </div>
            </div>
            </div>
          </div> */}

          {/* Submit Button */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="bg-[#4c735c] text-white px-4 py-2 rounded-full flex items-center cursor-pointer">
              Add Employee
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
