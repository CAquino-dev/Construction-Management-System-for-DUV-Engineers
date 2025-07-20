import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/adminComponents/AdminNavbar'

const AdminLayout = () => {
  return (
    <div className="h-screen flex">
      {/* Sidebar and Topbar are inside AdminNavbar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 pt-16">
        {/* pt-16 matches the height of your fixed top nav (p-4 = 64px) */}
        {/* lg:ml-64 matches the sidebar width so content isn't hidden behind it */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
