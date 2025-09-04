// src/components/engineerComponents/EngineerReports.jsx
import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";

export const EngineerReports = ({ selectedProject }) => {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    title: "",
    summary: "",
    milestone_id: "",
    file: null,
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reports
        const reportsRes = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getReports/${selectedProject.id}`
        );
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }

      } catch (err) {
        console.error("Error fetching reports/milestones:", err);
      }
    };
    fetchData();
  }, [selectedProject.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReport.title || !newReport.summary) return;

    try {
      const formData = new FormData();
      formData.append("title", newReport.title);
      formData.append("summary", newReport.summary);
      formData.append("projectId", selectedProject.id);
      formData.append("created_by", userId);
      if (newReport.file) {
        formData.append("report_file", newReport.file); // field name must match backend multer field
      }

      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/submitReport/${selectedProject.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const createdReport = await res.json();
        setReports((prev) => [...prev, createdReport]);
        setNewReport({ title: "", summary: "", milestone_id: "", file: null });
      } else {
        console.error("Failed to submit report");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold">Engineer Reports</h4>

      {/* Create Report Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded-md bg-gray-50"
      >
        <div>
          <label className="block font-medium">Report Title</label>
          <input
            type="text"
            value={newReport.title}
            onChange={(e) =>
              setNewReport({ ...newReport, title: e.target.value })
            }
            className="w-full border p-2 rounded"
            placeholder="e.g. Foundation Completion Report"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Summary</label>
          <textarea
            value={newReport.summary}
            onChange={(e) =>
              setNewReport({ ...newReport, summary: e.target.value })
            }
            className="w-full border p-2 rounded"
            rows={4}
            placeholder="Write the progress update here..."
            required
          />
        </div>

        <div>
          <label className="block font-medium">Upload File</label>
          <input
            name="report_file"
            type="file"
            required
            onChange={(e) =>
              setNewReport({ ...newReport, file: e.target.files[0] })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        <Button type="submit" className="bg-[#4c735c] text-white">
          Submit Report
        </Button>
      </form>

      {/* Reports List */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-700">Submitted Reports</h5>
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
                  href={`${import.meta.env.VITE_REACT_APP_API_URL}${report.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4c735c] text-sm underline"
                >
                  View Report File
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
