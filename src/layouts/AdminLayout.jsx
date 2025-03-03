import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/adminComponents/AdminNavbar'

const AdminLayout = () => {
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  )
}

export default AdminLayout
