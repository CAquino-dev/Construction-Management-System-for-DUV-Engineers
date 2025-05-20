import React, { useEffect, useState } from "react";
import { EmployeeTable } from "../../components/adminComponents/HR/EmployeeTable";
import { EmployeeDetails } from "../../components/adminComponents/HR/EmployeeDetails";
import { AddEmployeeModal } from "../../components/adminComponents/HR/AddEmployeeModal";

export const HR = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/users/getEmployees`);
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddEmployee = (employeeData) => {
    setEmployees((prevEmployees) => [...prevEmployees, employeeData]);
  };

  return (
    <div className="container mx-auto p-6 mt-10">
      <div className="bg-white shadow-md rounded-lg p-4">
        {selectedUser ? (
          <EmployeeDetails selectedUser={selectedUser} onBack={() => setSelectedUser(null)} />
        ) : (
          <>
            {/* Add Employee Button */}
            <div className="flex justify-end mb-4">
              <button 
                className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]" 
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Employee
              </button>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto">
              <EmployeeTable employees={employees} setSelectedUser={setSelectedUser} />
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
