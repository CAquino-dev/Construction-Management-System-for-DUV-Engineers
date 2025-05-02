import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/adminComponents/AdminNavbar'

const AdminLayout = () => {
  return (
    <>
    <div className="flex min-h-screen">
      <AdminNavbar className="" />

      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Outlet />  
      </div>
    </div>
    </>
  )
}

export default AdminLayout