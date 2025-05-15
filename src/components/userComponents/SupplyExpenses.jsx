import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { X } from "@phosphor-icons/react";

const initialProjectExpenses = [
  {
    id: 1,
    date: "2023-09-01",
    title: "Concrete Nails",
    quantity: 100,
    unit: "pcs",
    pricePerQty: 10,
    amount: 1000,
    type: "purchase",
  },
  {
    id: 2,
    date: "2023-09-02",
    title: "Cement",
    quantity: 50,
    unit: "bags",
    pricePerQty: 100,
    amount: 5000,
    type: "purchase",
  },
  {
    id: 3,
    date: "2023-09-03",
    title: "1st week Salary of Construction Workers",
    quantity: 86,
    unit: "day",
    pricePerQty: 20,
    amount: 2000,
    type: "labor",
  },
];

export const SupplyExpenses = () => {
    const [expenses, setExpenses] = React.useState(initialProjectExpenses); // State to store expenses
    const [totalAmount, setTotalAmount] = React.useState(initialProjectExpenses.reduce((total, expense) => total + expense.amount, 0));


  return (
    <div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Title</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center">Price per Qty</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {expenses.map(expense => (
                <TableRow key={expense.id}>
                    <TableCell className="text-center">{expense.date}</TableCell>
                    <TableCell className="text-center">{expense.title}</TableCell>
                    <TableCell className="text-center">{expense.quantity}</TableCell>
                    <TableCell className="text-center">{expense.unit}</TableCell>
                    <TableCell className="text-center">₱{expense.pricePerQty}</TableCell>
                    <TableCell className="text-center">₱{expense.amount}</TableCell>
                </TableRow>
                ))}
                <TableRow>
                    <TableCell colSpan="5" className="text-right"><strong>Total</strong></TableCell>
                    <TableCell className="text-center"><strong>₱{totalAmount}</strong></TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
  )
}
