import React from 'react';

export const EmployeesBoxHorizontal = ({ employees = [] }) => {
    
  return (
    <div className='overflow-x-auto whitespace-nowrap p-4 flex gap-4'>
      {employees.map((employee) => (
        <div key={employee.id} className='min-w-[200px] p-4 bg-gray-200 rounded-lg shadow-md text-center'>
          <h3 className='font-semibold'>{employee.full_name}</h3>
          <p className='text-sm text-gray-600'>{employee.department_name}</p>
        </div>
      ))}
    </div>
  );
};
