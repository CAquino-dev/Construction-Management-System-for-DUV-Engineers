import React from 'react'
import { FinanceTable } from '../../components/adminComponents/FinanceTable'

export const Finance = () => {
  return (
    <div className='container mx-auto mt-15 bg-white shadow-md rounded-lg'>
      <h1 className='text-2xl font-bold text-center py-4'>HR Payroll (Approved Records)</h1>
        <FinanceTable/>
    </div>
  )
}
