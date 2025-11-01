import React, { useState, useEffect } from "react";
import { WorkerQRScanner } from "../../components/adminComponents/Foreman/WorkerQRScanner";
import axios from "axios";

export const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("scan"); // "scan" or "attendance"
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const userId = localStorage.getItem("userId");

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/foreman/getAttendance/${userId}`
      );
      if (response.data.success) {
        setAttendanceData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceData();
    }
  }, [activeTab, userId]);

  const handleWorkerScanned = (workerData) => {
    // Refresh attendance data after successful scan
    fetchAttendanceData();
    // Optionally switch to attendance tab
    setActiveTab("attendance");
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate status and styling
  const getStatusInfo = (record) => {
    if (!record.time_out) {
      return {
        status: "Clocked In",
        color: "bg-green-100 text-green-800",
        dot: "bg-green-400",
      };
    }
    return {
      status: "Clocked Out",
      color: "bg-gray-100 text-gray-800",
      dot: "bg-gray-400",
    };
  };

  // Get photo URL
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${import.meta.env.VITE_REACT_APP_API_URL}${photoPath}`;
  };

  // Group attendance by date - FIXED VERSION
  const groupedByDate = attendanceData.reduce((groups, record) => {
    if (!record.time_in) return groups; // Skip if no time_in
    
    const date = record.time_in.split("T")[0];
    if (!date) return groups; // Skip if date extraction fails
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

  // Get unique dates for filtering
  const uniqueDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Filter data by selected date
  const filteredData = selectedDate
    ? groupedByDate[selectedDate] || []
    : attendanceData;

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4c735c] to-[#3b5d49] p-4 sm:p-6 md:p-8 text-white">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  Worker Attendance
                </h1>
                <p className="text-green-100 mt-1 sm:mt-2 text-xs sm:text-sm">
                  Track and manage worker attendance
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 self-start">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">
                  {attendanceData.filter((item) => !item.time_out).length}{" "}
                  Clocked In
                </span>
              </div>
            </div>
          </div>

          {/* Tabs - Mobile optimized */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex flex-col sm:flex-row">
              <button
                onClick={() => setActiveTab("scan")}
                className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-200 ${
                  activeTab === "scan"
                    ? "border-b-2 sm:border-b-0 sm:border-l-2 border-[#4c735c] text-[#4c735c] bg-green-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-[#4c735c] rounded-lg">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">
                      Scan QR
                    </div>
                    <div className="text-xs opacity-75 hidden xs:block">
                      Record attendance
                    </div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-200 ${
                  activeTab === "attendance"
                    ? "border-b-2 sm:border-b-0 sm:border-l-2 border-[#4c735c] text-[#4c735c] bg-green-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-[#4c735c] rounded-lg">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">
                      View Records
                    </div>
                    <div className="text-xs opacity-75 hidden xs:block">
                      Check history
                    </div>
                  </div>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {activeTab === "scan" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                    Scan Worker QR Code
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Position QR code within scanner to record attendance
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-dashed border-gray-300">
                  <WorkerQRScanner onScan={handleWorkerScanned} />
                </div>

                {/* Quick Stats - Stack on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Total Records
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {attendanceData.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Currently In
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {
                            attendanceData.filter((item) => !item.time_out)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-gray-100 rounded-lg">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Currently Out
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {
                            attendanceData.filter((item) => item.time_out)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                      Attendance Records
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      View worker attendance history
                    </p>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                    {uniqueDates.length > 0 && (
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                      >
                        <option value="">All Dates</option>
                        {uniqueDates.map((date) => (
                          <option key={date} value={date}>
                            {formatDate(date)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#4c735c]"></div>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-8 sm:py-16 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300">
                    <svg
                      className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No attendance records
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                      {selectedDate
                        ? `No records for selected date`
                        : "Scan QR codes to record attendance"}
                    </p>
                    <button
                      onClick={() => setActiveTab("scan")}
                      className="px-4 py-2 text-sm bg-[#4c735c] text-white rounded-lg hover:bg-[#3b5d49] transition-colors duration-200"
                    >
                      Start Scanning
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Worker
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Team & Task
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time In
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time Out
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hours
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredData.map((record, index) => {
                            const statusInfo = getStatusInfo(record);
                            const photoUrl = getPhotoUrl(record.photo);

                            return (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                      {photoUrl ? (
                                        <img
                                          src={photoUrl}
                                          alt={record.worker_name}
                                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-300"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                              "flex";
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border border-gray-300 ${
                                          photoUrl ? "hidden" : "flex"
                                        } bg-gradient-to-br from-[#4c735c] to-[#3b5d49]`}
                                      >
                                        <span className="text-white font-medium text-xs">
                                          {record.worker_name
                                            ? record.worker_name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                            : "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-2 sm:ml-3">
                                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                        {record.worker_name}
                                      </div>
                                      <div className="text-xs text-gray-500 line-clamp-1">
                                        {record.skill_type}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="text-sm text-gray-900">
                                    <div className="font-medium line-clamp-1">
                                      {record.team_name}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                                      {record.task_title || "No task assigned"}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                  <div className="font-medium">
                                    {formatTime(record.time_in)}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {formatDate(record.time_in)}
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {record.time_out ? (
                                    <>
                                      <div className="font-medium">
                                        {formatTime(record.time_out)}
                                      </div>
                                      <div className="text-gray-500 text-xs">
                                        {formatDate(record.time_out)}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {record.hours_worked ? (
                                    <span className="font-mono font-medium">
                                      {parseFloat(record.hours_worked).toFixed(
                                        2
                                      )}
                                      h
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full mr-1 ${statusInfo.dot}`}
                                    ></span>
                                    {statusInfo.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};