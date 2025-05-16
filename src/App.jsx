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
import { ReportProblem } from './pages/userPages/ReportProblem';
import {HR} from './pages/admin/HR'
import {Projects} from './pages/admin/Projects'
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { PermissionsProvider } from './context/PermissionsContext';
import { EmployeeAttendance } from './pages/admin/EmployeeAttendance';
import { EmployeePayroll } from './pages/admin/EmployeePayroll';
import { Finance } from './pages/admin/Finance';
import { Payslip } from './pages/admin/Payslip';
import { Inventory } from './pages/admin/Inventory';
import { ClientFeedback } from './pages/admin/ClientFeedback';
import { ReportedIssues } from './pages/admin/ReportedIssues';
import { ClientDashboard } from './pages/userPages/ClientDashboard';
import { ClientLayout } from './layouts/ClientLayout';
import { CeoDashboard } from './pages/admin/CeoDashboard';
import { ApprovedPayrollOfCeo } from './pages/admin/ApprovedPayrollOfCeo';
import { ProjectsClient } from './pages/userPages/ProjectsClient';
import { ChatBot } from './pages/userPages/ChatBot';
import { Messages } from './pages/userPages/Messages';
import { MyProject } from './pages/admin/MyProject';
import { Attendance } from './pages/admin/AttendanceMonitoring';
import { SendFeedback } from './pages/userPages/SendFeedback';
import { LoadingSpinner } from './components/userComponents/LoadingSpinner';
import { FinanceBudgetSupplyRequest } from './pages/admin/FinanceBudgetSupplyRequest';
import { FinancePayment } from './pages/admin/FinancePayment';

const App = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading, like fetching data or waiting for a condition
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Hide spinner after 3 seconds or once data is loaded
    }, 3000);
  }, []);

  return (
    <Router>
      {loading && <LoadingSpinner />} {/* Show loading spinner while loading */}
      <Routes>
        {/* User Routes */} 
        <Route path='/' element={<UserLayout/>}>
          <Route index element={<Homepage/>} />
          <Route path='login' element={<Login/>} />
          <Route path='register' element={<Register/>} />
          <Route path='our-team' element={<OurTeam/>} />
          <Route path='aboutus' element={<AboutUs/>} />
          <Route path='report-problem' element={<ReportProblem/>} />
          <Route path='chatbot' element={<ChatBot/>} />
          <Route path='send-feedback' element={<SendFeedback/>} />
        </Route>

        {/*Client Logged in Route*/}
        <Route path='/clientDashboard' element={<ClientLayout/>}>
          <Route index element={<ClientDashboard/>} />  
          <Route path='projects-client' element={<ProjectsClient/>} />
          <Route path='messages' element={<Messages/>} />
        </Route>

        {/* Admin Routes */}
        <Route path='/admin' element={<AdminLogin/>} />

        <Route path='/admin-dashboard' element={<AdminLayout/>}>
          <Route index element={<AdminDashboard/>} /> 
          <Route path='user-management' element={<UserManagement/>} />
          <Route path='hr/employees' element={<HR/>} />
          <Route path='hr/attendance' element={<EmployeeAttendance/>} />
          <Route path='hr/payroll' element={<EmployeePayroll/>} />
          <Route path='hr/payslip' element={<Payslip/>} />
          <Route path='finance/approved-payroll-from-hr' element={<Finance/>} />
          <Route path='finance/approved-payroll-from-ceo' element={<ApprovedPayrollOfCeo/>} />
          <Route path='finance/budget-supply-request' element={<FinanceBudgetSupplyRequest/>} />
          <Route path='site-manager/projects' element={<Projects/>} />
          <Route path='engineer/my-project' element={<MyProject/>} />
          <Route path='employees' element={<EmployeeManagement/>} />
          <Route path='inventory' element={<Inventory/>} />
          <Route path='feedbacks/client-feedback' element={<ClientFeedback/>} />
          <Route path='feedbacks/reported-issues' element={<ReportedIssues/>} />
          <Route path='ceo-dashboard' element={<CeoDashboard/>} />
          <Route path='AttendanceMonitoring' element={<Attendance/>} />
          <Route path='finance/financePayment' element={<FinancePayment/>} />
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