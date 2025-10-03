import React, { useEffect, useState } from "react";
import axios from "axios";

export const MilestoneClient = ({ selectedProject }) => {
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [activeReport, setActiveReport] = useState(null); // report selected for modal
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [showReports, setShowReports] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getMilestones();
    getReports();
  }, [selectedProject.id]);

  // Fetch milestones
  const getMilestones = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestones/${
          selectedProject.id
        }`
      );
      setMilestones(res.data.milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    }
  };

  // Fetch reports
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

  // Fetch comments when opening modal
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
  const openModal = (report, milestoneId) => {
    setActiveReport(report);
    setActiveMilestoneId(milestoneId);
    setNewComment("");
    if (!comments[report.id]) {
      loadComments(report.id);
    }
  };

  // Close modal
  const closeModal = () => {
    setActiveReport(null);
    setActiveMilestoneId(null);
    setNewComment("");
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment || !activeReport) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/client/addComment/${
          activeReport.id
        }`,
        {
          milestoneId: activeMilestoneId,
          userId,
          comment: newComment,
        }
      );

      await loadComments(activeReport.id);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Project Milestones</h2>

      {milestones.length === 0 ? (
        <p className="text-gray-500">No milestones available yet.</p>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-800">
                {milestone.title}
              </h3>
              <p className="text-gray-600 mb-2">{milestone.description}</p>

              {/* Timeline */}
              <div className="text-sm text-gray-500 mb-2">
                <p>
                  <strong>Planned:</strong> {milestone.start_date} -{" "}
                  {milestone.end_date}
                </p>
                {milestone.completed_date && (
                  <p>
                    <strong>Completed:</strong> {milestone.completed_date}
                  </p>
                )}
              </div>

              {/* Status */}
              <span
                className={`inline-block px-3 py-1 text-sm rounded-full mb-2 ${
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

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${milestone.progress || 0}%` }}
                ></div>
              </div>

              {/* Reports linked to milestone */}
              <div className="mt-3">
                {/* Header / Toggle */}
                <div
                  onClick={() => setShowReports(!showReports)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-700">Reports</p>
                  <span className="text-xs text-blue-500 underline">
                    {showReports ? "Hide" : "View"}
                  </span>
                </div>

                {/* Collapsible reports */}
                {showReports && (
                  <>
                    {reports[milestone.id]?.length > 0 ? (
                      <ul className="list-disc list-inside mt-2 space-y-2">
                        {reports[milestone.id].map((report) => (
                          <li
                            key={report.id}
                            className="text-gray-600 text-sm border p-2 rounded flex justify-between items-center"
                          >
                            <div>
                              <strong>{report.title}</strong> - {report.summary}
                              {report.file_url && (
                                <a
                                  href={`${
                                    import.meta.env.VITE_REACT_APP_API_URL
                                  }${report.file_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline ml-2"
                                >
                                  View File
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => openModal(report, milestone.id)}
                              className="text-xs text-blue-500 underline ml-2"
                            >
                              Comments
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm mt-2">
                        No reports yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments Modal */}
      {activeReport && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative h-[80vh] flex flex-col">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Comments for: {activeReport.title}
            </h3>

            {/* Comments list */}
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

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button className="bg-[#4c735c] text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
