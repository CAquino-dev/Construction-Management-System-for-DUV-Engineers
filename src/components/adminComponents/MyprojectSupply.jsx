import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"; // Assuming you're using shadcn UI library
import { MyprojectSupplyTable } from './MyprojectSupplyTable';
import { MyProjectPendingSupplyTable } from './MyProjectPendingSupplyTable';
import { MyProjectApprovedSupplyTable } from './MyProjectApprovedSupplyTable';

export const MyprojectSupply = () => {
  const [activeTab, setActiveTab] = useState('all'); // Track which tab is active
  
  return (
    <div className='flex flex-col space-y-4 mt-4'>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex space-x-4 border-b">
          <TabsTrigger value="all" className="cursor-pointer">View All</TabsTrigger>
          <TabsTrigger value="pending" className="cursor-pointer">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="cursor-pointer">Approved</TabsTrigger>
        </TabsList>
        
        {/* Tab Contents */}
        <TabsContent value="all">
          <div>
            <MyprojectSupplyTable />
          </div>
        </TabsContent>
        <TabsContent value="pending">
          <div >
            <MyProjectPendingSupplyTable />
          </div>
        </TabsContent>
        <TabsContent value="approved">
          <div >
            <MyProjectApprovedSupplyTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
