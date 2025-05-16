import React, { useState } from 'react';

export const SendFeedback = () => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    phone: '',
    feedbackType: 'positive',
    feedbackAbout: '', // This is still an input field
    description: '', // Description is now a textarea
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., send feedback to the server)
    console.log(feedback);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white max-w-2xl p-6 rounded shadow-md w-96 w-full">
        <h2 className="text-xl font-semibold mb-4">Send Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={feedback.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={feedback.email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={feedback.phone}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700">Feedback Type</label>
            <select
              id="feedbackType"
              name="feedbackType"
              value={feedback.feedbackType}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            >
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="feedbackAbout" className="block text-sm font-medium text-gray-700">Feedback About</label>
            <input
              type="text"
              id="feedbackAbout"
              name="feedbackAbout"
              value={feedback.feedbackAbout}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={feedback.description}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              rows="4"
              required
            />
          </div>

          <button type="submit" className="w-full bg-[#4C9B4D] text-white p-2 rounded">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};
