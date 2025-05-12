import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ProjectDetailsClient } from './ProjectDetailsClient';
import { MilestoneClient } from './MilestoneClient';
import { ExpensesClient } from './ExpensesClient';
import { SupplyClient } from './SupplyClient';
import duvLogo from '../../assets/duvLogo.jpg'


export const ViewProjectClient = ({ selectedProject, onBack }) => {
  const [activeTab, setActiveTab] = useState('projectDetails');

  // Function to handle tab switching
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <Button variant="link" onClick={onBack} className="mb-6 text-[#4c735c]">
        ← Back
      </Button>

      <Card className="p-6 w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            {/* Project Image */}
            <div className="w-full sm:w-1/3 p-2">
              <img
                src={duvLogo}
                alt="Project"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>

            {/* Project Details */}
            <div className="w-full sm:w-2/3 p-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedProject.project_name}
              </h3>
              <div className="flex flex-col gap-1">
                <p className="text-md text-gray-600">
                  <span className="font-semibold">Engineer:</span> {selectedProject.engineer_name}
                </p>
                <p className="text-md text-gray-600">
                  <span className="font-semibold">Start Date:</span> {new Date(selectedProject.start_date).toLocaleDateString()}
                </p>
                <p className="text-md text-gray-600">
                  <span className="font-semibold">End Date:</span> {new Date(selectedProject.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap space-x-4 mb-4 mt-4 justify-center sm:justify-start">
        <button
          onClick={() => handleTabClick('projectDetails')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'projectDetails'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Project Details
        </button>
        <button
          onClick={() => handleTabClick('milestones')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'milestones'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => handleTabClick('legals')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'legals'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Legals
        </button>
        <button
          onClick={() => handleTabClick('expenses')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'expenses'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Expenses Tracking
        </button>

        <button
          onClick={() => handleTabClick('supply')}
          className={`text-lg font-medium cursor-pointer p-2 ${
            activeTab === 'supply'
              ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
              : 'text-gray-500'
          }`}
        >
          Supply
        </button>
      </div>

      {/* Tab Content */}
      <Card className="px-1 w-full">
        <CardContent>
          {activeTab === 'projectDetails' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Project Details</h4>
              <ProjectDetailsClient selectedProject={selectedProject} />
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Milestones</h4>
              <MilestoneClient selectedProject={selectedProject} />
            </div>
          )}

          {activeTab === 'legals' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Legals</h4>
              <p className="text-sm text-gray-600">
                {/* Legal content here */}
                Legal documents and terms related to the project can be displayed here.
              </p>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Expenses</h4>
              <ExpensesClient selectedProject={selectedProject} />
            </div>
          )}

          {activeTab === 'supply' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Supply</h4>
              <SupplyClient selectedProject={selectedProject} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
