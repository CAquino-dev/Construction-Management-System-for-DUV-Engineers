import React, { useEffect, useState } from 'react';
import { MyProjectAddMilestone } from './MyProjectAddMilestone';
import { MyProjectViewMilestone } from './MyProjectViewMilestone';
import { MyProjectSupplyExpenses } from './MyProjectSupplyExpenses';
import { MyProjectExpenses } from './MyProjectExpenses';
import { MyProjectMilestoneExpenses } from './MyProjectMilestoneExpenses';
import { MyProjectMilestoneUpdateStatus } from './MyProjectMilestoneUpdateStatus';

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
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedMilestoneForUpdate, setSelectedMilestoneForUpdate] = useState(null);

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

  useEffect(() => {
    console.log('milestonesList', milestonesList);
  }, [milestonesList]);

  const getStatusDotColor = (progress_status) => {
    switch (progress_status) {
      case "For Payment":
        return "bg-yellow-400";
      case "Payment Confirmed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Completed":
        return "bg-emerald-700";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-[#4c735c]/70"; // fallback color
    }
  };

  const openUpdateStatusModal = (milestone) => {
    setSelectedMilestoneForUpdate(milestone);
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    setSelectedMilestoneForUpdate(null);
    setIsUpdateStatusModalOpen(false);
  };

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
      <div className='flex gap-4 mb-4'>
        <div className='flex flex-row items-center'>
          <div className='w-3 h-3 rounded-full mr-2 bg-yellow-400'></div>
          <p className='font-semibold'>For Payment</p>
        </div>
        <div className='flex flex-row items-center'>
          <div className='w-3 h-3 rounded-full mr-2 bg-green-500'></div>
          <p className='font-semibold'>Payment Confirmed</p>
        </div>
        <div className='flex flex-row items-center'>
          <div className='w-3 h-3 rounded-full mr-2 bg-blue-500'></div>
          <p className='font-semibold'>In Progress</p>
        </div>
        <div className='flex flex-row items-center'>
          <div className='w-3 h-3 rounded-full mr-2 bg-emerald-700'></div>
          <p className='font-semibold'>Completed</p>
        </div>
        <div className='flex flex-row items-center'>
          <div className='w-3 h-3 rounded-full mr-2 bg-red-500'></div>
          <p className='font-semibold'>Canceled</p>
        </div>
      </div>

      <div className="relative">
        <div className="border-l-2 border-gray-300 pl-6">
          {milestonesList.map((milestone, index) => {
            const showButtons = milestone.progress_status !== "For Payment" && milestone.progress_status !== "Completed";

            return (
              <div key={milestone.id || index} className="mb-6">
                <div className="flex flex-col">
                  <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusDotColor(milestone.progress_status)}`}
                    />
                    <p className="text-sm text-gray-600 mr-2">{new Date(milestone.timestamp).toLocaleDateString()}</p>
                    {showButtons && (
                      <>
                        <button
                          onClick={() => openUpdateStatusModal(milestone)}
                          className="text-[#4c735c] rounded text-sm px-2 py-1 border border-[#4c735c] cursor-pointer mr-2"
                        >
                          Update Status
                        </button>

                        {isUpdateStatusModalOpen && selectedMilestoneForUpdate && (
                          <MyProjectMilestoneUpdateStatus
                            milestone={selectedMilestoneForUpdate}
                            onClose={closeUpdateStatusModal}
                          />
                        )}

                        <button
                          onClick={() => handleManageExpenses(milestone.id)}
                          className="text-white rounded text-sm px-2 py-1 bg-[#4c735c] hover:bg-[#4c735c] cursor-pointer"
                        >
                          Add Expenses
                        </button>
                      </>
                    )}
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
                  </div>
                </div>
              </div>
            );
          })}
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
          <MyProjectMilestoneExpenses
            milestoneId={selectedMilestoneIdForExpenses}
            onClose={() => setShowExpenses(false)}
          />
        </div>
      )}
    </div>
  );
};
