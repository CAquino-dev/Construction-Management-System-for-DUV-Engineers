import React, { useEffect, useState } from 'react';
import { EmployeeTable } from '../../components/adminComponents/EmployeeTable';


export const HR = () => {
    const [employees, setEmployees] = useState([]);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/users/getUsers");
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);
    return (
        <div className='p-6 mt-10'>
            <EmployeeTable employees={employees} />
        </div>
    );
};