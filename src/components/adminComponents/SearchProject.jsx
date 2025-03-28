import React from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react';

export const SearchProject = () => {
  return (
    <div className='flex gap-4 mb-4 items-center'>
        <div className='relative'>
            <input
             type="text"
             placeholder='Search Project...'
             className='p-2 pl-10 border rounded w-64'
            />
            <MagnifyingGlass size={18} className="absolute left-3 top-2.5 text-gray-500" />
        </div>
    </div>
  )
}
