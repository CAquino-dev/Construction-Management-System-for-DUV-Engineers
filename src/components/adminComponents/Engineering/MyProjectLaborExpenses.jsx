import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { MyProjectAddExpenses } from "./MyProjectAddExpenses";
import { X } from "@phosphor-icons/react";
import { toast } from "sonner";

export const MyProjectLaborExpenses = ({ milestoneId }) => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch labor expenses for milestoneId
  useEffect(() => {
    if (!milestoneId) return;
    fetch(
      `${
        import.meta.env.VITE_REACT_APP_API_URL
      }/api/project/project/expenses?milestone_id=${milestoneId}&type=Labor`
    )
      .then((res) => res.json())
      .then((data) => setExpenses(data.expenses || []))
      .catch(console.error);
  }, [milestoneId]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Add expense to backend and refresh list
  const handleAddExpense = async (newExpense) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/expenses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestone_id: milestoneId,
            expense_type: "Labor",
            date: new Date().toISOString(),
            date_from: newExpense.date_from,
            date_to: newExpense.date_to,
            title: newExpense.title,
            amount: newExpense.amount,
            status: "Requested",
          }),
        }
      );
      if (res.ok) {
        // Refresh expenses list
        const data = await res.json();
        // Option 1: Re-fetch from backend
        const refreshed = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/project/project/expenses?milestone_id=${milestoneId}&type=Labor`
        ).then((r) => r.json());
        setExpenses(refreshed.expenses || []);
        setIsModalOpen(false);
      } else {
        toast.error("Failed to add expense");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding expense");
    }
  };

  // Calculate total
  const totalAmount = expenses.reduce((total, exp) => total + exp.amount, 0);

  return (
    <div>
      <div className="flex justify-end mb-4">
        {milestoneId ? (
          <button
            className="px-4 py-2 bg-[#3b5d47] text-white rounded cursor-pointer"
            onClick={handleOpenModal}
          >
            Add Expense
          </button>
        ) : null}
      </div>

      {isModalOpen && (
        <MyProjectAddExpenses
          closeModal={handleCloseModal}
          handleAddExpense={handleAddExpense}
        />
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
            <TableRow key={expense.expense_id}>
              <TableCell className="text-center">{expense.date_from}</TableCell>
              <TableCell className="text-center">{expense.date_to}</TableCell>
              <TableCell className="text-center">
                {expense.description}
              </TableCell>
              <TableCell className="text-center">₱{expense.amount}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan="3" className="text-right">
              <strong>Total:</strong>
            </TableCell>
            <TableCell className="text-center">
              <strong>₱{totalAmount}</strong>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
