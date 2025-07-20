import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { MyProjectSupplyExpenses } from './MyProjectSupplyExpenses';
import { MyProjectLaborExpenses } from './MyProjectLaborExpenses';
import { X } from "@phosphor-icons/react";

export const MyProjectMilestoneExpenses = ({ milestoneId, onClose }) => {
    const [activeTab, setActiveTab] = useState('supply');

  return (
     <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] h-[600px] overflow-hidden flex flex-col relative">
            <h3 className="text-xl font-semibold mb-4">Request Budget for Selected Milestone</h3>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
    
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex space-x-4 border-b">
                <TabsTrigger value="supply" className="cursor-pointer">Supply Expenses</TabsTrigger>
                <TabsTrigger value="labor" className="cursor-pointer">Labor Expenses</TabsTrigger>
              </TabsList>
    
              {/* Tab Contents */}
              <TabsContent value="supply">
                <MyProjectSupplyExpenses milestoneId={milestoneId} />
              </TabsContent>
              <TabsContent value="labor">
                <MyProjectLaborExpenses milestoneId={milestoneId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
  )
}
