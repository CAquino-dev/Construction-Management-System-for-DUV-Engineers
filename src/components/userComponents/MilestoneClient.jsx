import React, { useEffect, useState } from "react";
import { MyProjectViewMilestone } from "../adminComponents/Engineering/MyProjectViewMilestone";

export const MilestoneClient = ({ selectedProject }) => {
  const [milestones, setMilestones] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    const getMilestones = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestones/${selectedProject.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setMilestones(data.milestones);
        }
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };

    getMilestones();
  }, [selectedProject.id]);

  const getStatusDotColor = (progress_status) => {
    switch (progress_status) {
      case "In Progress":
        return "bg-blue-500";
      case "Completed":
        return "bg-emerald-700";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const openViewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  return (
    <div>
      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { label: "In Progress", color: "bg-blue-500" },
          { label: "Completed", color: "bg-emerald-700" },
          { label: "Cancelled", color: "bg-red-500" },
        ].map((status) => (
          <div key={status.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${status.color}`} />
            <span className="text-sm text-gray-700">{status.label}</span>
          </div>
        ))}
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <p className="text-gray-500">No milestones found for this project.</p>
        ) : (
          milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => openViewModal(milestone)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{milestone.title}</h3>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${milestone.progress || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {milestone.progress || 0}% complete
              </p>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedMilestone && (
        <MyProjectViewMilestone
          milestone={selectedMilestone}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};
