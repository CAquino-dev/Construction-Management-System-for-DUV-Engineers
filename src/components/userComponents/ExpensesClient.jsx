import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"; 
import { SupplyExpenses } from './SupplyExpenses';
import { LaborExpenses } from './LaborExpenses';

export const ExpensesClient = () => {
  const [activeTab, setActiveTab] = React.useState('supply'); // Track the active tab
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex space-x-4 border-b">
          <TabsTrigger value="supply" className="cursor-pointer">Supply Expenses</TabsTrigger>
          <TabsTrigger value="labor" className="cursor-pointer">Labor Expenses</TabsTrigger>
        </TabsList>
        
        {/* Tab Contents */}
        <TabsContent value="supply">
          <div>
            <SupplyExpenses />
          </div>
        </TabsContent>
        <TabsContent value="labor">
          <div>
            <LaborExpenses />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
