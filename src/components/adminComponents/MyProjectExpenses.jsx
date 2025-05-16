import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"; // Assuming you're using shadcn UI library
import { MyProjectSupplyExpenses } from './MyProjectSupplyExpenses';
import { MyProjectLaborExpenses } from './MyProjectLaborExpenses';

export const MyProjectExpenses = ({milestoneId}) => {
  const [activeTab, setActiveTab] = useState('supply'); // Track the active tab
  
  return (
    <div className='flex flex-col space-y-4 mt-4'>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex space-x-4 border-b">
          <TabsTrigger value="supply" className="cursor-pointer">Supply Expenses</TabsTrigger>
          <TabsTrigger value="labor" className="cursor-pointer">Labor Expenses</TabsTrigger>
        </TabsList>
        
        {/* Tab Contents */}
        <TabsContent value="supply">
          <div>
            <MyProjectSupplyExpenses milestoneId={milestoneId}/>
          </div>
        </TabsContent>
        <TabsContent value="labor">
          <div>
            <MyProjectLaborExpenses milestoneId={milestoneId}/>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
