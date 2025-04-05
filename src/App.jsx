import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/userPages/Homepage';
import Login from './pages/userPages/Login';
import Register from './pages/userPages/Register';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import { UserManagement } from './pages/admin/UserManagement';
import {OurTeam} from './pages/userPages/OurTeam';
import {AboutUs} from './pages/userPages/AboutUs';
import {HR} from './pages/admin/HR'
import {Projects} from './pages/admin/Projects'
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { PermissionsProvider } from './context/PermissionsContext';

const App = () => {
  return (
      <Router>
        <Routes>
          {/* User Routes */} 
          <Route path='/' element={<UserLayout/>}>
            <Route index element={<Homepage/>} />
            <Route path='login' element={<Login/>} />
            <Route path='register' element={<Register/>} />
            <Route path='our-team' element={<OurTeam/>} />
            <Route path='aboutus' element={<AboutUs/>} />
          </Route>

          {/* Admin Routes */}
          <Route path='/admin' element={<AdminLogin/>} />

          <Route path='/admin-dashboard' element={<AdminLayout/>}>
            <Route index element={<AdminDashboard/>} /> 
            <Route path='user-management' element={<UserManagement/>} />
            <Route path='hr' element={<HR/>} />
            <Route path='projects' element={<Projects/>} />
            <Route path='employees' element={<EmployeeManagement/>} />
        </Route>
        </Routes>
      </Router>
  );
};

const AppWrapper = () => (
  <PermissionsProvider>
    <App />
  </PermissionsProvider>
);

export default AppWrapper;
