import React from "react";
import { AttendanceTable } from "../../components/adminComponents/HR/AttendanceTable";

export const EmployeeAttendance = () => {
  return (
    <div className="p-4 w-full bg-white shadow-md rounded-lg mt-15">
      <h2 className="text-lg font-bold mb-4">Employee Attendance</h2>
      
      {/* Attendance Table Component */}
      <AttendanceTable />
    </div>
  );
};
