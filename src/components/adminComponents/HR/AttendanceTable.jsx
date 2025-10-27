import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { ImportAttendanceModal } from "../ImportAttendanceModal";
import PaginationComponent from "../Pagination";

// Icons (you can use react-icons or similar)
const SearchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ExportIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ImportIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
    />
  </svg>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    "On Time": {
      color: "bg-green-100 text-green-800 border-green-200",
      dot: "bg-green-500",
    },
    Late: {
      color: "bg-red-100 text-red-800 border-red-200",
      dot: "bg-red-500",
    },
    Absent: {
      color: "bg-red-100 text-red-800 border-red-200",
      dot: "bg-red-500",
    },
    "Leave Request": {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      dot: "bg-blue-500",
    },
    "Early Departure": {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
  };

  const config = statusConfig[status] || statusConfig["On Time"];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></span>
      {status}
    </span>
  );
};

// Mock data - remove this and use only API data
const mockAttendanceRecords = [
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
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // Store all records from API
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Fetch all attendance data on component mount
  useEffect(() => {
    const fetchUserAttendance = async () => {
      setIsLoading(true);
      setSearchError("");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/employeeAttendance`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        if (data && Array.isArray(data)) {
          const formatted = data.map((record) => ({
            id: record.employee_id || record.id || "N/A",
            name: record.full_name || record.name || "Unknown",
            clockIn: record.check_in
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
            timeCount:
              record.hours_worked !== null && record.hours_worked !== undefined
                ? record.hours_worked
                : "-",
            status: record.attendance_status || record.status || "Unknown",
            date:
              record.date ||
              new Date(record.check_in).toISOString().split("T")[0] ||
              "Unknown",
          }));

          setAllRecords(formatted);
          setFilteredRecords(formatted); // Show all records initially
        } else {
          console.log("No data received or invalid format");
          setSearchError("No attendance data available");
          // Fallback to mock data for demonstration
          setAllRecords(mockAttendanceRecords);
          setFilteredRecords(mockAttendanceRecords);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setSearchError("Failed to load attendance data");
        // Fallback to mock data
        setAllRecords(mockAttendanceRecords);
        setFilteredRecords(mockAttendanceRecords);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAttendance();
  }, []);

  const handleSearch = async () => {
    setSearchError("");
    setCurrentPage(1);

    if (!selectedDate) {
      // If no date selected, show all records
      setFilteredRecords(allRecords);
      return;
    }

    setIsLoading(true);

    try {
      console.log("Searching for date:", selectedDate);

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/getPresentEmployees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search results:", data);

      if (data && Array.isArray(data)) {
        if (data.length === 0) {
          setSearchError(`No attendance records found for ${selectedDate}`);
          setFilteredRecords([]);
        } else {
          const formatted = data.map((record) => ({
            id: record.employee_id || record.id || "N/A",
            name: record.full_name || record.name || "Unknown",
            clockIn: record.check_in
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
            timeCount:
              record.hours_worked !== null && record.hours_worked !== undefined
                ? record.hours_worked
                : "-",
            status: record.attendance_status || record.status || "Unknown",
            date: selectedDate,
          }));

          setFilteredRecords(formatted);
        }
      } else {
        setSearchError("Invalid response format from server");
        // Fallback: filter existing records by date
        const filtered = allRecords.filter(
          (record) => record.date === selectedDate
        );
        setFilteredRecords(filtered);
        if (filtered.length === 0) {
          setSearchError(`No records found for ${selectedDate}`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to search attendance records");

      // Fallback: filter existing records by date
      const filtered = allRecords.filter(
        (record) => record.date === selectedDate
      );
      setFilteredRecords(filtered);
      if (filtered.length === 0) {
        setSearchError(`No records found for ${selectedDate}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSelectedDate("");
    setFilteredRecords(allRecords);
    setCurrentPage(1);
    setSearchError("");
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(selectedDate))
    : "All Dates";

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attendance Management
          </h1>
          <p className="text-gray-600">
            Track and manage employee attendance records
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Date Picker & Search */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon />
                </div>
                <input
                  type="date"
                  className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onKeyPress={handleKeyPress}
                  value={selectedDate}
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-[#4c735c] text-white px-6 py-3 rounded-xl hover:bg-[#5A8366] transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <SearchIcon />
                  {isLoading ? "Searching..." : "Search"}
                </button>

                {(selectedDate || searchError) && (
                  <button
                    className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    onClick={handleClearSearch}
                    disabled={isLoading}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{searchError}</p>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {formattedDate}
              </h2>
              <p className="text-gray-600 mt-1">
                Showing {currentRecords.length} of {filteredRecords.length}{" "}
                records
                {selectedDate && ` for selected date`}
              </p>
            </div>
            {totalPages > 1 && filteredRecords.length > 0 && (
              <div className="mt-4 sm:mt-0">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#4c735c] to-[#5A8366] hover:from-[#4c735c] hover:to-[#5A8366]">
                    <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Employee
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider hidden md:table-cell">
                      Clock In
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider hidden md:table-cell">
                      Clock Out
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">
                      Duration
                    </TableHead>
                    <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record, index) => (
                      <TableRow
                        key={`${record.id}-${index}-${record.date}`}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <TableCell className="p-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {record.name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              ID: {record.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center hidden md:table-cell">
                          <div className="font-medium text-gray-900">
                            {record.clockIn}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center hidden md:table-cell">
                          <div className="font-medium text-gray-900">
                            {record.clockOut}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center hidden lg:table-cell">
                          <div className="font-mono text-gray-700">
                            {record.timeCount}
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <div className="flex justify-center">
                            <StatusBadge status={record.status} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="p-8 text-center">
                        <div className="text-gray-500 text-lg">
                          No attendance records found
                        </div>
                        <p className="text-gray-400 mt-2">
                          {selectedDate
                            ? `No records found for ${selectedDate}. Try a different date.`
                            : "No attendance data available."}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Bottom Pagination */}
        {filteredRecords.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}

        {/* Import Modal */}
        {isImportOpen && (
          <ImportAttendanceModal onClose={() => setIsImportOpen(false)} />
        )}
      </div>
    </div>
  );
};
