import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Attendance = () => {
  const [status, setStatus] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [timer, setTimer] = useState(0);  // In seconds
  const [intervalId, setIntervalId] = useState(null); // For clearing interval
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const employeeId = localStorage.getItem('userId');

  // Fetch attendance status on load
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/attendanceStatus/${employeeId}`
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
              setStatus('Late');
            } else {
              setStatus('Present');
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
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
          setStatus('Absent');
        }
      }
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(intervalId);
    };
  }, [checkedIn, checkInTime, intervalId]);

  const handleCheckIn = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/checkIn`,
      {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
        headers: { 'Content-Type': 'application/json' },
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
      setStatus('Late');
    } else {
      setStatus('Present');
    }

    startTimer();
  };

  const handleCheckOut = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/checkOut`,
      {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();
    const currentTime = new Date().toLocaleTimeString();

    setCheckOutTime(currentTime);
    setCheckedOut(true);
    setCheckedIn(false);

    // ✅ Keep status as Present or Late, not Absent
    if (status !== 'Late') {
      setStatus('Present');
    }

    stopTimer();
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
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className='container mx-auto'>
      <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center'>
        <h2 className='text-2xl font-bold mb-4'>Attendance</h2>
        <p className="text-xl text-gray-800 mb-2">
          📅 {formatDateTime(currentDateTime)}
        </p>
        <p className='text-gray-600'>
          Status:{" "}
          <span
            className={
              status === 'Present'
                ? 'text-green-500 font-semibold'
                : status === 'Absent'
                ? 'text-red-500 font-semibold'
                : status === 'Late'
                ? 'text-yellow-500 font-semibold'
                : 'text-gray-400'
            }
          >
            {status || "Waiting..."}
          </span>
        </p>
        <p className='text-gray-600'>
          Check-in Time:{" "}
          <span
            className={checkInTime ? 'text-green-600 font-semibold' : 'text-gray-400'}
          >
            {checkInTime || "---"}
          </span>
        </p>
        <p className='text-gray-600'>
          Check-out Time:{" "}
          <span
            className={checkOutTime ? 'text-red-600 font-semibold' : 'text-gray-400'}
          >
            {checkOutTime || "---"}
          </span>
        </p>
        <p className='text-gray-600'>
          Timer: <span className='text-black font-semibold'>{formatTime(timer)}</span>
        </p>
        <div className='flex space-x-4 mt-4'>
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || checkedOut}
            className={`${
              checkedIn || checkedOut
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold py-2 px-4 rounded`}
          >
            Check In
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!checkedIn || checkedOut}
            className={`${
              !checkedIn || checkedOut
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            } text-white font-semibold py-2 px-4 rounded`}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
};
