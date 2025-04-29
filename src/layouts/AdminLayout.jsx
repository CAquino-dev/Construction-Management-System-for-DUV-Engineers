import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/adminComponents/AdminNavbar'

const AdminLayout = () => {
  return (
    <>
    <div className="flex min-h-screen">
      <AdminNavbar className="" />

      
    </div>
    </>
  )
}

export default AdminLayout
