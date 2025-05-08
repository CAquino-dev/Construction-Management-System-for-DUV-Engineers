import React, { useEffect, useState } from 'react';
import { MyProjectAddMilestone } from './MyProjectAddMilestone'; // Assuming your modal component
import { MyProjectViewMilestone } from './MyProjectViewMilestone'; // View milestone modal

const milestones = [
  {
    timestamp: "2 Mar 12:36",
    status: "Nakapag Lagay na kami ng semento boss",
    details: "Lagay semento sabay kain ng buhangin",
    pictures: [], // Add some pictures if needed
    files: [] // Add some files if needed
  },
  {
    timestamp: "2 Mar 09:04",
    status: "Tanim ng Omad para hindi mahuli ng silup",
    details: "Nagtanim kami ng omad para pag lagay ng tiles nakatago",
    pictures: [],
    files: []
  },
  {
    timestamp: "2 Mar 09:03",
    status: "Lagay ng tiles",
    details: "Safe ng yung tanim natakpan na ng tiles",
    pictures: [],
    files: []
  },
  {
    timestamp: "2 Mar 06:07",
    status: "Lagay ng Bubong ng salamin para mainitan omad",
    details: "Safe na yung tanim",
    pictures: [],
    files: []
  },
  {
    timestamp: "2 Mar 03:52",
    status: "Lagay ng pinto",
    details: "Lagay pinto baka magalit si boss",
    pictures: [],
    files: []
  },
  {
    timestamp: "2 Mar 02:32",
    status: "Lagay lock ng pinto",
    details: "Lagay lock ng pinto para hindi magalit si boss",
    pictures: [],
    files: []
  },
];

export const MyProjectMilestones = ({ selectedProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Track view modal state
  const [milestonesList, setMilestonesList] = useState(milestones);
  const [selectedMilestone, setSelectedMilestone] = useState(null); // Selected milestone for viewing


    useEffect(() => {
      const getMilestones = async () => {
        const response = await fetch(`http://localhost:5000/api/project/getMilestones/${selectedProject.id}`);
        if(response.ok){
        const data = await response.json();
        setMilestonesList(data.milestones);
        }
      };
  
      getMilestones();
    }, [])

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
            <div key={index} className="mb-6">
              <div className="flex flex-col">
                {/* Milestone Dot and Timestamp */}
                <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                  <div className="w-3 h-3 bg-[#4c735c]/70 rounded-full mr-2" />
                  <p className="text-sm text-gray-600">{milestone.timestamp}</p>
                </div>
                {/* Milestone Status and Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">{milestone.status}</h3>
                  <p className="text-sm text-gray-600">{milestone.details}</p>
                  <button
                    onClick={() => openViewModal(milestone)} // Open view modal on button click
                    className='text-[#4c735c] underline cursor-pointer'
                  >
                    View Attachments
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
          milestone={selectedMilestone} // Pass selected milestone to the view modal
          onClose={closeViewModal} // Close the modal on close
        />
      )}
    </div>
  );
};
