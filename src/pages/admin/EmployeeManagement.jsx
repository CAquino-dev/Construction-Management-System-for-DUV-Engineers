import React, { useEffect, useState } from 'react';
import { EmployeeTable } from '../../components/adminComponents/EmployeeTable';
import { AddEmployeeModal } from '../../components/adminComponents/AddEmployeeModal';

export const EmployeeManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

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
    // Example of handling the form submission, such as adding to the local list
    setEmployees((prevEmployees) => [...prevEmployees, employeeData]);
  };

  return (
    <div className="p-6 mt-15 bg-white rounded-lg shadow-sm">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#4C7259] text-white rounded hover:bg-[#3F5C4A] cursor-pointer"
        >
          Add Employee
        </button>
      </div>

      <EmployeeTable employees={employees} />

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee} 
      />
    </div>
  );
};
