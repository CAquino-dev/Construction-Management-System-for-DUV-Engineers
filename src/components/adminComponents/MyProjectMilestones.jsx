import React, { useEffect, useState } from 'react';
import { MyProjectAddMilestone } from './MyProjectAddMilestone';
import { MyProjectViewMilestone } from './MyProjectViewMilestone';
import { MyProjectSupplyExpenses } from './MyProjectSupplyExpenses';
import { MyProjectExpenses } from './MyProjectExpenses';

const milestones = [
  {
    id: 1,
    timestamp: "2 Mar 12:36",
    status: "Nakapag Lagay na kami ng semento boss",
    details: "Lagay semento sabay kain ng buhangin",
    pictures: [],
    files: []
  },
  {
    id: 2,
    timestamp: "2 Mar 09:04",
    status: "Tanim ng Omad para hindi mahuli ng silup",
    details: "Nagtanim kami ng omad para pag lagay ng tiles nakatago",
    pictures: [],
    files: []
  },
  // ... more milestones ...
];

export const MyProjectMilestones = ({ selectedProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [milestonesList, setMilestonesList] = useState(milestones);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // New states for managing expenses
  const [selectedMilestoneIdForExpenses, setSelectedMilestoneIdForExpenses] = useState(null);
  const [showExpenses, setShowExpenses] = useState(false);

  useEffect(() => {
    const getMilestones = async () => {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestones/${selectedProject.id}`);
      if (response.ok) {
        const data = await response.json();
        setMilestonesList(data.milestones);
      }
    };

    getMilestones();
  }, [selectedProject]);

  // Open the Add Milestone modal
  const openModal = () => setIsModalOpen(true);

  // Close the Add Milestone modal
  const closeModal = () => setIsModalOpen(false);

  // Open the View Milestone modal
  const openViewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsViewModalOpen(true);
  };

  // Close the View Milestone modal
  const closeViewModal = () => setIsViewModalOpen(false);

  // Handle adding a new milestone
  const addMilestone = (newMilestone) => {
    const updatedMilestones = [
      ...milestonesList,
      { ...newMilestone, timestamp: new Date().toLocaleString() }
    ];
    setMilestonesList(updatedMilestones);
    closeModal();
  };

  // Handle Manage Expenses button click from modal
  const handleManageExpenses = (milestoneId) => {
    setSelectedMilestoneIdForExpenses(milestoneId);
    setShowExpenses(true);
    setIsViewModalOpen(false); // Optional: close milestone modal when showing expenses
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Milestones</h4>
        <button
          onClick={openModal}
          className="bg-[#4c735c] text-white px-6 py-3 text-sm sm:px-4 sm:py-2 rounded-md mt-4 sm:mt-0"
        >
          Add Milestone
        </button>
      </div>

      <div className="relative">
        <div className="border-l-2 border-gray-300 pl-6">
          {milestonesList.map((milestone, index) => (
            <div key={milestone.id || index} className="mb-6">
              <div className="flex flex-col">
                <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                  <div className="w-3 h-3 bg-[#4c735c]/70 rounded-full mr-2" />
                  <p className="text-sm text-gray-600">{new Date(milestone.timestamp).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">{milestone.status}</h3>
                  <p className="text-sm text-gray-600">{milestone.details}</p>
                  <button
                    onClick={() => openViewModal(milestone)}
                    className="text-[#4c735c] underline cursor-pointer mr-4"
                  >
                    View Attachments
                  </button>
                  <button
                    onClick={() => handleManageExpenses(milestone.id)}
                    className="text-white bg-[#4c735c] rounded px-3 py-1 hover:bg-[#3b5d47]"
                  >
                    Request Budget
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Adding Milestone */}
      {isModalOpen && (
        <MyProjectAddMilestone
          project={selectedProject}
          onSave={addMilestone}
          onCancel={closeModal}
        />
      )}

      {/* Modal for Viewing Milestone */}
      {isViewModalOpen && (
        <MyProjectViewMilestone
          milestone={selectedMilestone}
          onClose={closeViewModal}
          onManageExpenses={handleManageExpenses}
        />
      )}

      {/* Show Expenses Section */}
      {showExpenses && selectedMilestoneIdForExpenses && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Request Budget for Selected Milestone</h3>
          <MyProjectExpenses milestoneId={selectedMilestoneIdForExpenses} />
          <button
            onClick={() => setShowExpenses(false)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Close Expenses
          </button>
        </div>
      )}

    </div>
  );
};
