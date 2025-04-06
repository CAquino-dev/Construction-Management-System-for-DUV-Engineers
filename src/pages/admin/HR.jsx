import React, { useEffect, useState } from 'react';
import { EmployeeTable } from '../../components/adminComponents/EmployeeTable';
import { EmployeeDetails } from "../../components/adminComponents/EmployeeDetails";


export const HR = () => {
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
                {/* Employee Table */}
                <div className="overflow-x-auto">
                <EmployeeTable employees={employees} setSelectedUser={setSelectedUser} />
                </div>
            </>
            )}
            </div>
        </div>
    );
};