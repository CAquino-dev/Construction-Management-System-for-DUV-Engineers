import React, { useEffect, useState } from 'react';
import { MyProjectViewMilestone } from '../adminComponents/Engineering/MyProjectViewMilestone';

export const MilestoneClient = ({ selectedProject }) => {
  const [milestones, setMilestones] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(true);

  // Missing states added here:
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);

  useEffect(() => {
    const getMilestones = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getMilestones/${selectedProject.id}`);
        if (response.ok) {
          const data = await response.json();
          setMilestones(data.milestones);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    getMilestones();
  }, [selectedProject.id]);

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

  const openExpensesModal = (milestone) => {
    setSelectedExpenses(milestone.expense || []);
    setIsExpensesModalOpen(true);
  };
  const closeExpensesModal = () => {
    setIsExpensesModalOpen(false);
    setSelectedExpenses([]);
  };

  const openViewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => setIsViewModalOpen(false);

  // Decide which milestones to display based on toggle
  const filteredMilestones = showPendingOnly
    ? milestones.filter(m => m.progress_status === 'For Payment')
    : milestones;

  return (
    <div>
      <div>
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
      </div>
      {/* Toggle Buttons */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setShowPendingOnly(true)}
          className={`px-4 py-2 rounded ${
            showPendingOnly ? 'bg-[#4c735c] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Pending Payments
        </button>
        <button
          onClick={() => setShowPendingOnly(false)}
          className={`px-4 py-2 rounded ${
            !showPendingOnly ? 'bg-[#4c735c] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          All Milestones
        </button>
      </div>

      {/* Milestones List */}
      {filteredMilestones.length === 0 ? (
        <p>{showPendingOnly ? 'No milestones pending payment.' : 'No milestones found.'}</p>
      ) : (
        <div className="relative border-l-2 border-gray-300 pl-6">
          {filteredMilestones.map((milestone, index) => (
            <div key={index} className="mb-6">
              <div className="flex flex-col">
                <div className="flex items-center mb-2 sm:mb-0 sm:mr-4 gap-2">
                  <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusDotColor(milestone.progress_status)}`}
                    />
                  <p className="text-sm text-gray-600">
                    {new Date(milestone.timestamp).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => openExpensesModal(milestone)}
                    className='text-white rounded text-sm px-2 py-1 bg-[#4c735c] hover:bg-[#4c735c] cursor-pointer'
                  >
                    View Expenses
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">{milestone.status}</h3>
                  <p className="text-sm text-gray-600">{milestone.details}</p>
                  {showPendingOnly && (
                    <p className="font-semibold mt-1">Amount Due: ₱{Number(milestone.payment_amount || 0).toFixed(2)}</p>
                  )}
                  <button
                    onClick={() => openViewModal(milestone)}
                    className="text-[#4c735c] underline cursor-pointer mt-1"
                  >
                    View Attachments
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isViewModalOpen && selectedMilestone && (
        <MyProjectViewMilestone
          milestone={selectedMilestone}
          onClose={closeViewModal}
        />
      )}

      {isExpensesModalOpen && (
        <ViewSupplyExpenses
          selectedProject={selectedProject}
          expenses={selectedExpenses}
          milestoneName={selectedMilestone?.milestone || selectedMilestone?.status || "Milestone"}
          onClose={closeExpensesModal}
        />
      )}
    </div>
  );
};
