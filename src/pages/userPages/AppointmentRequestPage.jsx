import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const AppointmentRequestPage = () => {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/booked`);
        if (!response.ok) throw new Error("Failed to fetch booked dates.");
        const data = await response.json();

        const fullyBookedDates = data
          .filter(d => Number(d.count) >= MAX_APPOINTMENTS_PER_DAY)
          .map(d => new Date(d.preferred_date)); // Convert to Date objects

        setBookedDates(fullyBookedDates);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchBookedDates();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDateStr = preferredDate?.toISOString().split("T")[0];

    if (
      !formData.clientName.trim() ||
      !formData.clientEmail.trim() ||
      !selectedDateStr ||
      !formData.preferredTime ||
      !formData.purpose
    ) {
      setSubmitStatus({ success: false, message: "Please fill all required fields." });
      return;
    }

    const submissionData = {
      ...formData,
      preferredDate: selectedDateStr,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setSubmitStatus({ success: true, message: "Appointment request submitted successfully!" });
        setFormData({
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          preferredTime: "",
          purpose: "",
          notes: "",
        });
        setPreferredDate(null);
      } else {
        const errorData = await response.json();
        setSubmitStatus({ success: false, message: errorData.message || "Submission failed." });
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 mt-30">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Request an Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="Your phone number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Preferred Date <span className="text-red-600">*</span>
            </label>
            <DatePicker
              selected={preferredDate}
              onChange={(date) => setPreferredDate(date)}
              minDate={new Date()}
              excludeDates={bookedDates} // disables fully booked dates
              placeholderText="Select a date"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Preferred Time <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={3}
              placeholder="The purpose of your appointment"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any questions or details you'd like to add"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {submitStatus && (
            <p className={`text-center font-medium ${submitStatus.success ? "text-green-600" : "text-red-600"}`}>
              {submitStatus.message}
            </p>
          )}

          <button type="submit" className="w-full bg-[#4c735c] text-white py-3 rounded">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};
