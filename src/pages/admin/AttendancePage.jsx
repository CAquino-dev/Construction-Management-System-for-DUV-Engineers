import React, { useState, useEffect } from "react";
import { WorkerQRScanner } from "../../components/adminComponents/Foreman/WorkerQRScanner";
import axios from "axios";

export const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("scan"); // "scan" or "attendance"
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const userId = localStorage.getItem('userId');

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getAttendance/${userId}`
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
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate status and styling
  const getStatusInfo = (record) => {
    if (!record.time_out) {
      return { status: "Clocked In", color: "bg-green-100 text-green-800", dot: "bg-green-400" };
    }
    return { status: "Clocked Out", color: "bg-gray-100 text-gray-800", dot: "bg-gray-400" };
  };

  // Get photo URL
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${import.meta.env.VITE_REACT_APP_API_URL}${photoPath}`;
  };

  // Group attendance by date
  const groupedByDate = attendanceData.reduce((groups, record) => {
    const date = record.time_in.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

  // Get unique dates for filtering
  const uniqueDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  // Filter data by selected date
  const filteredData = selectedDate ? groupedByDate[selectedDate] || [] : attendanceData;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4c735c] to-[#3b5d49] p-8 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Worker Attendance System</h1>
                <p className="text-green-100 mt-2">Track and manage worker attendance efficiently</p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {attendanceData.filter(item => !item.time_out).length} Currently Clocked In
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("scan")}
                className={`flex-1 py-5 px-6 text-center font-medium text-sm transition-all duration-200 ${
                  activeTab === "scan"
                    ? "border-b-2 border-[#4c735c] text-[#4c735c] bg-green-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-[#4c735c] rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Scan QR Code</div>
                    <div className="text-xs opacity-75">Record attendance</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 py-5 px-6 text-center font-medium text-sm transition-all duration-200 ${
                  activeTab === "attendance"
                    ? "border-b-2 border-[#4c735c] text-[#4c735c] bg-green-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-[#4c735c] rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">View Attendance</div>
                    <div className="text-xs opacity-75">Check records</div>
                  </div>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "scan" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Scan Worker QR Code</h2>
                  <p className="text-gray-600">Position the QR code within the scanner to record attendance</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <WorkerQRScanner onScan={handleWorkerScanned} />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Records</p>
                        <p className="text-2xl font-bold text-gray-900">{attendanceData.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Currently In</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {attendanceData.filter(item => !item.time_out).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Currently Out</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {attendanceData.filter(item => item.time_out).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Attendance Records</h2>
                    <p className="text-gray-600">View and manage worker attendance history</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {uniqueDates.length > 0 && (
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                      >
                        <option value="">All Dates</option>
                        {uniqueDates.map(date => (
                          <option key={date} value={date}>
                            {formatDate(date)}
                          </option>
                        ))}
                      </select>
                    )}
                    <button className="px-4 py-2 bg-[#4c735c] text-white rounded-lg hover:bg-[#3b5d49] transition-colors duration-200 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c]"></div>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                    <p className="text-gray-500 mb-4">
                      {selectedDate ? `No records for selected date` : 'Scan worker QR codes to start recording attendance'}
                    </p>
                    <button 
                      onClick={() => setActiveTab("scan")}
                      className="px-6 py-2 bg-[#4c735c] text-white rounded-lg hover:bg-[#3b5d49] transition-colors duration-200"
                    >
                      Start Scanning
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team & Task</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredData.map((record, index) => {
                            const statusInfo = getStatusInfo(record);
                            const photoUrl = getPhotoUrl(record.photo);
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12">
                                      {photoUrl ? (
                                        <img
                                          src={photoUrl}
                                          alt={record.name}
                                          className="h-12 w-12 rounded-full object-cover border border-gray-300"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className={`h-12 w-12 rounded-full flex items-center justify-center border border-gray-300 ${
                                        photoUrl ? 'hidden' : 'flex'
                                      } bg-gradient-to-br from-[#4c735c] to-[#3b5d49]`}>
                                        <span className="text-white font-medium text-sm">
                                          {record.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">{record.name}</div>
                                      <div className="text-sm text-gray-500">{record.skill_type}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    <div className="font-medium">{record.team_name}</div>
                                    <div className="text-gray-500 text-xs mt-1">{record.task_title}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="font-medium">{formatTime(record.time_in)}</div>
                                  <div className="text-gray-500 text-xs">{formatDate(record.time_in)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.time_out ? (
                                    <>
                                      <div className="font-medium">{formatTime(record.time_out)}</div>
                                      <div className="text-gray-500 text-xs">{formatDate(record.time_out)}</div>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.hours_worked ? (
                                    <span className="font-mono font-medium">
                                      {parseFloat(record.hours_worked).toFixed(2)}h
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${statusInfo.dot}`}></span>
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