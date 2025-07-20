import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import DatePicker from 'react-datepicker';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import Calendar styles
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

const localizer = momentLocalizer(moment);

const EmployeeModal = ({ selectedUser, closeModal }) => {
  const [activeTab, setActiveTab] = useState('Information'); // State for active tab
  const [fromDate, setFromDate] = useState(new Date()); // Selected "From" date
  const [toDate, setToDate] = useState(new Date()); // Selected "To" date

  if (!selectedUser) return null;

  // Example attendance events
  const events = [
    {
      id: 1,
      title: 'Present',
      start: new Date(2023, 0, 15, 9, 0), // Jan 15, 2023
      end: new Date(2023, 0, 15, 17, 0),
    },
    {
      id: 2,
      title: 'Absent',
      start: new Date(2023, 0, 16, 9, 0), // Jan 16, 2023
      end: new Date(2023, 0, 16, 17, 0),
    },
    {
      id: 3,
      title: 'Present',
      start: new Date(2023, 0, 17, 9, 0), // Jan 17, 2023
      end: new Date(2023, 0, 17, 17, 0),
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-150">
      <div className="bg-gray-200 flex rounded-lg shadow-lg w-[60rem] h-[40rem] animate-fadeIn">
        {/* Sidebar */}
        <div className="bg-[#3b5d47] p-6 flex flex-col items-center w-1/3">
          {/* Profile Picture */}
          <div className="w-28 h-28 bg-black rounded-full"></div> {/* Placeholder for profile picture */}
          <h3 className="mt-4 text-white text-lg font-bold">{selectedUser.fullname || "Employee Name"}</h3>
          <p className="text-white text-sm">{selectedUser.department_name || "Department"}</p>

          {/* Sidebar Buttons */}
          <button
            onClick={() => setActiveTab('Information')}
            className={`mt-6 w-full py-2 rounded cursor-pointer ${
              activeTab === 'Information' ? 'bg-[#8bab9b] text-white' : 'bg-[#D5E3D8]'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('Attendance')}
            className={`mt-2 w-full py-2 rounded cursor-pointer ${
              activeTab === 'Attendance' ? 'text-white bg-[#8bab9b]' : 'bg-[#D5E3D8]'
            }`}
          >
            Attendance
          </button>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
            <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
              <X size={24} />
            </button>
          </div>

         {/* Content based on the active tab */}
         {activeTab === 'Information' && (
            <div className="mt-6 max-h-[500px] overflow-y-auto text-gray-800 space-y-6">
              {/* Personal Details */}
              <div className="space-y-2 border-b pb-4">
                <p className="text-lg font-semibold">Personal Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Name:</strong> {selectedUser.fullname || "Employee Name"}</p>
                  <p><strong>Age:</strong> {selectedUser.age || "--"}</p>
                  <p><strong>Gender:</strong> {selectedUser.gender || "Gender"}</p>
                  <p><strong>Birthday:</strong> {selectedUser.birthday || "MM/DD/YYYY"}</p>
                  <p><strong>Contact No:</strong> {selectedUser.contactNo || "123-456-7890"}</p>
                  <p><strong>Address:</strong> {selectedUser.address || "Employee Address"}</p>
                </div>
              </div>
              
              {/* Employment Information */}
              <div className="space-y-2 border-b pb-4">
                <p className="text-lg font-semibold">Employment Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Employee ID:</strong> {selectedUser.employeeId || "EMP-0001"}</p>
                  <p><strong>Job Title:</strong> {selectedUser.jobTitle || "Job Position"}</p>
                  <p><strong>Department:</strong> {selectedUser.department_name || "Department Name"}</p>
                  <p><strong>Date Hired:</strong> {selectedUser.dateHired || "MM/DD/YYYY"}</p>
                  <p><strong>Employment Status:</strong> {selectedUser.employmentStatus || "Full-time"}</p>
                </div>
              </div>
              
              {/* Work Schedule & Attendance */}
              <div className="space-y-2 border-b pb-4">
                <p className="text-lg font-semibold">Work Schedule & Attendance</p>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Shift Schedule:</strong> {selectedUser.shiftSchedule || "Day/Night"}</p>
                  <p><strong>Working Hours:</strong> {selectedUser.workingHours || "8 AM - 5 PM"}</p>
                </div>
              </div>
              
              {/* Emergency Contact */}
              <div className="space-y-2 border-b pb-4">
                <p className="text-lg font-semibold">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Contact Name:</strong> {selectedUser.emergencyContactName || "John Doe"}</p>
                  <p><strong>Relationship:</strong> {selectedUser.emergencyContactRelation || "Sibling"}</p>
                  <p><strong>Contact No:</strong> {selectedUser.emergencyContactNo || "987-654-3210"}</p>
                </div>
              </div>
              
              {/* System Access */}
              <div className="space-y-2 border-b pb-4">
                <p className="text-lg font-semibold">System Access</p>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Username:</strong> {selectedUser.username || "johndoe"}</p>
                  <p><strong>Role:</strong> {selectedUser.role || "Employee"}</p>
                </div>
              </div>
              
              {/* Deactivate Button */}
              <div className="mt-6 flex justify-end">
                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
                  Deactivate
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'Attendance' && (
            <div className="mt-6 text-gray-800">
              <div className='flex justify-end space-x-4 mb-4'>
                <button className='bg-[#3b5d47] cursor-pointer text-white py-2 px-4 rounded'>Add Attendance</button>
                <button className='border-1 border-[#3b5d47] cursor-pointer text-[#3b5d47] py-2 px-4 rounded'>Generate attendace</button>
              </div>
              <div className="mb-4">
                {/* Flex container for date pickers */}
                <div className="flex justify-center space-x-4">
                  <div>
                    <label htmlFor="from-date" className="block text-sm font-medium text-gray-700">From</label>
                    <DatePicker
                      id="from-date"
                      selected={fromDate}
                      onChange={(date) => setFromDate(date)}
                      className="px-4 py-2 border rounded-md"
                      dateFormat="MM/dd/yyyy"
                      popperClassName="datepicker-popper"
                    />
                  </div>
                  <div>
                    <label htmlFor="to-date" className="block text-sm font-medium text-gray-700">To</label>
                    <DatePicker
                      id="to-date"
                      selected={toDate}
                      onChange={(date) => setToDate(date)}
                      className="px-4 py-2 border rounded-md"
                      dateFormat="MM/dd/yyyy"
                      popperClassName="datepicker-popper"
                    />
                  </div>
                </div>

                {/* Month-Year Display and Navigation Arrows */}
                <div className="mt-2 flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setFromDate(moment(fromDate).subtract(1, 'month').toDate())}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md cursor-pointer"
                  >
                    ← Prev
                  </button>
                  <div className="text-lg font-semibold text-gray-700">
                    {moment(fromDate).format('MMMM YYYY')}
                  </div>
                  <button
                    onClick={() => setFromDate(moment(fromDate).add(1, 'month').toDate())}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Calendar Component */}
              <Calendar
                localizer={localizer}
                events={events}
                date={fromDate} // Adjust calendar to start from selected "From" date
                startAccessor="start"
                endAccessor="end"
                toolbar={false} // Hide default toolbar
                style={{ height: '300px' }}
                className="border-1 border-[#3b5d47] rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
