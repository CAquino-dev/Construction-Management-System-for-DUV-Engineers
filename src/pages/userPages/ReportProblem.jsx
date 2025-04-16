import React, { useState } from "react";

export const ReportProblem = () => {
  const [problemTitle, setProblemTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Problem Submitted:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`);
    setProblemTitle(""); 
    setProblemDescription("");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-10 max-w-2xl w-full bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Report a Problem</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Title of your problem"
            value={problemTitle}
            onChange={(e) => setProblemTitle(e.target.value)}
            required
          />
          {/* Description Textarea */}
          <textarea
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 resize-none h-32"
            placeholder="Describe your problem..."
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            required
          />
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#4c735c] text-white py-3 rounded-lg transition font-semibold"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
