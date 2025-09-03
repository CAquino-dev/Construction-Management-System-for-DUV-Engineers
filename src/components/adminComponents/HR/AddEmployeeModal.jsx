import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";

export const AddEmployeeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    contactNo: "",
    age: "",
    birthday: "",
    address: "",
    role_id: "",
    employmentStatus: "",
    jobTitle: "",
    dateHired: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyContact: "",
    email: "",
    department_id: "",
    password: "",
    hourly_rate: "",
    permissions: {} // store selected permissions here
  });

  const employmentStatuses = ["Active", "On Leave", "Resigned"];
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/getPermissions`
        );
        const data = await response.json();

        setRoles(data.roles || []);
        setPermissions(data.permissions || []);

        // initialize permissions state (all "N")
        const initialPerms = {};
        (data.permissions || []).forEach((p) => {
          initialPerms[p.key] = "N";
        });

        setFormData((prev) => ({ ...prev, permissions: initialPerms }));
      } catch (error) {
        console.error("Error fetching roles/permissions:", error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/getDepartments`
        );
        const data = await response.json();
        setDepartments(data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchInitialData();
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: prev.permissions[key] === "Y" ? "N" : "Y",
      },
    }));
  };

  const handleSelectAll = () => {
    const allSelected = permissions.every(
      (p) => formData.permissions[p.key] === "Y"
    );

    const updatedPerms = {};
    permissions.forEach((p) => {
      updatedPerms[p.key] = allSelected ? "N" : "Y";
    });

    setFormData((prev) => ({
      ...prev,
      permissions: updatedPerms,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Convert permissions object → array
  const permissionsArray = Object.entries(formData.permissions).map(
    ([key, value]) => ({ permission_key: key, value })
  );

  const payload = { ...formData, permissions: permissionsArray };

  console.log("Submitting employee:", payload);
  onSubmit(payload);

  // try {
  //   const response = await fetch(
  //     `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/addEmployee`,
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     }
  //   );

  //   const data = await response.json();

  //   if (response.ok) {
  //     alert(data.message);
  //     onClose();
  //   } else {
  //     alert(data.error);
  //   }
  // } catch (error) {
  //   console.error("Error submitting form:", error);
  //   alert("An error occurred while adding the employee.");
  // }
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
            <h3 className="text-md font-semibold text-gray-700">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <select
                name="gender"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="date"
                name="birthday"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="contactNo"
                placeholder="Contact No"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                onChange={handleChange}
                className="col-span-2 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">
              Employment Information
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <select
                name="employmentStatus"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Employment Status</option>
                {employmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                name="department_id"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="jobTitle"
                placeholder="Job Title"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="date"
                name="dateHired"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="number"
                name="hourly_rate"
                placeholder="Hourly Rate"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input
                type="text"
                name="emergencyName"
                placeholder="Contact Name"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="emergencyRelationship"
                placeholder="Relationship (e.g., Parent, Spouse)"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="emergencyContact"
                placeholder="Contact No"
                onChange={handleChange}
                className="col-span-2 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Employee Account */}
          <div>
            <h3 className="text-md font-semibold text-gray-700">
              Employee Account
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* System Access */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mt-4">
              System Access
            </h3>

            {/* Access Per Role */}
            <div className="p-4 bg-gray-100 rounded-md mt-2">
              <h4 className="text-sm font-semibold text-gray-700">
                Access Per Role
              </h4>
              <select
                name="role_id"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md mt-2"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customized Access */}
            <div className="p-4 bg-gray-100 rounded-md mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Customized Access
                </h4>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions[perm.key] === "Y"}
                      onChange={() => handlePermissionToggle(perm.key)}
                    />
                    <span className="text-sm text-gray-800">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#4c735c] text-white px-4 py-2 rounded-full flex items-center cursor-pointer"
            >
              Add Employee
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
