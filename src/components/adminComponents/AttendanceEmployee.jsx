import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Sample attendance data
const attendanceRecords = [
  { title: 'Present', start: new Date(2025, 2, 20), end: new Date(2025, 2, 20), color: 'green' },
  { title: 'Absent', start: new Date(2025, 2, 21), end: new Date(2025, 2, 21), color: 'red' },
];

export const AttendanceEmployee = () => {
  return (
    <div style={{ height: '500px', padding: '20px' }}>
      <Calendar
        localizer={localizer}
        events={attendanceRecords}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
      />
    </div>
  );
};
