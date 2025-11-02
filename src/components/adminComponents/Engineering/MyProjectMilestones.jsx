import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyProjectAddMilestone } from "./MyProjectAddMilestone";
import { MyProjectViewMilestone } from "./MyProjectViewMilestone";
import { toast } from "sonner";
import ConfirmationModal from "../ConfirmationModal";
import { X } from "@phosphor-icons/react";

const STATUS_STYLES = {
  Draft: "bg-gray-100 text-gray-700 border border-gray-300",
  "Pending Finance Approval": "bg-sky-100 text-sky-800 border border-sky-200",
  "For Review": "bg-yellow-100 text-yellow-800 border border-yellow-200",
  "PM Approved": "bg-green-100 text-green-800 border border-green-200",
  "PM Rejected": "bg-red-100 text-red-800 border border-red-200",
  "Finance Approved": "bg-blue-100 text-blue-800 border border-blue-200",
  "Finance Rejected": "bg-purple-100 text-purple-800 border border-purple-200",
  "For Procurement": "bg-pink-100 text-pink-800 border border-pink-200",
  "Pending Delivery": "bg-orange-100 text-orange-800 border border-orange-200",
  Delivered: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

export const MyProjectMilestones = ({ selectedProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [milestonesList, setMilestonesList] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [remark, setRemark] = useState("");

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
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/project/getMilestones/${selectedProject.id}`
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

  const openConfirmationModal = () => {
    setRemark("");
    setIsConfirmationModalOpen(true);
  };
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setRemark("");
  };

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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/submitReport/${
          selectedProject.id
        }`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        toast.success("Report submitted successfully!");
        closeReportModal();
      } else {
        toast.error("Failed to submit report.");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  const handleCompleteProject = () => {
    openConfirmationModal();
  };

  const confirmCompleteProject = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/complete/${
          selectedProject.id
        }`,
        { method: "PUT" }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Project marked as completed!");
      } else {
        toast.error(data.error || "Failed to complete project.");
      }
    } catch (err) {
      console.error("Error completing project:", err);
      toast.error("Server error.");
    } finally {
      setIsConfirmationModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Milestones</h1>
              <p className="text-gray-600 text-sm mt-1">
                Track project progress and milestones
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {(permissions.role_name === "Site Manager" ||
                permissions.role_name === "Admin") && (
                <>
                  <button
                    onClick={openModal}
                    className="bg-[#4c735c] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3a5a4a] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>+</span>
                    Add Milestone
                  </button>

                  <button
                    onClick={handleCompleteProject}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>✓</span>
                    Complete Project
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Milestone list */}
        <div className="space-y-4">
          {milestonesList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3 text-gray-300">📋</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Milestones Yet
              </h3>
              <p className="text-gray-500">
                Add milestones to track your project progress
              </p>
            </div>
          ) : (
            milestonesList.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(milestone.timestamp).toLocaleDateString()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES[milestone.status] ||
                          "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {milestone.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {milestone.details}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-700 font-medium">
                      {milestone.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#4c735c] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${milestone.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openViewModal(milestone)}
                    className="text-[#4c735c] font-medium hover:text-[#3a5a4a] transition-colors text-left py-1"
                  >
                    View Details
                  </button>
                  {milestone.status === "Delivered" && (
                    <>
                      <button
                        onClick={() => goToTaskBreakdown(milestone)}
                        className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-left py-1"
                      >
                        Task Breakdown
                      </button>
                      <button
                        onClick={() => openReportModal(milestone)}
                        className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors text-left py-1"
                      >
                        Create Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
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

      {/* Report Modal - Mobile Friendly */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Report
              </h3>
              <button
                onClick={closeReportModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  For:{" "}
                  <span className="font-medium">
                    {selectedMilestone?.title}
                  </span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title
                </label>
                <input
                  type="text"
                  value={report.title}
                  onChange={(e) => handleReportChange("title", e.target.value)}
                  required
                  placeholder="e.g. Foundation Completion Report"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4c735c] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  value={report.summary}
                  onChange={(e) =>
                    handleReportChange("summary", e.target.value)
                  }
                  required
                  placeholder="Write the progress update here..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4c735c] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  name="report_file"
                  type="file"
                  onChange={(e) =>
                    handleReportChange("file", e.target.files[0])
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4c735c] file:text-white hover:file:bg-[#3a5a4a]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4c735c] text-white py-3 rounded-lg font-medium hover:bg-[#3a5a4a] transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Completing Project */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmCompleteProject}
        actionType="Mark this project as completed"
        setRemark={setRemark}
      />
    </div>
  );
};
