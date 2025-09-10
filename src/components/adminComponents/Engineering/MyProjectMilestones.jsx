import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyProjectAddMilestone } from './MyProjectAddMilestone';
import { MyProjectViewMilestone } from './MyProjectViewMilestone';

// Map status to color classes
const STATUS_COLORS = {
  Draft: 'bg-gray-400',
  'For Review': 'bg-yellow-400',
  'PM Approved': 'bg-green-500',
  'PM Rejected': 'bg-red-500',
};

export const MyProjectMilestones = ({ selectedProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [milestonesList, setMilestonesList] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const permissions = JSON.parse(localStorage.getItem('permissions'));
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
        console.error('Failed to fetch milestones', err);
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

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h4 className="text-xl font-bold text-gray-800">Milestones</h4>
        {permissions.role_name === 'Engineer' && (
          <button
            onClick={openModal}
            className="bg-[#4c735c] text-white px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            + Add Milestone
          </button>
        )}
      </div>

      {/* Status legend */}
      <div className="flex gap-6 mb-6">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <p className="text-sm text-gray-700 font-medium">{status}</p>
          </div>
        ))}
      </div>

      {/* Milestone list */}
      <div className="space-y-6">
        {milestonesList.map((milestone) => (
          <div
            key={milestone.id}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
          >
            {/* Status + Date */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  STATUS_COLORS[milestone.status] || 'bg-gray-300'
                }`}
              />
              <p className="text-xs text-gray-500">
                {new Date(milestone.timestamp).toLocaleDateString()}
              </p>
            </div>

            {/* Title & Details */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {milestone.title}
            </h3>
            <p className="text-sm text-gray-600">{milestone.details}</p>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs text-gray-700 font-medium">
                  {milestone.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#4c735c] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${milestone.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => openViewModal(milestone)}
                className="text-[#4c735c] font-medium hover:underline"
              >
                View Milestone
              </button>
              <button
                onClick={() => goToTaskBreakdown(milestone)}
                className="text-blue-600 font-medium hover:underline"
              >
                Go to Task Breakdown
              </button>
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
    </div>
  );
};
