import React, { useState } from 'react'
import { CeoTable } from '../../components/adminComponents/CeoTable'
import { ViewCeoPayslip } from '../../components/adminComponents/ViewCeoPayslip'

export const CeoDashboard = () => {
    const [selectedPayslips, setSelectedPayslips] = useState(null);
  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
        {selectedPayslips ? (
            <ViewCeoPayslip selectedPayslips={selectedPayslips} onBack={() => setSelectedPayslips(null)} />
        ) : (  
            <>
                <h1 className='text-2xl font-bold text-center py-4'>Payslips (Approved Records from finance)</h1>
                <CeoTable setSelectedPayslips={setSelectedPayslips} />
            </>
        )}
    </div>
  )
}
