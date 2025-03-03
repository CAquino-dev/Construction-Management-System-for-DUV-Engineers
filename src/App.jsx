import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Homepage from './pages/userPages/Homepage'
import Login from './pages/userPages/Login'
import Register from './pages/userPages/Register'
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* User Routes */} 
          <Route path='/' element={<UserLayout/>}>
            <Route index element={<Homepage/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/register' element={<Register/>}></Route>
          </Route>

          {/* Admin Routes */}
          <Route path='/admin' element={<AdminLogin/>}></Route>
            <Route path='/admin-dashboard' element={<AdminLayout/>} >
            <Route index element={<AdminDashboard/>} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App