import React, { useEffect, useState } from 'react';
import { Eye } from '@phosphor-icons/react';
import EmployeeModal from './EmployeeModal';
import Pagination from './Pagination';
import { SearchEmployee } from './SearchEmployee';

export const EmployeeTable = ({ employees = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees])

  console.log(employees);

  // Handle search
  const handleSearch = (query, department) => {
    let filtered = employees.filter((emp) =>
      emp.fullname.toLowerCase().includes(query.toLowerCase())
    );
    if (department) {
      filtered = filtered.filter((emp) => emp.department === department);
    }
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset pagination
  };

  const totalPages = Math.ceil(filteredEmployees.length / 10);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="p-4">
      <SearchEmployee onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <table className="w-full border-[#3F5C4A] rounded-md text-sm">
          <thead>
            <tr className="bg-[#4c735c] text-white">
              <th className="p-2 text-left pl-4">Full Name</th>
              <th className="p-2">Department</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((user, index) => (
              <tr key={user.id} className={index % 2 === 0 ? "bg-[#f4f6f5] text-center" : "bg-white text-center"}>
                <td className="p-2 flex items-center gap-2">
                  <img src={`#`} alt="Profile" className="w-10 h-10 rounded-full" />
                  {user.full_name}
                </td>
                <td className="p-2">{user.department_name}</td>
                <td className="p-2">{user.email}</td>
                <td className={`p-2 ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status}
                </td>
                <td className="p-2 flex justify-center gap-2">
                  <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="text-black hover:text-gray-600 cursor-pointer">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {isModalOpen && selectedUser && (
        <EmployeeModal selectedUser={selectedUser} closeModal={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
