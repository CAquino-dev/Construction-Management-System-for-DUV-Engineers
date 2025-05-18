import { useState, useEffect } from "react";

export const AppointmentRequestPage = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.clientName.trim() ||
      !formData.clientEmail.trim() ||
      !formData.preferredDate ||
      !formData.preferredTime
    ) {
      setSubmitStatus({ success: false, message: "Please fill all required fields." });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({ success: true, message: "Appointment request submitted successfully!" });
        setFormData({
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          preferredDate: "",
          preferredTime: "",
          notes: "",
        });
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
            <label htmlFor="clientName" className="block font-semibold mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="clientEmail" className="block font-semibold mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="clientPhone" className="block font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="preferredDate" className="block font-semibold mb-1">
              Preferred Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              required
              min={minDate}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="preferredTime" className="block font-semibold mb-1">
              Preferred Time <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block font-semibold mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any questions or details you'd like to add"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {submitStatus && (
            <p
              className={`text-center font-medium ${
                submitStatus.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {submitStatus.message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#4c735c] text-white py-3 rounded transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
