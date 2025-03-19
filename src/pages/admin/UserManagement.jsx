import React, { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { EmployeeTable } from '../../components/adminComponents/EmployeeTable';
import { ClientTable } from '../../components/adminComponents/ClientTable';
import { AddEmployeeModal } from '../../components/adminComponents/AddEmployeeModal';

export const UserManagement = () => {
  console.log("User Rendered!");
  const [selectedTab, setSelectedTab] = useState('employees');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState([
    { id: 1, fullname: 'John Doe', department: 'IT', gmail: 'john.doe@gmail.com', status: 'Active' },
    { id: 2, fullname: 'Jane Smith', department: 'HR', gmail: 'jane.smith@gmail.com', status: 'Inactive' },
    { id: 3, fullname: 'Alice Johnson', department: 'Finance', gmail: 'alice.johnson@gmail.com', status: 'Active' },
    { id: 4, fullname: 'Bob Brown', department: 'Marketing', gmail: 'bob.brown@gmail.com', status: 'Active' }
  ]);

  const dummyClients = [
    { id: 1, fullname: 'John Doe', gmail: 'john.doe@gmail.com', contact: '123-456-7890', status: 'Active' },
  ];

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, { id: employees.length + 1, ...newEmployee }]);
    closeAddModal();
  };

  return (
    <div className='p-6 mt-4'>
      <div className='flex justify-end mb-4'>
        <div className='flex items-center'>
          {selectedTab === 'employees' && (
            <button 
              onClick={openAddModal} 
              className='bg-green-600 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-700 cursor-pointer'>
              <Plus size={20} className='mr-2' /> Add Employee
            </button>
          )}
        </div>
        <div className='flex items-center gap-4 bg-gray-200 p-2 rounded-full'>
          <button 
            className={`px-4 py-2 rounded-full hover:bg-gray-500 hover:text-white cursor-pointer ${selectedTab === 'employees' ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
            onClick={() => setSelectedTab('employees')}>Employees</button>
          <button 
            className={`px-4 py-2 rounded-full hover:bg-gray-500 hover:text-white cursor-pointer ${selectedTab === 'clients' ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
            onClick={() => setSelectedTab('clients')}>Clients</button>
        </div>
      </div>
      
      {selectedTab === 'employees' ? <EmployeeTable employees={employees} /> : <ClientTable clients={dummyClients}/>}

      {/* Add Employee Modal */}
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={closeAddModal} onSubmit={handleAddEmployee} />
    </div>
  );
};
