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
          const response = await fetch("http://localhost:5000/api/users/getEmployees");
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
      <div className='flex justify-end mb-4'>
        <div className='flex items-center gap-4 bg-[#4c735c] p-2 rounded-full'>
          <button 
            className={`px-4 py-2 rounded-full hover:text-[] cursor-pointer ${selectedTab === 'employees' ? 'bg-[#2e4b3a] text-white' : 'text-white'}`}
            onClick={() => setSelectedTab('employees')}>Employees</button>
          <button 
            className={`px-4 py-2 rounded-full hover:text-white cursor-pointer ${selectedTab === 'clients' ? 'bg-[#2e4b3a] text-white' : 'text-white'}`}
            onClick={() => setSelectedTab('clients')}>Clients</button>
        </div>
      </div>
      
      {selectedTab === 'employees' ? <EmployeeTable employees={employees} /> : <ClientTable clients={dummyClients}/>}
    </div>
  );
};
