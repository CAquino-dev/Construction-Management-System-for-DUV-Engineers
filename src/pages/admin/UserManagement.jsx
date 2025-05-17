import React, { useEffect, useState } from 'react';
import { EmployeeTable } from '../../components/adminComponents/EmployeeTable';
import { ClientTable } from '../../components/adminComponents/ClientTable';

export const UserManagement = () => {
  const [selectedTab, setSelectedTab] = useState('employees');
  // const [employees, setEmployees] = useState([
  //   { id: 1, fullname: 'John Doe', department: 'IT', gmail: 'john.doe@gmail.com', status: 'Active' },
  //   { id: 2, fullname: 'Jane Smith', department: 'HR', gmail: 'jane.smith@gmail.com', status: 'Inactive' },
  //   { id: 3, fullname: 'Alice Johnson', department: 'Finance', gmail: 'alice.johnson@gmail.com', status: 'Active' },
  //   { id: 4, fullname: 'Bob Brown', department: 'Marketing', gmail: 'bob.brown@gmail.com', status: 'Active' }
  // ]);

  const dummyClients = [
    { id: 1, fullname: 'John Doe', gmail: 'john.doe@gmail.com', contact: '123-456-7890', status: 'Active' },
  ];
  
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
          const response = await fetch("${import.meta.env.VITE_REACT_APP_API_URL}/api/users/getEmployees");
          const data = await response.json();
          setEmployees(data);
      } catch (error) {
          console.error("Error fetching users:", error);
      }
  };

  fetchUsers();
  }, [])

  return (
    <div className='p-6 mt-15 bg-white rounded-lg shadow-sm'>
       <ClientTable clients={dummyClients}/>
    </div>
  );
};
