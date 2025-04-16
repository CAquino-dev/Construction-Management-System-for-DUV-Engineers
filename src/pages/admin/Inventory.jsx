import React from 'react'
import { InventoryTable } from '../../components/adminComponents/InventoryTable'

export const Inventory = () => {
  return (
    <div className="container mx-auto p-6 mt-10">
        <div className="bg-white shadow-md rounded-lg p-4">
            <InventoryTable/>
        </div>
    </div>
  )
}
