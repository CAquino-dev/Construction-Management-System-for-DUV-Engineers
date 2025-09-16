import React from "react";
import { FinanceTable } from "../../components/adminComponents/Finance/FinanceTable";

export const Finance = () => {
  return (
    <div className="container mx-auto bg-white shadow-md rounded-lg overflow-visible relative">
      <FinanceTable />
    </div>
  );
};
