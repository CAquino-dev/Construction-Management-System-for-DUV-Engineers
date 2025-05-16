import React, { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

const SearchEmployee = ({ onSearch }) => {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const handleSearch = (query, department) => {
    onSearch(query, department);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      
      {/* Search Bar with Icon */}
      <div className="relative w-full sm:w-64">
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value, selectedDepartment);
          }}
          className="pl-10 w-full"
        />
        <MagnifyingGlass size={18} className="absolute left-3 top-3 text-[#4C7259]" />
      </div>

      {/* Department Dropdown */}
      <Select
        value={selectedDepartment}
        onValueChange={(value) => {
          setSelectedDepartment(value);
          handleSearch(searchQuery, value);
        }}
      >
        <SelectTrigger className="w-full sm:w-40 cursor-pointer">
          <SelectValue placeholder="Select Department" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="IT">IT</SelectItem>
          <SelectItem value="HR">HR</SelectItem>
          <SelectItem value="Finance">Finance</SelectItem>
          <SelectItem value="Marketing">Marketing</SelectItem>
        </SelectContent>

      </Select>

    </div>
  );
};

export default SearchEmployee;
