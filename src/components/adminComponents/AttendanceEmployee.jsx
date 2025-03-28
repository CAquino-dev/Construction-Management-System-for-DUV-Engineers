import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { SearchEmployee } from './SearchEmployee';

export const AttendanceEmployee = () => {
  const [month, setMonth] = useState(moment().month() + 1); // Current month (1-based index)
  const [year, setYear] = useState(moment().year()); // Current year
  const [datesOfMonth, setDatesOfMonth] = useState([]);

  // Generate dates of the selected month
  useEffect(() => {
    const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1); // Generate date array
    setDatesOfMonth(dates);
  }, [month, year]);

  // Sample attendance data
  const attendanceRecords = [
    { name: 'John Doe', attendance: { 20: 'Present', 21: 'Absent', 22: 'Halfday' } },
    { name: 'Jane Smith', attendance: { 20: 'Absent', 21: 'Present', 22: 'Halfday' } },
  ];

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      setMonth((prev) => (prev > 1 ? prev - 1 : 12));
      if (month === 1) setYear((prev) => prev - 1); // Adjust year when transitioning to December
    } else {
      setMonth((prev) => (prev < 12 ? prev + 1 : 1));
      if (month === 12) setYear((prev) => prev + 1); // Adjust year when transitioning to January
    }
  };

  const handleYearChange = (direction) => {
    if (direction === 'prev') {
      setYear((prev) => prev - 1);
    } else {
      setYear((prev) => prev + 1);
    }
  };

  return (
    <div>
      {/* Search Component */}
      <div className="mb-4">
        <SearchEmployee />
      </div>

      {/* Main Container */}
      <div className="p-6 bg-gray-200 border">
        {/* Month and Year Selector */}
        <div className="flex justify-center items-center mb-4 gap-4">
          <button
            onClick={() => handleYearChange('prev')}
            className="flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded cursor-pointer"
          >
            <ArrowLeft size={16} className="mr-2" /> Year
          </button>
          <button
            onClick={() => handleMonthChange('prev')}
            className="flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded cursor-pointer"
          >
            <ArrowLeft size={16} className="mr-2" /> Month
          </button>
          <h2 className="mx-4 text-lg font-semibold">
            {moment(`${year}-${month}`, 'YYYY-MM').format('MMMM YYYY')}
          </h2>
          <button
            onClick={() => handleMonthChange('next')}
            className="flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded cursor-pointer"
          >
            Month <ArrowRight size={16} className="ml-2" />
          </button>
          <button
            onClick={() => handleYearChange('next')}
            className="flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded cursor-pointer"
          >
            Year <ArrowRight size={16} className="ml-2" />
          </button>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full border rounded-md text-sm bg-white">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-2 text-left pl-4">Name</th>
                {datesOfMonth.map((date) => (
                  <th key={date} className="p-2 text-center">
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="p-2 text-left">{record.name}</td>
                  {datesOfMonth.map((date) => (
                    <td
                      key={date}
                      className={`p-2 ${
                        record.attendance[date] === 'Present'
                          ? 'bg-green-200'
                          : record.attendance[date] === 'Absent'
                          ? 'bg-red-200'
                          : record.attendance[date] === 'Halfday'
                          ? 'bg-yellow-200'
                          : ''
                      }`}
                    >
                      {record.attendance[date]
                        ? record.attendance[date].charAt(0) // Display the first letter of status
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center items-center gap-4 border-t pt-4">
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border"></div>
            P - Present
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 border"></div>
            A - Absent
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border"></div>
            H - Halfday
          </span>
        </div>
      </div>
    </div>
  );
};
