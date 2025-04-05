import React, { useState, useEffect } from "react";
import { EmployeeTable } from "../../components/adminComponents/EmployeeTable";
import { AddEmployeeModal } from "../../components/adminComponents/AddEmployeeModal";
import { EmployeeDetails } from "../../components/adminComponents/EmployeeDetails";
import { Button } from "../../components/ui/button";


export const EmployeeManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/getEmployees");
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
      <div className="bg-white shadow-md rounded-lg">
        {selectedUser ? (
          <EmployeeDetails selectedUser={selectedUser} onBack={() => setSelectedUser(null)} />
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-end items-center mb-6 p-4">
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                variant="primary"
                className="mt-2 sm:mt-0 bg-[#4c735c] hover:bg-[] text-white cursor-pointer"
              >
                Add Employee
              </Button>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto">
              <EmployeeTable employees={employees} setSelectedUser={setSelectedUser} />
            </div>

            {/* Add Employee Modal */}
            <AddEmployeeModal 
              isOpen={isAddModalOpen} 
              onClose={() => setIsAddModalOpen(false)} 
              onSubmit={handleAddEmployee} 
            />
          </>
        )}
      </div>
    </div>
  );
};
