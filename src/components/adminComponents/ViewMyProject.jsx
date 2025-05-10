import React, {useState} from 'react'
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent } from '../ui/card';
import { MyProjectDetails } from './MyProjectDetails';
import { MyProjectMilestones } from './MyProjectMilestones';
import { MyprojectLegals } from './MyprojectLegals';
import { MyProjectExpenses } from './MyProjectExpenses';
import { MyprojectSupply } from './MyprojectSupply';

export const ViewMyProject = ({ selectedProject, onBack }) => {
    const [activeTab, setActiveTab] = useState('projectDetails');

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
                            src={selectedProject.image}
                            alt="Project"
                            className="w-full h-auto object-cover rounded-lg"
                        />
                    </div>

                    {/* Project Details */}
                    <div className="w-full sm:w-2/3 p-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {selectedProject.projectname_}
                        </h3>
                        <p className="text-sm text-gray-600">
                            <strong>Client:</strong> {selectedProject.Client}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Start Date:</strong> {selectedProject.date_started}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>End Date:</strong> {selectedProject.date_end}
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
                        <h4 className='text-lg font-semibold'>Legals</h4>
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
            </CardContent>
        </Card>
    </div>
  )
}
