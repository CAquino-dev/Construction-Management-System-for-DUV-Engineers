import React, { useEffect, useState } from 'react';

export const ReportsClient = ({ selectedProject }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Simulate fetching from backend

    const fetchReports = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getReports/${selectedProject.id}`)
        if (res.ok){
          const data = await res.json();
          setReports(data);
        }
      } catch (error) {
        console.error("Error fetching reports/milestones:", err);
      }
    };
    fetchReports();
  }, [selectedProject]);

  return (
    <div className="space-y-6">

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
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {report.summary}
              </p>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
