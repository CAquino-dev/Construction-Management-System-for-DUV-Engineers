import React, { useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { EmployeeTable } from '../../components/adminComponents/EmployeeTable';
import { AttendanceEmployee } from '../../components/adminComponents/AttendanceEmployee';
import { EmployeesBoxHorizontal } from '../../components/adminComponents/EmployeesBoxHorizontal';
import { AddEmployeeModal } from '../../components/adminComponents/AddEmployeeModal';


export const HR = () => {
    const [selectedTab, setSelectedTab] = useState('employees');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const handleAddEmployee = (newEmployee) => {
        setEmployees([...employees, { id: employees.length + 1, ...newEmployee }]);
        closeAddModal();
    };

    return (
        <div className='p-6 mt-10'>
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
                        onClick={() => setSelectedTab('employees')}>Employees
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-full hover:bg-gray-500 hover:text-white cursor-pointer ${selectedTab === 'attendance' ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
                        onClick={() => setSelectedTab('attendance')}>Attendance
                    </button>
                </div>
            </div>
            {selectedTab === 'employees' ? (
                <EmployeeTable employees={employees} />
            ) : (
                <div>
                    <EmployeesBoxHorizontal employees={employees} />
                    <AttendanceEmployee employees={employees} />
                </div>
            )}

            <AddEmployeeModal isOpen={isAddModalOpen} onClose={closeAddModal} onSubmit={handleAddEmployee} />

        </div>
    );
};