import React, { useEffect, useState } from 'react';
import { MyProjectAddMilestone } from './MyProjectAddMilestone';
import { MyProjectViewMilestone } from './MyProjectViewMilestone';

// Map status to color classes
const STATUS_COLORS = {
  Draft: 'bg-gray-400',
  'For Review': 'bg-yellow-400',
  Approved: 'bg-green-500',
  Rejected: 'bg-red-500',
};

export const MyProjectMilestones = ({ selectedProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [milestonesList, setMilestonesList] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

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
      { ...newMilestone, timestamp: new Date().toISOString() },
    ]);
    closeModal();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Milestones</h4>
        <button
          onClick={openModal}
          className="bg-[#4c735c] text-white px-6 py-3 text-sm rounded-md mt-4 sm:mt-0"
        >
          Add Milestone
        </button>
      </div>

      {/* Status legend */}
      <div className="flex gap-4 mb-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${color}`} />
            <p className="font-semibold">{status}</p>
          </div>
        ))}
      </div>

      {/* Milestone list */}
      <div className="border-l-2 border-gray-300 pl-6">
        {milestonesList.map((milestone) => (
          <div key={milestone.id} className="mb-6">
            <div className="flex items-center mb-2">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  STATUS_COLORS[milestone.progress_status] || 'bg-gray-300'
                }`}
              />
              <p className="text-sm text-gray-600 mr-2">
                {new Date(milestone.timestamp).toLocaleDateString()}
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              {milestone.title}
            </h3>
            <p className="text-sm text-gray-600">{milestone.details}</p>

            <button
              onClick={() => openViewModal(milestone)}
              className="text-[#4c735c] underline cursor-pointer"
            >
              View Attachments
            </button>
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
