import React from 'react';
import { SearchEmployee } from './SearchEmployee';

export const EmployeesBoxHorizontal = ({ employees = [] }) => {
  return (
    <div>
      <div>
        <SearchEmployee />
      </div>
      <div className='overflow-x-auto whitespace-nowrap p-4 flex gap-4'>
        {employees.map((employee) => (
          <div
            key={employee.id}
            className='min-w-[180px] p-3 bg-gray-200 rounded-lg shadow-md flex items-center gap-3 cursor-pointer hover:bg-gray-300 active:bg-gray-400'
          >
            {/* Profile Picture */}
            <div className='rounded-full overflow-hidden flex-shrink-0' style={{ height: '48px', width: '48px' }}>
              <img
                src={employee.profile_picture || 'https://via.placeholder.com/150'}
                alt={`${employee.full_name}'s profile`}
                className='h-full w-full object-cover'
              />
            </div>

            {/* Employee Info */}
            <div className='text-left flex-1'>
              <h3 className='font-semibold'>{employee.full_name}</h3>
              <p className='text-sm text-gray-600'>{employee.department_name}</p>

              {/* Add Attendance button */}
              <button
                className='text-sm text-blue-500 underline cursor-pointer mt-1 hover:text-blue-600 active:text-blue-700'
                onClick={() => handleAddAttendance(employee.id)}
              >
                Add Attendance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};