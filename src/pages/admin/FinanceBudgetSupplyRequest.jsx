import React from 'react'
import { FinanceBudgetSupplyRequestTable } from '../../components/adminComponents/Finance/FinanceBudgetSupplyRequestTable' 

export const FinanceBudgetSupplyRequest = () => {
  return (
    <div className="container mx-auto p-6 mt-10">
        <div className="bg-white shadow-md rounded-lg p-4">
            <FinanceBudgetSupplyRequestTable />
        </div>
    </div>
  )
}
