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
    <div className="space-y-4">
      {reports.length === 0 ? (
        <p className="text-gray-500">No reports available yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li key={report.id} className="py-3">
              <p className="font-medium text-gray-700">{report.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mt-1">{report.summary}</p>
              {report.file_url && (
                <a
                  href={report.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4c735c] text-sm underline"
                >
                  View Full Report
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
