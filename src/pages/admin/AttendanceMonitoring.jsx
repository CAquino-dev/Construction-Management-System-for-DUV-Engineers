import React, { useState, useEffect } from 'react';

export const Attendance = () => {
  const [status, setStatus] = useState("Absent");
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [timer, setTimer] = useState(0);  // In seconds
  const [intervalId, setIntervalId] = useState(null); // For clearing interval
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const employeeId = localStorage.getItem('userId');
  const hasCheckedIn = !!checkInTime;
  const hasCheckedOut = !!checkOutTime;

  useEffect(() => {
    // Update the time every second
    const clockInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(clockInterval);
      clearInterval(intervalId);
    };
  }, [intervalId]);

  const handleCheckIn = async () => {
    const response = await fetch('${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/checkIn', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const currentTime = new Date().toLocaleTimeString();
  
    // Reset previous session
    setCheckOutTime(null);
    setTimer(0);
  
    setCheckInTime(currentTime);
    setStatus('Present');
    startTimer();
  };
  

  const handleCheckOut = async () => {
    const response = await fetch('${import.meta.env.VITE_REACT_APP_API_URL}/api/employees/checkOut', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const currentTime = new Date().toLocaleTimeString();
    setCheckOutTime(currentTime);
    setStatus('Present');
    stopTimer();
  };

  const startTimer = () => {
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
      weekday: 'short',     // Mon, Tue, etc.
      year: 'numeric',
      month: 'short',       // Jan, Feb, etc.
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className='container mx-auto py-6 mt-10'>
      <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center'>
        <h2 className='text-2xl font-bold mb-4'>Attendance</h2>
        <p className="text-xl text-gray-800 mb-2">
          📅 {formatDateTime(currentDateTime)}
        </p>
        <p className='text-gray-600'>
          Status: <span className={status === 'Present' ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>{status}</span>
        </p>
        <p className='text-gray-600'>
          Check-in Time:{" "}
          <span className={checkInTime ? 'text-green-600 font-semibold' : 'text-gray-400'}>
            {checkInTime || "---"}
          </span>
        </p>
        <p className='text-gray-600'>
          Check-out Time:{" "}
          <span className={checkOutTime ? 'text-red-600 font-semibold' : 'text-gray-400'}>
            {checkOutTime || "---"}
          </span>
        </p>
        <p className='text-gray-600'>
          Timer: <span className='text-black font-semibold'>{formatTime(timer)}</span>
        </p>
        <div className='flex space-x-4 mt-4'>
          <button
            onClick={handleCheckIn}
            disabled={hasCheckedIn && !hasCheckedOut}
            className={`${
              hasCheckedIn && !hasCheckedOut
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold py-2 px-4 rounded`}
          >
            Check In
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!hasCheckedIn || hasCheckedOut}
            className={`${
              !hasCheckedIn || hasCheckedOut
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