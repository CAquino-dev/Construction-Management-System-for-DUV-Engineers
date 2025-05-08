import React, { useState, useEffect } from 'react';

export const Attendance = () => {
  const [status, setStatus] = useState("Absent");
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [timer, setTimer] = useState(0);  // In seconds
  const [intervalId, setIntervalId] = useState(null); // To store the interval ID for clearing later

  useEffect(() => {
    // Cleanup the interval when component unmounts or check-out happens
    return () => clearInterval(intervalId);
  }, [intervalId]);

  // Handle Check-in Button
  const handleCheckIn = () => {
    const currentTime = new Date().toLocaleTimeString();  // Capture check-in time
    setCheckInTime(currentTime);
    setStatus('Present');
    startTimer();  // Start the timer when check-in happens
  };

  // Handle Check-out Button
  const handleCheckOut = () => {
    const currentTime = new Date().toLocaleTimeString();  // Capture check-out time
    setCheckOutTime(currentTime);
    setStatus('Absent');
    stopTimer();  // Stop the timer when check-out happens
  };

  // Start the timer when the employee checks in
  const startTimer = () => {
    const id = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
    }, 1000);
    setIntervalId(id);  // Save the interval ID
  };

  // Stop the timer when the employee checks out
  const stopTimer = () => {
    clearInterval(intervalId);  // Stop the timer when checking out
  };

  // Format the timer as HH:MM:SS
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className='mt-10'>
      <h2>Attendance</h2>
      <p>Status: {status}</p>
      <p>Check-in Time: {checkInTime}</p>
      <p>Check-out Time: {checkOutTime}</p>
      <p>Timer: {formatTime(timer)}</p>
      <button onClick={handleCheckIn}>Check In</button>
      <button onClick={handleCheckOut}>Check Out</button>
    </div>
  );
};
