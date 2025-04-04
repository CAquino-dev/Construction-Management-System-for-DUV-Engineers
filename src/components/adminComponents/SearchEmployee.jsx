import React, { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

export const SearchEmployee = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const handleSearch = (query, department) => {
    onSearch(query, department);
  };

  return (
    <div className="flex gap-4 mb-4 items-center">
      {/* Search Bar with Icon */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value, selectedDepartment);
          }}
          className="p-2 pl-10 border-1 border-[#4C7259] rounded w-64 focus:outline-none focus:border-[#3F5C4A]"
        />
        <MagnifyingGlass size={18} className="absolute left-3 top-3 text-[#4C7259]" />
      </div>

      {/* Department Dropdown */}
      <select
        value={selectedDepartment}
        onChange={(e) => {
          setSelectedDepartment(e.target.value);
          handleSearch(searchQuery, e.target.value);
        }}
        className="p-2 border rounded text-[#4C7259] font-semibold border-[#4C7259] focus:outline-none focus:border-[#3F5C4A]"
      >
        <option value="">All Departments</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
      </select>
    </div>
  );
};
