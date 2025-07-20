import React, { useEffect, useState } from "react";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    preferred_date: "",
    preferred_time: "",
    purpose: "",
    notes: "",
  });

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
      await fetchAppointments();
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

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointment),
      });
      if (!res.ok) throw new Error("Failed to add appointment");
      setShowModal(false);
      setNewAppointment({
        client_name: "",
        client_email: "",
        client_phone: "",
        preferred_date: "",
        preferred_time: "",
        purpose: "",
        notes: "",
      });
      await fetchAppointments();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Appointments</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Appointment
        </button>
      </div>

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
              <p>
                Status:{" "}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Appointment</h2>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <input
                type="text"
                name="client_name"
                placeholder="Full Name"
                value={newAppointment.client_name}
                onChange={(e) => setNewAppointment({ ...newAppointment, client_name: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                name="client_email"
                placeholder="Email"
                value={newAppointment.client_email}
                onChange={(e) => setNewAppointment({ ...newAppointment, client_email: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="client_phone"
                placeholder="Phone"
                value={newAppointment.client_phone}
                onChange={(e) => setNewAppointment({ ...newAppointment, client_phone: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="date"
                name="preferred_date"
                value={newAppointment.preferred_date}
                onChange={(e) => setNewAppointment({ ...newAppointment, preferred_date: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="time"
                name="preferred_time"
                value={newAppointment.preferred_time}
                onChange={(e) => setNewAppointment({ ...newAppointment, preferred_time: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="purpose"
                placeholder="Purpose"
                value={newAppointment.purpose}
                onChange={(e) => setNewAppointment({ ...newAppointment, purpose: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;
