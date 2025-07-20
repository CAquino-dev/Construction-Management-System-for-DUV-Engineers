import React from 'react'
import { useEffect, useState } from "react";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch appointments from backend (adjust endpoint)
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/getAppointments`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Update appointment status
  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      await fetchAppointments(); // Refresh list
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    // Split date and time
    const [year, month, day] = dateStr.split('-');
    let [hour, minute] = timeStr.split(':');
    let hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12;
    if (hourNum === 0) hourNum = 12;
    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[parseInt(month, 10) - 1];
    return `${monthName} ${parseInt(day, 10)}, ${year}, ${hourNum}:${minute} ${ampm}`;
  };

  return (
<div className="h-screen bg-gray-100 mt-4 sm:mt-0">
  <div className='bg-white max-w-4xl mx-auto rounded shadow p-4 h-full max-h-[80%] sm:max-h-[90%]'>
    <h1 className="text-3xl font-bold mb-6 text-center">Manage Appointments</h1>

      {loading && <p className="text-center">Loading appointments...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-center text-gray-600">No appointments found.</p>
      )}

      <div className="h-full max-h-[80%] sm:max-h-[90%] overflow-y-auto mx-auto space-y-4">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-gray-50 rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="mb-3 sm:mb-0">
              <p>
                <span className="font-semibold">{appt.client_name}</span> - <span className='text-gray-600'>{appt.client_email}</span>
              </p>
              <p>
                Date: {formatDateTime(appt.preferred_date, appt.preferred_time)}
              </p>
              <p>Status:{" "}
                <span
                  className={
                    appt.status === "Confirmed"
                      ? "text-green-600 font-semibold"
                      : appt.status === "Cancelled"
                      ? "text-red-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                  }
                >
                  {appt.status}
                </span>
              </p>
            </div>

            {appt.status === "Pending" && (
              <div className="flex space-x-2">
                <button
                  disabled={updatingId === appt.id}
                  onClick={() => updateStatus(appt.id, "Confirmed")}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {updatingId === appt.id ? "Processing..." : "Approve"}
                </button>
                <button
                  disabled={updatingId === appt.id}
                  onClick={() => updateStatus(appt.id, "Cancelled")}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {updatingId === appt.id ? "Processing..." : "Reject"}
                </button>
              </div>
            )}

            {appt.status !== "Pending" && (
              <div>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                  title={`Appointment already ${appt.status.toLowerCase()}`}
                >
                  {appt.status}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
  </div>
</div>
  )
}

export default Appointment
