import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table"; // Adjust path if needed
import { ImportAttendanceModal } from "../ImportAttendanceModal";
import PaginationComponent from "../Pagination";

const attendanceRecords = [
  {
    id: "M02489",
    name: "Ajay Lumari",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    timeCount: "09:00:00",
    status: "On Time",
    date: "2025-09-03",
  },
  {
    id: "M02490",
    name: "Robert Young",
    clockIn: "09:10 AM",
    clockOut: "06:10 PM",
    timeCount: "09:00:00",
    status: "Late",
    date: "2025-09-03",
  },
  {
    id: "M02509",
    name: "Elia Romero",
    clockIn: "-",
    clockOut: "-",
    timeCount: "-",
    status: "Leave Request",
    date: "2025-09-04",
  },
];

export const AttendanceTable = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredRecords, setFilteredRecords] = useState(attendanceRecords);
  const [isImportOpen, setIsImportOpen] = useState(false); // Modal state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this

  useEffect(() => {
    const fetchUserAttendance = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/employeeAttendance`
        );
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          const formatted = data.map((record) => ({
            id: record.employee_id,
            name: record.full_name,
            clockIn:
              record.check_in !== null
                ? new Date(record.check_in).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-",
            clockOut: record.check_out
              ? new Date(record.check_out).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
            timeCount: record.hours_worked !== null ? record.hours_worked : "-",
            status: record.attendance_status,
            date: selectedDate,
          }));
          setFilteredRecords(formatted);
          setCurrentPage(1); // Reset to first page when new data loads
        } else {
          console.log(`error in fetching data`);
        }
      } catch (error) {
        console.log("error fetching users:", error);
      }
    };

    fetchUserAttendance();
  }, []);

  const handleSearch = async () => {
    if (selectedDate) {
      setFilteredRecords(
        attendanceRecords.filter((record) => record.date === selectedDate)
      );
    } else {
      setFilteredRecords(attendanceRecords);
    }
    console.log(selectedDate);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/getPresentEmployees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Transform backend data to match table format
        const formatted = data.map((record) => ({
          id: record.employee_id,
          name: record.full_name,
          clockIn: new Date(record.check_in).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          clockOut: record.check_out
            ? new Date(record.check_out).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          timeCount: record.hours_worked !== null ? record.hours_worked : "-",
          status: record.attendance_status,
          date: selectedDate,
        }));

        setFilteredRecords(formatted);
        setCurrentPage(1); // Reset to first page when searching
      } else {
        console.log(`error in fetching data`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Format date to "Monday, 10 July 2025"
  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(selectedDate))
    : "All Dates";

  return (
    <div className="p-4">
      {/* Date Picker & Search Button */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 justify-between w-full">
        {/* Date Picker & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <input
            type="date"
            className="p-2 border rounded-md w-full sm:w-auto"
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {/* Export & Import Buttons */}
        {/* <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button className="bg-[#4c735c] text-white px-6 py-2 rounded-md w-full md:w-48 lg:w-56 sm:w-auto">
              Export Attendance
            </button>
            <button
              className="border border-[#4c735c] text-[#4c735c] px-6 py-2 rounded-md w-full md:w-48 lg:w-56 sm:w-auto"
              onClick={() => setIsImportOpen(true)}
            >
              Import Attendance
            </button>
          </div> */}
      </div>

      {/* Display Selected Date in Readable Format */}
      <div>
        <p className="font-semibold text-xl text-gray-600 border-b border-t py-5 mb-2">
          {formattedDate}
        </p>
      </div>

      {/* Attendance Table - Responsive */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] hover:bg-[#4c735c] text-white">
              <TableHead className="p-2 text-left text-white">
                Employee ID
              </TableHead>
              <TableHead className="p-2 text-left text-white">
                Full Name
              </TableHead>
              <TableHead className="p-2 text-center text-white hidden sm:table-cell">
                Clock In
              </TableHead>
              <TableHead className="p-2 text-center text-white hidden sm:table-cell">
                Clock Out
              </TableHead>
              <TableHead className="p-2 text-center text-white hidden sm:table-cell">
                Time Count
              </TableHead>
              <TableHead className="p-2 text-center text-white">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record, index) => (
              <TableRow
                key={`${record.id}-${index}`}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <TableCell className="p-2">{record.id}</TableCell>
                <TableCell className="p-2">{record.name}</TableCell>
                <TableCell className="p-2 text-center hidden sm:table-cell">
                  {record.clockIn}
                </TableCell>
                <TableCell className="p-2 text-center hidden sm:table-cell">
                  {record.clockOut}
                </TableCell>
                <TableCell className="p-2 text-center hidden sm:table-cell">
                  {record.timeCount}
                </TableCell>
                <TableCell
                  className={`p-2 text-center font-semibold ${
                    record.status === "Late" || record.status === "Absent"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {record.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      {filteredRecords.length > 0 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <ImportAttendanceModal onClose={() => setIsImportOpen(false)} />
      )}
    </div>
  );
};
