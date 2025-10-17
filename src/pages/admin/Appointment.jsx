import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc"); // Default sort: newest first
  const [statusFilter, setStatusFilter] = useState("all"); // Default: show all

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_APPOINTMENTS_PER_DAY = 1;

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/getAppointments`
      );
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Apply sorting and filtering whenever appointments, sortBy, or statusFilter change
  useEffect(() => {
    let result = [...appointments];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((appt) => appt.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.preferred_date) - new Date(b.preferred_date);
        case "date-desc":
          return new Date(b.preferred_date) - new Date(a.preferred_date);
        case "name-asc":
          return a.client_name.localeCompare(b.client_name);
        case "name-desc":
          return b.client_name.localeCompare(a.client_name);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredAppointments(result);
  }, [appointments, sortBy, statusFilter]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/booked`
        );
        if (!response.ok) throw new Error("Failed to fetch booked dates.");
        const data = await response.json();

        const fullyBookedDates = data
          .filter((d) => Number(d.count) >= MAX_APPOINTMENTS_PER_DAY)
          .map((d) => new Date(d.preferred_date));

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
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      await fetchAppointments();
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChange = (e) => {
    setNewAppointment((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedDateStr = preferredDate?.toISOString().split("T")[0];

    if (
      !newAppointment.clientName.trim() ||
      !newAppointment.clientEmail.trim() ||
      !selectedDateStr ||
      !newAppointment.preferredTime ||
      !newAppointment.purpose
    ) {
      setSubmitStatus({
        success: false,
        message: "Please fill all required fields.",
      });
      toast.error("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      ...newAppointment,
      preferredDate: selectedDateStr,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/adminAppointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        }
      );
      if (!res.ok) throw new Error("Failed to add appointment");

      setShowModal(false);
      setSubmitStatus({
        success: true,
        message: "Appointment submitted successfully!",
      });
      toast.success("Appointment added successfully!");
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
      toast.error("Failed to add appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date as 'Mon, July 30. 2025'
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    let formatted = date.toLocaleDateString("en-US", options);
    formatted = formatted.replace(/, ([0-9]{1,2}),/, " $1.");
    formatted = formatted.replace(/,/, ",");
    return formatted;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const dayClassName = (date) => {
    const isBooked = bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === date.toDateString()
    );
    return isBooked ? "bg-red-100 text-red-500 line-through" : "";
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSortBy("date-desc");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📅</span>
                Manage Appointments
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage all appointment requests
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 sm:mt-0 bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>+</span>
              <span>Add Appointment</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.length}
            </div>
            <div className="text-sm text-gray-600">Total Appointments</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === "Pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "Confirmed").length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
        </div>

        {/* Main Appointments Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📋</span>
              Appointments List
              <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {filteredAppointments.length} of {appointments.length}
              </span>
            </h2>

            {/* Sort/Filter Controls */}
            <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {statusFilter !== "all" && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-800 font-medium">
                Error loading appointments
              </p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {appointments.length === 0
                  ? "No Appointments"
                  : "No Matching Appointments"}
              </h3>
              <p className="text-gray-600 mb-4">
                {appointments.length === 0
                  ? "No appointments have been scheduled yet."
                  : "No appointments match your current filters."}
              </p>
              {appointments.length === 0 ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Add First Appointment
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Appointments List */}
          {!loading && !error && filteredAppointments.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col">
                    {/* Header Row - Name, Email, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {appt.client_name}
                          </h3>
                          <div
                            className={`mt-1 sm:mt-0 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              appt.status
                            )} whitespace-nowrap`}
                          >
                            {appt.status}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm truncate mt-1">
                          {appt.client_email}
                        </p>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-700 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">📅</span>
                        <span className="flex-1">
                          {formatDisplayDate(appt.preferred_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">🕐</span>
                        <span>{appt.preferred_time}</span>
                      </div>
                      {appt.client_phone && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">📞</span>
                          <span className="flex-1">{appt.client_phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                        <span className="text-gray-400">🎯</span>
                        <span className="flex-1 truncate" title={appt.purpose}>
                          {appt.purpose}
                        </span>
                      </div>
                    </div>

                    {/* Notes and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {appt.notes && (
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {appt.notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 justify-end">
                        {appt.status === "Pending" && (
                          <>
                            <button
                              disabled={updatingId === appt.id}
                              onClick={() => updateStatus(appt.id, "Confirmed")}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 min-w-20 justify-center"
                            >
                              {updatingId === appt.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <span>✓</span>
                                  <span>Approve</span>
                                </>
                              )}
                            </button>
                            <button
                              disabled={updatingId === appt.id}
                              onClick={() => updateStatus(appt.id, "Cancelled")}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 min-w-20 justify-center"
                            >
                              {updatingId === appt.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <span>✕</span>
                                  <span>Reject</span>
                                </>
                              )}
                            </button>
                          </>
                        )}

                        {appt.status !== "Pending" && (
                          <button
                            disabled
                            className="px-3 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed min-w-20"
                            title={`Appointment already ${appt.status.toLowerCase()}`}
                          >
                            {appt.status}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/70 bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">➕</span>
                  Add New Appointment
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAdminSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    placeholder="Enter full name"
                    value={newAppointment.clientName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    placeholder="Enter email address"
                    value={newAppointment.clientEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  placeholder="Enter phone number"
                  value={newAppointment.clientPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={preferredDate}
                    onChange={(date) => setPreferredDate(date)}
                    minDate={new Date()}
                    excludeDates={bookedDates}
                    placeholderText="Select date"
                    dayClassName={dayClassName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                    calendarClassName="rounded-xl shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={newAppointment.preferredTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  placeholder="Enter appointment purpose"
                  value={newAppointment.purpose}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="Enter any additional notes"
                  value={newAppointment.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#4c735c] hover:bg-[#3a5a4a] text-white py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding Appointment...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Add Appointment</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors"
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
