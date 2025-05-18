import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"
import { Eye } from "@phosphor-icons/react"
import { ViewSupplyExpenses } from "./ViewSupplyExpenses"

const initialProjectExpenses = [
  {
    id: 1,
    milestone: "milestone 1",
    expense:[
      {
        id: 1,
        date: "2025-07-01",
        product_name: "product 1",
        quantity: "10",
        unit: "pcs",
        pricePerQty: "100",
        amount: "1000",
      },
      {
        id: 2,
        date: "2025-07-02",
        product_name: "product 2",
        quantity: "20",
        unit: "pcs",
        pricePerQty: "200",
        amount: "4000",
      }
    ],
    amount: 5000,
  },
  {
    id: 2,
    milestone: "milestone 2",
    expense:[
      {
        id: 3,
        date: "2025-07-03",
        product_name: "product 3",
        quantity: "30",
        unit: "pcs",
        pricePerQty: "300",
        amount: "9000",
      }
    ],
    amount: 9000,
  },
]

export const SupplyExpenses = () => {
  const [expenses, setExpenses] = React.useState(initialProjectExpenses)
  const [totalAmount, setTotalAmount] = React.useState(
    initialProjectExpenses.reduce((total, e) => total + Number(e.amount), 0)
  )

  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [selectedExpenseData, setSelectedExpenseData] = React.useState([])
  const [selectedMilestoneName, setSelectedMilestoneName] = React.useState("")

  const openViewModal = (expenseList, milestoneName) => {
    setSelectedExpenseData(expenseList)
    setSelectedMilestoneName(milestoneName)
    setViewModalOpen(true)
  }

  const closeViewModal = () => {
    setViewModalOpen(false)
    setSelectedExpenseData([])
    setSelectedMilestoneName("")
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Milestone</TableHead>
            <TableHead className="text-center">Total Amount</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map(expense => (
            <TableRow key={expense.id}>
              <TableCell className="text-center">{expense.milestone}</TableCell>
              <TableCell className="text-center">₱{expense.amount}</TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => openViewModal(expense.expense, expense.milestone)}
                  className="text-white bg-[#4c735c] p-1 rounded-md hover:bg-[#3b5d47] cursor-pointer"
                >
                  <Eye size={18} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Modal */}
      {viewModalOpen && (
        <ViewSupplyExpenses
          onClose={closeViewModal}
        />
      )}
    </div>
  )
}
