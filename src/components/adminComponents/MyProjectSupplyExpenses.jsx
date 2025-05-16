import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { X } from "@phosphor-icons/react";
import { MyProjectAddSupplyExpenses } from './MyProjectAddSupplyExpenses';

const initialProjectExpenses = [
  { id: 1, date: "2023-09-01", title: "Concrete Nails", quantity: 100, unit: "pcs", pricePerQty: 10, amount: 1000 },
  { id: 2, date: "2023-09-02", title: "Cement", quantity: 50, unit: "bags", pricePerQty: 100, amount: 5000 },
  { id: 3, date: "2023-09-03", title: "Pako", quantity: 86, unit: "day", pricePerQty: 20, amount: 2000 },
];

export const MyProjectSupplyExpenses = () => {
  const [expenses, setExpenses] = useState(initialProjectExpenses);
  const [totalAmount, setTotalAmount] = useState(initialProjectExpenses.reduce((total, expense) => total + expense.amount, 0));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    setTotalAmount(updatedExpenses.reduce((total, expense) => total + expense.amount, 0));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer" onClick={handleOpenModal}>
          Add Expenses
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Project Expense</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-black">
                <X size={24} />
              </button>
            </div>
            <MyProjectAddSupplyExpenses closeModal={handleCloseModal} handleAddExpense={handleAddExpense} />
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Product Name</TableHead>
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
  );
};
