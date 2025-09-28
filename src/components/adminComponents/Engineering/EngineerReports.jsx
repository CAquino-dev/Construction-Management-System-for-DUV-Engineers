// src/components/engineerComponents/EngineerReports.jsx
import React, { useEffect, useState } from "react";

export const EngineerReports = ({ selectedProject }) => {
  const [reports, setReports] = useState([]);
  const [commentInputs, setCommentInputs] = useState({}); // track input per report

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRes = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getReports/${selectedProject.id}`
        );
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, [selectedProject.id]);

  // Handle input typing
  const handleInputChange = (reportId, value) => {
    setCommentInputs((prev) => ({ ...prev, [reportId]: value }));
  };

  // Submit comment
  const handleAddComment = async (reportId) => {
    const content = commentInputs[reportId]?.trim();
    if (!content) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/addComment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report_id: reportId,
            content,
            author_type: "Engineer", // so backend knows
          }),
        }
      );

      if (res.ok) {
        const newComment = await res.json();
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, comments: [...(r.comments || []), newComment] }
              : r
          )
        );
        setCommentInputs((prev) => ({ ...prev, [reportId]: "" }));
      }
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

              {/* File link */}
              {report.file_url && (
                <a
                  href={`${import.meta.env.VITE_REACT_APP_API_URL}${report.file_url}`}
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

              {/* Comments section */}
              <div className="mt-3 border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Comments:
                </p>
                {report.comments && report.comments.length > 0 ? (
                  <ul className="space-y-1">
                    {report.comments.map((c) => (
                      <li
                        key={c.id}
                        className="text-xs text-gray-600 border-b pb-1"
                      >
                        <span className="font-semibold">{c.author_type}: </span>
                        {c.content}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No comments yet.</p>
                )}

                {/* Add comment box */}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[report.id] || ""}
                    onChange={(e) =>
                      handleInputChange(report.id, e.target.value)
                    }
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => handleAddComment(report.id)}
                    className="px-3 py-1 text-sm bg-[#4c735c] text-white rounded hover:bg-[#3a5c49]"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
