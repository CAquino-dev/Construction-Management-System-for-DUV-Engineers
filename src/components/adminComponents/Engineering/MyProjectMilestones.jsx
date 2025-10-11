import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyProjectAddMilestone } from "./MyProjectAddMilestone";
import { MyProjectViewMilestone } from "./MyProjectViewMilestone";

const STATUS_COLORS = {
  Draft: "bg-gray-400",
  "For Review": "bg-yellow-400",
  "PM Approved": "bg-green-500",
  "PM Rejected": "bg-red-500",
  "For Procurement": "bg-pink-500",
  "Finance Approved": "bg-blue-500",
  "Finance Rejected": "bg-purple-500",
};

export const MyProjectMilestones = ({ selectedProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [milestonesList, setMilestonesList] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Report form state
  const [report, setReport] = useState({
    title: "",
    summary: "",
    file: null,
  });

  const userId = localStorage.getItem("userId");
  const permissions = JSON.parse(localStorage.getItem("permissions"));
  const navigate = useNavigate();

  useEffect(() => {
    const getMilestones = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestones/${selectedProject.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setMilestonesList(data.milestones);
        }
      } catch (err) {
        console.error("Failed to fetch milestones", err);
      }
    };

    getMilestones();
  }, [selectedProject]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openViewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  const addMilestone = (newMilestone) => {
    setMilestonesList((prev) => [
      ...prev,
      { ...newMilestone, timestamp: new Date().toISOString(), progress: 0 },
    ]);
    closeModal();
  };

  const goToTaskBreakdown = (milestone) => {
    navigate(
      `/admin-dashboard/project/${selectedProject.id}/milestone/${milestone.id}/tasks`
    );
  };

  // Report modal handlers
  const openReportModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsReportModalOpen(true);
  };
  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReport({ title: "", summary: "", file: null });
  };

  const handleReportChange = (field, value) => {
    setReport((prev) => ({ ...prev, [field]: value }));
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", report.title);
      formData.append("summary", report.summary);
      formData.append("milestoneId", selectedMilestone.id);
      formData.append("created_by", userId);
      if (report.file) {
        formData.append("report_file", report.file);
      }

      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/submitReport/${selectedProject.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        alert("Report submitted successfully!");
        closeReportModal();
      } else {
        alert("Failed to submit report.");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h4 className="text-lg sm:text-xl font-bold text-gray-800">
          Milestones
        </h4>
        {permissions.role_name === "Engineer" && (
          <button
            onClick={openModal}
            className="bg-[#4c735c] text-white px-4 sm:px-6 py-2 rounded-lg shadow hover:opacity-90 transition w-full sm:w-auto"
          >
            + Add Milestone
          </button>
        )}
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <p className="text-xs sm:text-sm text-gray-700 font-medium">
              {status}
            </p>
          </div>
        ))}
      </div>

      {/* Milestone list */}
      <div className="space-y-4 sm:space-y-6">
        {milestonesList.map((milestone) => (
          <div
            key={milestone.id}
            className="bg-white shadow-md rounded-xl p-4 sm:p-6 border border-gray-200"
          >
            {/* Status + Date */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  STATUS_COLORS[milestone.status] || "bg-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500">
                {new Date(milestone.timestamp).toLocaleDateString()}
              </p>
            </div>

            {/* Title & Details */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              {milestone.title}
            </h3>
            <p className="text-sm text-gray-600 break-words">
              {milestone.details}
            </p>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1 text-xs sm:text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-700 font-medium">
                  {milestone.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className="bg-[#4c735c] h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${milestone.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
              <button
                onClick={() => openViewModal(milestone)}
                className="text-[#4c735c] text-sm sm:text-base font-medium hover:underline"
              >
                View Milestone
              </button>
              {milestone.status === "Finance Approved" && (
                <button
                  onClick={() => goToTaskBreakdown(milestone)}
                  className="text-blue-600 text-sm sm:text-base font-medium hover:underline"
                >
                  Go to Task Breakdown
                </button>
              )}
              {milestone.status === "Finance Approved" && (
              <button
                onClick={() => openReportModal(milestone)}
                className="text-indigo-600 text-sm sm:text-base font-medium hover:underline"
              >
                Create Report
              </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Milestone Modal */}
      {isModalOpen && (
        <MyProjectAddMilestone
          project={selectedProject}
          onSave={addMilestone}
          onCancel={closeModal}
        />
      )}

      {/* View Milestone Modal */}
      {isViewModalOpen && (
        <MyProjectViewMilestone
          milestone={selectedMilestone}
          onClose={closeViewModal}
        />
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Create Report for: {selectedMilestone?.title}
            </h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={report.title}
                  onChange={(e) => handleReportChange("title", e.target.value)}
                  required
                  placeholder="e.g. Foundation Completion Report"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <textarea
                  value={report.summary}
                  onChange={(e) => handleReportChange("summary", e.target.value)}
                  required
                  placeholder="Write the progress update here..."
                  rows="4"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File
                </label>
                <input
                  name="report_file"
                  type="file"
                  onChange={(e) => handleReportChange("file", e.target.files[0])}
                  className="w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4c735c] text-white rounded hover:opacity-90"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
