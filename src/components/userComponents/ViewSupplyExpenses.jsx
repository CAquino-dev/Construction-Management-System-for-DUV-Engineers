import React, { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"

export const ViewSupplyExpenses = ({ selectedProject, milestoneName, onClose }) => {
  const [supplyExpenses, setSupplyExpenses] = useState([])
  const [laborExpenses, setLaborExpenses] = useState([])
  const [activeTab, setActiveTab] = useState("supply")

  useEffect(() => {
    if (!selectedProject?.id) return

    // Fetch supply expenses
    const fetchSupplyExpenses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/project/expenses?milestone_id=${selectedProject.id}&type=Supply`)
        if (!res.ok) throw new Error('Failed to fetch supply expenses')
        const data = await res.json()
        setSupplyExpenses(data.expenses || [])
      } catch (error) {
        console.error(error)
        setSupplyExpenses([])
      }
    }

    // Fetch labor expenses
    const fetchLaborExpenses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/project/expenses?milestone_id=${selectedProject.id}&type=Labor`)
        if (!res.ok) throw new Error('Failed to fetch labor expenses')
        const data = await res.json()
        setLaborExpenses(data.expenses || [])
      } catch (error) {
        console.error(error)
        setLaborExpenses([])
      }
    }

    fetchSupplyExpenses()
    fetchLaborExpenses()
  }, [selectedProject])

  // Totals
  const supplyTotal = supplyExpenses.reduce((total, item) => total + Number(item.amount), 0)
  const laborTotal = laborExpenses.reduce((total, item) => total + Number(item.amount), 0)

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const d = new Date(dateString)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] h-[600px] overflow-hidden flex flex-col relative">

        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-4">{milestoneName} Expenses</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="flex space-x-4 border-b mb-4">
            <TabsTrigger value="supply" className="cursor-pointer">
              Supply Expenses
            </TabsTrigger>
            <TabsTrigger value="labor" className="cursor-pointer">
              Labor Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supply" className="flex-grow overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                  <TableHead className="text-center">Price per Qty</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplyExpenses.map(item => (
                  <TableRow key={item.expense_id}>
                    <TableCell className="text-center">{formatDate(item.date)}</TableCell>
                    <TableCell className="text-center">{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.unit}</TableCell>
                    <TableCell className="text-center">₱{Number(item.price_per_qty).toFixed(2)}</TableCell>
                    <TableCell className="text-center">₱{Number(item.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right"><strong>Total</strong></TableCell>
                  <TableCell className="text-center"><strong>₱{supplyTotal.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="labor" className="flex-grow overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date From</TableHead>
                  <TableHead className="text-center">Date To</TableHead>
                  <TableHead className="text-center">Title</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborExpenses.map(item => (
                  <TableRow key={item.expense_id}>
                    <TableCell className="text-center">{formatDate(item.date_from)}</TableCell>
                    <TableCell className="text-center">{formatDate(item.date_to)}</TableCell>
                    <TableCell className="text-center">{item.description || item.title}</TableCell>
                    <TableCell className="text-center">₱{Number(item.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right"><strong>Total:</strong></TableCell>
                  <TableCell className="text-center"><strong>₱{laborTotal.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
