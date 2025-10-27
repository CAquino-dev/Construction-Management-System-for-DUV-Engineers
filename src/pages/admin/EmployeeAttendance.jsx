import React from "react";
import { AttendanceTable } from "../../components/adminComponents/HR/AttendanceTable";

export const EmployeeAttendance = () => {
  return (
    <div className="p-4 w-full bg-white shadow-md rounded-lg">
      {/* Attendance Table Component */}
      <AttendanceTable />
    </div>
  );
};
