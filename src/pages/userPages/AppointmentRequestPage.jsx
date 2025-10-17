import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_APPOINTMENTS_PER_DAY = 1;

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedDateStr = preferredDate?.toISOString().split("T")[0];

    if (
      !formData.clientName.trim() ||
      !formData.clientEmail.trim() ||
      !selectedDateStr ||
      !formData.preferredTime ||
      !formData.purpose
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
      ...formData,
      preferredDate: selectedDateStr,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/appointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        }
      );

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Appointment request submitted successfully!",
        });
        toast.success("Appointment request submitted successfully!");
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
        toast.error(errorData.message || "Submission failed.");
        setSubmitStatus({
          success: false,
          message: errorData.message || "Submission failed.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "An error occurred. Please try again.",
      });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom date styling for booked dates
  const dayClassName = (date) => {
    const isBooked = bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === date.toDateString()
    );
    return isBooked ? "bg-red-100 text-red-500 line-through" : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="w-16 h-16 bg-[#4c735c] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request an Appointment
            </h1>
            <p className="text-gray-600">
              Fill out the form below to schedule your appointment. We'll get
              back to you shortly.
            </p>
          </div>

          {/* Availability Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-lg">💡</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Availability Notice</p>
                <p>
                  Fully booked dates are automatically disabled. Please select
                  an available date.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                Appointment Details
              </h3>

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
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Please describe the purpose of your appointment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional information or special requests..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4c735c] hover:bg-[#3a5a4a] active:bg-[#2d473a] shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>📨</span>
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>

          {/* Required Fields Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              <span className="text-red-500">*</span> indicates required fields
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">
            Need Immediate Assistance?
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Contact us directly if you need to reschedule or have urgent
            questions.
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-gray-700">📞 (555) 123-4567</span>
            <span className="text-gray-700">✉️ contact@company.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
