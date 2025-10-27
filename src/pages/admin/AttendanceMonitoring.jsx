import React, { useState, useEffect } from "react";
import axios from "axios";

export const Attendance = () => {
  const [status, setStatus] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [timer, setTimer] = useState(0); // In seconds
  const [intervalId, setIntervalId] = useState(null); // For clearing interval
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [loading, setLoading] = useState(false);

  const employeeId = localStorage.getItem("userId");

  // Fetch attendance status on load
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/employees/attendanceStatus/${employeeId}`
        );

        if (res.data) {
          setCheckedIn(res.data.checkedIn);
          setCheckedOut(res.data.checkedOut);

          const ciTime = res.data.checkInTime
            ? new Date(res.data.checkInTime)
            : null;
          const coTime = res.data.checkOutTime
            ? new Date(res.data.checkOutTime)
            : null;

          setCheckInTime(ciTime ? ciTime.toLocaleTimeString() : null);
          setCheckOutTime(coTime ? coTime.toLocaleTimeString() : null);

          if (res.data.checkedIn && !res.data.checkedOut) {
            startTimer(res.data.elapsedSeconds || 0);

            // ✅ Late logic check
            const nineAM = new Date(ciTime);
            nineAM.setHours(9, 0, 0, 0);
            if (ciTime > nineAM) {
              setStatus("Late");
            } else {
              setStatus("Present");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Clock updater & absent checker
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);

      // ✅ Mark absent at the end of the day if no check-in
      if (!checkedIn && !checkInTime) {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        if (now >= endOfDay) {
          setStatus("Absent");
        }
      }
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(intervalId);
    };
  }, [checkedIn, checkInTime, intervalId]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/checkIn`,
        {
          method: "POST",
          body: JSON.stringify({ employeeId }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      const currentDate = new Date();
      const currentTime = currentDate.toLocaleTimeString();

      setCheckOutTime(null);
      setTimer(0);

      setCheckInTime(currentTime);
      setCheckedIn(true);
      setCheckedOut(false);

      // ✅ Late logic
      const nineAM = new Date();
      nineAM.setHours(9, 0, 0, 0);
      if (currentDate > nineAM) {
        setStatus("Late");
      } else {
        setStatus("Present");
      }

      startTimer();
    } catch (error) {
      console.error("Error checking in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/checkOut`,
        {
          method: "POST",
          body: JSON.stringify({ employeeId }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      const currentTime = new Date().toLocaleTimeString();

      setCheckOutTime(currentTime);
      setCheckedOut(true);
      setCheckedIn(false);

      // ✅ Keep status as Present or Late, not Absent
      if (status !== "Late") {
        setStatus("Present");
      }

      stopTimer();
    } catch (error) {
      console.error("Error checking out:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (initialTime = 0) => {
    setTimer(initialTime);
    const id = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    clearInterval(intervalId);
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (date) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Attendance
          </h1>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
              <span className="text-sm">📅</span>
              <span className="text-xs sm:text-sm font-medium">
                Current Time
              </span>
            </div>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 leading-tight">
              {formatDateTime(currentDateTime)}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                <div className="text-green-600 text-xs sm:text-sm font-medium mb-1">
                  Check-in
                </div>
                <div
                  className={`text-base sm:text-lg font-bold ${
                    checkInTime ? "text-green-700" : "text-gray-400"
                  }`}
                >
                  {checkInTime || "---"}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-200">
                <div className="text-red-600 text-xs sm:text-sm font-medium mb-1">
                  Check-out
                </div>
                <div
                  className={`text-base sm:text-lg font-bold ${
                    checkOutTime ? "text-red-700" : "text-gray-400"
                  }`}
                >
                  {checkOutTime || "---"}
                </div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 text-center mb-4">
            <div className="text-blue-600 text-xs sm:text-sm font-medium mb-2">
              Working Time
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-900 font-mono">
              {formatTime(timer)}
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-2">
              Current Status
            </div>
            <div
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full border-2 ${getStatusColor(
                status
              )}`}
            >
              <span className="text-base sm:text-lg font-semibold">
                {status || "Waiting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || checkedOut || loading}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-white transition-all duration-200 flex items-center justify-center ${
              checkedIn || checkedOut || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 active:bg-green-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
            ) : (
              <span className="text-base sm:text-lg">Time In</span>
            )}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!checkedIn || checkedOut || loading}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-white transition-all duration-200 flex items-center justify-center ${
              !checkedIn || checkedOut || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
            ) : (
              <span className="text-base sm:text-lg">Time Out</span>
            )}
          </button>
        </div>

        {/* Mobile-specific helper text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 px-4">
            Make sure you have a stable internet connection when checking in/out
          </p>
        </div>
      </div>
    </div>
  );
};
