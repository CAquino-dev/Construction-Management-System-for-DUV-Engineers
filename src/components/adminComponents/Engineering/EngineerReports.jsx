import React, { useEffect, useState } from "react";
import axios from "axios";

export const EngineerReports = ({ selectedProject }) => {
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [activeReport, setActiveReport] = useState(null);

  const userId = localStorage.getItem("userId");

  console.log(userId)

  useEffect(() => {
    getReports();
  }, [selectedProject.id]);

  // Fetch reports
  const getReports = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getEngineerReports/${
          selectedProject.id
        }`,
        {
          userId
        }
      );
      console.log(res.data);
      setReports(res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Fetch comments
  const loadComments = async (reportId) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/client/getReportComments/${reportId}`
      );
      setComments((prev) => ({ ...prev, [reportId]: res.data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Open modal
  const openModal = (report) => {
    setActiveReport(report);
    setNewComment("");
    if (!comments[report.id]) {
      loadComments(report.id);
    }
  };

  // Close modal
  const closeModal = () => {
    setActiveReport(null);
    setNewComment("");
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeReport) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/client/addComment/${
          activeReport.id
        }`,
        {
          milestoneId: null, // explicitly send null
          userId,
          comment: newComment.trim(),
        }
      );

      const savedComment = res.data;

      setComments((prev) => ({
        ...prev,
        [activeReport.id]: [...(prev[activeReport.id] || []), savedComment],
      }));

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800">Engineer Reports</h4>

      {reports.length === 0 ? (
        <p className="text-gray-500 text-sm">No reports submitted yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">{report.title}</h5>
                <span className="text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-600 mb-3">{report.summary}</p>

              <div className="flex gap-4">
                {report.file_url && (
                  <a
                    href={`${import.meta.env.VITE_REACT_APP_API_URL}${
                      report.file_url
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-[#4c735c] font-medium hover:underline"
                  >
                    📎 View Attached File
                  </a>
                )}

                {/* Milestone info */}
                {report.milestone_title && (
                  <p className="text-xs text-gray-500 mt-2">
                    Linked to milestone:{" "}
                    <span className="font-medium text-gray-700">
                      {report.milestone_title}
                    </span>
                  </p>
                )}

                {/* Open Comments */}
                <button
                  onClick={() => openModal(report)}
                  className="cursor-pointer text-xs text-blue-500 font-semibold hover:underline"
                >
                  View Comments
                </button>
              </div>

              {/* File link */}
            </div>
          ))}
        </div>
      )}

      {/* Comments Modal */}
      {activeReport && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Comments for: {activeReport.title}
            </h3>

            {/* Comments list */}
            <div className="max-h-96 overflow-y-auto mb-4 space-y-3">
              {comments[activeReport.id]?.length > 0 ? (
                comments[activeReport.id].map((c) => (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {comments[activeReport.id]?.length > 0 ? (
                      comments[activeReport.id].map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start gap-3 bg-white shadow-sm rounded-xl p-3 border border-gray-100"
                        >
                          {/* Avatar circle (initials) */}
                          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 font-semibold rounded-full">
                            {c.user_name?.charAt(0).toUpperCase() || "U"}
                          </div>

                          {/* Comment content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {c.user_id == userId ? "You" : c.user_name}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full
                          ${
                            c.role_name === "client"
                              ? "bg-green-100 text-green-600"
                              : c.role_name === "Engineer"
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                              >
                                {c.role_name}
                              </span>

                              <span className="text-xs text-gray-400 ml-auto">
                                {new Date(c.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mt-1 leading-relaxed break-words">
                              {c.comment}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center italic">
                        No comments yet.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}
            </div>

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border rounded-lg p-2 text-sm"
              />
              <button className="bg-[#4c735c] text-white px-4 rounded-lg text-sm">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
