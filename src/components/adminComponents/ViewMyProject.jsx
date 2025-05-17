import React, {useState} from 'react'
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent } from '../ui/card';
import { MyProjectDetails } from './MyProjectDetails';
import { MyProjectMilestones } from './MyProjectMilestones';
import { MyprojectLegals } from './MyprojectLegals';
import duvLogo from '../../assets/duvLogo.jpg';
import { MyProjectExpenses } from './MyProjectExpenses';
import { MyprojectSupply } from './MyprojectSupply';
import { MyProjectChat } from './MyProjectChat';

export const ViewMyProject = ({ selectedProject, onBack }) => {
    console.log(selectedProject);
    const [activeTab, setActiveTab] = useState('projectDetails');
    const startDate = new Date(selectedProject.start_date).toLocaleDateString();
    const endDate = new Date(selectedProject.end_date).toLocaleDateString();

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
                        <p className="text-sm text-gray-600">
                            <strong>Client:</strong> {selectedProject.client_name}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Start Date:</strong> {startDate}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>End Date:</strong> {endDate}
                        </p>
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
                        : 'text-gray-500 hover:text-[#4c735c]'
                }`}
            >
                Project Details
            </button>
            <button
                onClick={() => handleTabClick('milestones')}
                className={`text-lg font-medium cursor-pointer p-2 ${
                    activeTab === 'milestones'
                        ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
                        : 'text-gray-500 hover:text-[#4c735c]'
                }`}
            >
                Milestones
            </button>
            <button 
                onClick={() => handleTabClick('legals')}
                className={`text-lg font-medium cursor-pointer p-2 ${
                    activeTab === 'legals'
                        ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
                        : 'text-gray-500 hover:text-[#4c735c]'
                }`}
            >
                Legals
            </button>
            <button
                onClick={() => handleTabClick('expenses')}
                className={`text-lg font-medium cursor-pointer p-2 ${
                    activeTab === 'expenses'
                        ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
                        : 'text-gray-500 hover:text-[#4c735c]'
                }`}
            >
                Expenses Tracking
            </button>
            <button
                onClick={() => handleTabClick('supply')}
                className={`text-lg font-medium cursor-pointer p-2 ${
                    activeTab === 'supply'
                        ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
                        : 'text-gray-500 hover:text-[#4c735c]'
                }`}
            >
                Supply
            </button>

            <button
                onClick={() => handleTabClick('chat')}
                className={`text-lg font-medium cursor-pointer p-2 ${
                    activeTab === 'chat'
                        ? 'text-[#4c735c] border-b-2 border-[#4c735c]'
                        : 'text-gray-500 hover:text-[#4c735c]'
                }`}
            >
                Chat
            </button>
        </div>

        {/* Tab Content */}
        <Card className="px-1 w-full">
            <CardContent>
                {activeTab === 'projectDetails' && (
                    <div className='p-4'>
                        <MyProjectDetails selectedProject={selectedProject} />
                    </div>
                )}

                {activeTab === 'milestones' && (
                    <div className='p-4'>
                        <MyProjectMilestones selectedProject={selectedProject} />
                    </div>
                )}

                {activeTab === 'legals' && (
                    <div className='p-4'>
                        <h4 className='text-lg font-semibold'>Legals Documents</h4>
                        <MyprojectLegals selectedProject={selectedProject} />
                    </div>
                )}
                {activeTab === 'expenses' && (
                    <div className='p-4'>
                        <h4 className='text-lg font-semibold'>Expenses Tracking</h4>
                        <MyProjectExpenses selectedProject={selectedProject} />
                    </div>
                )}

                {activeTab === 'supply' && (
                    <div className='p-4'>
                        <h4 className='text-lg font-semibold'>Supply</h4>
                        <MyprojectSupply selectedProject={selectedProject} />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className='p-4'>
                        <MyProjectChat selectedProject={selectedProject} className='flex-1' />
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
