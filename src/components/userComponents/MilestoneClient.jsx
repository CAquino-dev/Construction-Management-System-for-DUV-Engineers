import React, { useEffect, useState } from "react";
import axios from "axios";
import { ViewMilestoneClient } from "./ViewMilestoneClient";

export const MilestoneClient = ({ selectedProject }) => {
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [activeReport, setActiveReport] = useState(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [showReports, setShowReports] = useState({}); // Track individually per milestone
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getMilestones();
    getReports();
  }, [selectedProject.id]);

  const getMilestones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestones/${
          selectedProject.id
        }`
      );
      setMilestones(res.data.milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReports = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getReports/${
          selectedProject.id
        }`
      );
      const grouped = res.data.reduce((acc, report) => {
        if (!acc[report.milestone_id]) acc[report.milestone_id] = [];
        acc[report.milestone_id].push(report);
        return acc;
      }, {});
      setReports(grouped);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

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

  const openModal = (report, milestoneId) => {
    setActiveReport(report);
    setActiveMilestoneId(milestoneId);
    setNewComment("");
    if (!comments[report.id]) {
      loadComments(report.id);
    }
  };

  const closeModal = () => {
    setActiveReport(null);
    setActiveMilestoneId(null);
    setNewComment("");
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeReport) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/client/addComment/${
          activeReport.id
        }`,
        {
          milestoneId: activeMilestoneId,
          userId,
          comment: newComment.trim(),
        }
      );

      await loadComments(activeReport.id);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const toggleReports = (milestoneId) => {
    setShowReports((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  const openBudgetView = (milestoneId) => {
    setSelectedMilestoneId(milestoneId);
  };

  const closeBudgetView = () => {
    setSelectedMilestoneId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading milestones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Project Milestones
          </h2>
          <p className="text-gray-600">
            Track your project progress and reports
          </p>
        </div>

        {milestones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              No milestones available yet.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Milestones will appear here once created.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="p-4 md:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                    <button
                      onClick={() => openBudgetView(milestone.id)}
                      className="bg-[#4c735c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3a5a4a] transition-colors shadow-sm w-full sm:w-auto"
                    >
                      View Budget
                    </button>
                  </div>

                  {/* Timeline & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <span className="font-medium">Planned:</span>
                        {milestone.start_date
                          ? new Date(milestone.start_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}{" "}
                      </p>

                      {milestone.completed_date && (
                        <p className="flex items-center gap-1 mt-1">
                          <span className="font-medium">Completed:</span>
                          {milestone.completed_date}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : milestone.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : milestone.status === "Delayed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{milestone.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#4c735c] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${milestone.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Reports Section */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => toggleReports(milestone.id)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          Reports
                        </span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {reports[milestone.id]?.length || 0}
                        </span>
                      </div>
                      <span className="text-[#4c735c] text-sm font-medium">
                        {showReports[milestone.id] ? "Hide" : "View"}
                      </span>
                    </button>

                    {showReports[milestone.id] && (
                      <div className="mt-3 space-y-2">
                        {reports[milestone.id]?.length > 0 ? (
                          reports[milestone.id].map((report) => (
                            <div
                              key={report.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex flex-col gap-2">
                                <div>
                                  <h4 className="font-medium text-gray-800 text-sm">
                                    {report.title}
                                  </h4>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {report.summary}
                                  </p>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  {report.file_url && (
                                    <a
                                      href={`${
                                        import.meta.env.VITE_REACT_APP_API_URL
                                      }${report.file_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[#4c735c] text-sm font-medium hover:text-[#3a5a4a]"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View File
                                    </a>
                                  )}
                                  <button
                                    onClick={() =>
                                      openModal(report, milestone.id)
                                    }
                                    className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                      />
                                    </svg>
                                    Comments
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-400 text-sm">
                              No reports yet.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {activeReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                Comments: {activeReport.title}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments[activeReport.id]?.length > 0 ? (
                comments[activeReport.id].map((c) => (
                  <div
                    key={c.id}
                    className={`flex gap-3 ${
                      c.user_id == userId ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm ${
                        c.user_id == userId
                          ? "bg-[#4c735c] text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {c.user_name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div
                      className={`flex-1 max-w-[85%] ${
                        c.user_id == userId ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl ${
                          c.user_id == userId
                            ? "bg-[#4c735c] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm">
                            {c.user_id == userId ? "You" : c.user_name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              c.role_name === "client"
                                ? "bg-green-100 text-green-600"
                                : c.role_name === "Engineer"
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.role_name}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed break-words">
                          {c.comment}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-gray-400">No comments yet.</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Be the first to comment!
                  </p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form
              onSubmit={handleAddComment}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-[#4c735c] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#3a5a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget View Modal */}
      {selectedMilestoneId && (
        <ViewMilestoneClient
          milestoneId={selectedMilestoneId}
          onClose={closeBudgetView}
        />
      )}
    </div>
  );
};
