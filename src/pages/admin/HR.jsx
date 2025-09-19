import React, { useEffect, useState } from "react";
import { EmployeeTable } from "../../components/adminComponents/HR/EmployeeTable";
import { EmployeeDetails } from "../../components/adminComponents/HR/EmployeeDetails";
import { AddEmployeeModal } from "../../components/adminComponents/HR/AddEmployeeModal";
import { WorkerTable } from "../../components/adminComponents/HR/WorkerTable";

export const HR = () => {
  const [employees, setEmployees] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("employees"); // "employees" | "workers"

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/users/getEmployees`
        );
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchWorkers = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/foreman/getForemanWorkers`
        );
        const data = await response.json();
        setWorkers(data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };

    fetchEmployees();
    fetchWorkers();
  }, []);

  const handleAddEmployee = (employeeData) => {
    setEmployees((prev) => [...prev, employeeData]);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-4">
        {selectedUser ? (
          <EmployeeDetails
            selectedUser={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab("employees")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "employees"
                    ? "border-b-2 border-[#4c735c] text-[#4c735c]"
                    : "text-gray-500 hover:text-[#4c735c]"
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setActiveTab("workers")}
                className={`ml-4 px-4 py-2 font-medium ${
                  activeTab === "workers"
                    ? "border-b-2 border-[#4c735c] text-[#4c735c]"
                    : "text-gray-500 hover:text-[#4c735c]"
                }`}
              >
                Workers of Foreman
              </button>
            </div>

            {/* Add Employee Button (only for Employees) */}
            {activeTab === "employees" && (
              <div className="flex justify-end mb-4">
                <button
                  className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Employee
                </button>
              </div>
            )}

            {/* Table Section */}
            <div className="overflow-x-auto">
              {activeTab === "employees" ? (
                <EmployeeTable
                  employees={employees}
                  setSelectedUser={setSelectedUser}
                />
              ) : (
                <WorkerTable
                  workers={workers}
                  setSelectedUser={setSelectedUser}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddEmployee}
        />
      )}
    </div>
  );
};