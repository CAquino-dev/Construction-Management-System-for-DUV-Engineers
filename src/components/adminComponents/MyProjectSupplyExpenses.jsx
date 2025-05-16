import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { X } from "@phosphor-icons/react";
import { MyProjectAddSupplyExpenses } from './MyProjectAddSupplyExpenses';

export const MyProjectSupplyExpenses = ({ milestoneId }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch supply expenses when component mounts or milestoneId changes
  useEffect(() => {
    if (!milestoneId) return;

    const fetchExpenses = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/project/project/expenses?milestone_id=${milestoneId}&type=Supply`);
        if (!res.ok) throw new Error('Failed to fetch supply expenses');
        const data = await res.json();

        setExpenses(data.expenses || []);
        const total = (data.expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
        setTotalAmount(total);
      } catch (error) {
        console.error(error);
        setExpenses([]);
        setTotalAmount(0);
      }
    };

    fetchExpenses();
  }, [milestoneId]);

  // Open / close modal handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Add new expense to state and update total
  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    setTotalAmount(updatedExpenses.reduce((total, expense) => total + expense.amount, 0));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer"
          onClick={handleOpenModal}
        >
          Request Budget
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
            <MyProjectAddSupplyExpenses
              closeModal={handleCloseModal}
              handleAddExpense={handleAddExpense}
              milestoneId={milestoneId}
            />
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
            <TableRow key={expense.expense_id || expense.id}>
              <TableCell className="text-center">{expense.date}</TableCell>
              <TableCell className="text-center">{expense.title || expense.description}</TableCell>
              <TableCell className="text-center">{expense.quantity}</TableCell>
              <TableCell className="text-center">{expense.unit}</TableCell>
              <TableCell className="text-center">₱{expense.price_per_qty}</TableCell>
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
