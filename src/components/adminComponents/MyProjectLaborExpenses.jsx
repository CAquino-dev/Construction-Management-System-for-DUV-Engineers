import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { MyProjectAddExpenses } from './MyProjectAddExpenses';
import { X } from "@phosphor-icons/react";

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

export const MyProjectLaborExpenses = () => {
  const [expenses, setExpenses] = useState(initialProjectLaborExpenses); // State to store expenses
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const handleOpenModal = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses); // Update expenses list
  };

  // Calculate total amount based on the expenses state
  const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button 
          className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer" 
          onClick={handleOpenModal}
        >
          Add Expenses
        </button>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Project Expense</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-black">
                <X size={24} /> {/* X icon */}
              </button>
            </div>
            <MyProjectAddExpenses closeModal={handleCloseModal} handleAddExpense={handleAddExpense} />
          </div>
        </div>
      )}

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
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="text-center">{expense.date_from}</TableCell>
              <TableCell className="text-center">{expense.date_to}</TableCell>
              <TableCell className="text-center">{expense.title}</TableCell>
              <TableCell className="text-center">₱{expense.amount}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan="3" className="text-right"><strong>Total:</strong></TableCell>
            <TableCell className="text-center"><strong>₱{totalAmount}</strong></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
