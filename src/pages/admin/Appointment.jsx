import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    preferredTime: "",
    purpose: "",
    notes: "",
  });
  const [preferredDate, setPreferredDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(null);

  const MAX_APPOINTMENTS_PER_DAY = 1;

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

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/booked`);
        if (!response.ok) throw new Error("Failed to fetch booked dates.");
        const data = await response.json();

        const fullyBookedDates = data
          .filter(d => Number(d.count) >= MAX_APPOINTMENTS_PER_DAY)
          .map(d => new Date(d.preferred_date));

        setBookedDates(fullyBookedDates);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchBookedDates();
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

  const handleChange = (e) => {
    setNewAppointment(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    const selectedDateStr = preferredDate?.toISOString().split("T")[0];

    if (
      !newAppointment.clientName.trim() ||
      !newAppointment.clientEmail.trim() ||
      !selectedDateStr ||
      !newAppointment.preferredTime ||
      !newAppointment.purpose
    ) {
      setSubmitStatus({ success: false, message: "Please fill all required fields." });
      return;
    }

    const submissionData = {
      ...newAppointment,
      preferredDate: selectedDateStr,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/adminAppointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      if (!res.ok) throw new Error("Failed to add appointment");

      setShowModal(false);
      setSubmitStatus({ success: true, message: "Appointment submitted successfully!" });
      setNewAppointment({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        preferredTime: "",
        purpose: "",
        notes: "",
      });
      setPreferredDate(null);
      await fetchAppointments();
    } catch (err) {
      setSubmitStatus({ success: false, message: err.message });
    }
  };

  // Helper to format date as 'Mon, July 30. 2025'
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { weekday: "short", month: "long", day: "numeric", year: "numeric" };
    let formatted = date.toLocaleDateString("en-US", options);
    formatted = formatted.replace(/, ([0-9]{1,2}),/, ' $1.');
    formatted = formatted.replace(/,/, ',');
    return formatted;
  };

  return (
    <div className=" bg-gray-100 p-6 h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow h-9/10 px-4 py-6"> 
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Appointments</h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#4c735c] text-white rounded cursor-pointer"
          >
            + Add Appointment
          </button>
        </div>

        {loading && <p className="text-center">Loading appointments...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && appointments.length === 0 && (
          <p className="text-center text-gray-600">No appointments found.</p>
        )}

        <div className="max-w-4xl mx-auto space-y-4 overflow-y-auto h-8/10 border-1">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-gray-100 shadow rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="mb-3 sm:mb-0">
                <p>
                  <strong>{appt.client_name}</strong>  <span className="text-gray-600">{appt.client_email}</span>
                </p>
                <p>
                  Date: {formatDisplayDate(appt.preferred_date)} @ {appt.preferred_time}
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
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                  >
                    {updatingId === appt.id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    disabled={updatingId === appt.id}
                    onClick={() => updateStatus(appt.id, "Cancelled")}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800/20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Appointment</h2>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <input
                type="text"
                name="clientName"
                placeholder="Full Name"
                value={newAppointment.clientName}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                name="clientEmail"
                placeholder="Email"
                value={newAppointment.clientEmail}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="clientPhone"
                placeholder="Phone"
                value={newAppointment.clientPhone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <DatePicker
                selected={preferredDate}
                onChange={(date) => setPreferredDate(date)}
                minDate={new Date()}
                excludeDates={bookedDates}
                placeholderText="Select a date"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="time"
                name="preferredTime"
                value={newAppointment.preferredTime}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="purpose"
                placeholder="Purpose"
                value={newAppointment.purpose}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={newAppointment.notes}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />

              {submitStatus && (
                <p
                  className={`text-center font-medium ${
                    submitStatus.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {submitStatus.message}
                </p>
              )}

              <div className="flex justify-between">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
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