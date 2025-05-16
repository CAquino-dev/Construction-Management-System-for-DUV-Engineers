import React, { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const initialProjectLaborExpenses = [
  {
    id: 1,
    date_from: "2023-09-01",
    date_to: "2023-09-02",
    title: "1st week Salary of Construction Workers",
    amount: 1400,
  },
  {
    id: 2,
    date_from: "2023-09-03",
    date_to: "2023-09-04",
    title: "2nd week Salary of Construction Workers",
    amount: 1400,
  },
  {
    id: 3,
    date_from: "2023-09-05",
    date_to: "2023-09-06",
    title: "3rd week Salary of Construction Workers",
    amount: 1400,
  },
];

export const LaborExpenses = () => {
    const [expenses, setExpenses] = useState(initialProjectLaborExpenses); // State to store expenses
  return (
    <div>
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
                {expenses.map(expense => (
                <TableRow key={expense.id}>
                    <TableCell className="text-center">{expense.date_from}</TableCell>
                    <TableCell className="text-center">{expense.date_to}</TableCell>
                    <TableCell className="text-center">{expense.title}</TableCell>
                    <TableCell className="text-center">{expense.amount}</TableCell>
                </TableRow>
                ))}
                <TableRow>
                    <TableCell colSpan="3" className="text-right"><strong>Total</strong></TableCell>
                    <TableCell className="text-center">₱{expenses.reduce((total, expense) => total + expense.amount, 0)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
  )
}
