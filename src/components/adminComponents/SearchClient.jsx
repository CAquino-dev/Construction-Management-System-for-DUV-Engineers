import React, { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

export const SearchClient = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (query) => {
    onSearch(query);
  }

  return (
    <div className="flex gap-4 mb-4 items-center relative w-full max-w-sm">
        <div>
            <MagnifyingGlass size={20} className="absolute left-3 top-2.5 text-gray-500" />
            <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                }}
                className="p-2 pl-10 border rounded w-64"
            />
        </div>
      
    </div>
  );
};
