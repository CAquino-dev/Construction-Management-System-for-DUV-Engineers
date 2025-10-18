import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Homepage from "./pages/userPages/Homepage";
import Login from "./pages/userPages/Login";
import Register from "./pages/userPages/Register";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import { UserManagement } from "./pages/admin/UserManagement";
import { OurTeam } from "./pages/userPages/OurTeam";
import { AboutUs } from "./pages/userPages/AboutUs";
import { ReportProblem } from "./pages/userPages/ReportProblem";
import { HR } from "./pages/admin/HR";
import { Projects } from "./pages/admin/Projects";
import { EmployeeManagement } from "./pages/admin/EmployeeManagement";
import { PermissionsProvider } from "./context/PermissionsContext";
import { EmployeeAttendance } from "./pages/admin/EmployeeAttendance";
import { EmployeePayroll } from "./pages/admin/EmployeePayroll";
import { Finance } from "./pages/admin/Finance";
import { Payslip } from "./pages/admin/Payslip";
import { Inventory } from "./pages/admin/Inventory";
import { ClientFeedback } from "./pages/admin/ClientFeedback";
import { ReportedIssues } from "./pages/admin/ReportedIssues";
import { ClientDashboard } from "./pages/userPages/ClientDashboard";
import { ClientLayout } from "./layouts/ClientLayout";
import { CeoDashboard } from "./pages/admin/CeoDashboard";
import { ApprovedPayrollOfCeo } from "./pages/admin/ApprovedPayrollOfCeo";
import { ProjectsClient } from "./pages/userPages/ProjectsClient";
import { ChatBot } from "./pages/userPages/ChatBot";
import { Messages } from "./pages/userPages/Messages";
import { MyProject } from "./pages/admin/MyProject";
import { Attendance } from "./pages/admin/AttendanceMonitoring";
import { SendFeedback } from "./pages/userPages/SendFeedback";
import { LoadingSpinner } from "./components/userComponents/LoadingSpinner";
import { FinanceBudgetSupplyRequest } from "./pages/admin/FinanceBudgetSupplyRequest";
import FinancePayment from './pages/admin/FinancePayment';
import { AppointmentRequestPage } from "./pages/userPages/AppointmentRequestPage";
import Appointment from "./pages/admin/Appointment";
import { AddClient } from "./pages/admin/AddClient";
import LeadManagement from "./pages/admin/LeadManagement";
import FinanceContracts from "./pages/admin/FinanceContracts";
import Proposal from "./pages/admin/Proposal";
import ProposalRespond from "./pages/userPages/ProposalRespond";
import ContractRespond from "./pages/userPages/ContractRespond";
import ApprovedContracts from "./pages/admin/ApprovedContracts";
import CreateProjectPage from "./pages/admin/CreateProjectPage";
import { MyProjectTaskBreakdown } from "./pages/admin/MyProjectTaskBreakdown";
import { AttendancePage } from "./pages/admin/AttendancePage";
import EmployeeProfile from "./pages/admin/EmployeeProfile";
import PaymentPage from "./pages/admin/PaymentPage";
import RequestPage from "./pages/admin/RequestPage";
import SalaryReleaseInPerson from "./pages/admin/SalaryReleaseInPerson";
import SiteVisit from "./pages/admin/SiteVisit";
import ProcurementPage from "./pages/admin/ProcurementPage";
import SupplierManagement from "./pages/admin/SupplierManagement";
import SupplierQuotePage from "./pages/userPages/SupplierQuotePage";
import ProcurementReviewDashboard from "./pages/admin/ProcurementReviewDashboard";
import PurchaseOrderList from "./pages/admin/PurchaseOrderList";
import { ClientPayment } from "./pages/admin/ClientPayment";

const App = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading, like fetching data or waiting for a condition
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Hide spinner after 3 seconds or once data is loaded
    }, 3000);
  }, []);

  return (
    <div>
      <Router>
        {loading && <LoadingSpinner />}{" "}
        {/* Show loading spinner while loading */}
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Homepage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="our-team" element={<OurTeam />} />
            <Route path="aboutus" element={<AboutUs />} />
            <Route path="report-problem" element={<ReportProblem />} />
            <Route path="chatbot" element={<ChatBot />} />
            <Route path="appointment" element={<AppointmentRequestPage />} />
            <Route path="send-feedback" element={<SendFeedback />} />
            <Route
              path="proposal/respond/:token"
              element={<ProposalRespond />}
            />
            <Route
              path="contract/respond/:proposalId"
              element={<ContractRespond />}
            />
            <Route
              path="supplier/quote/:token"
              element={<SupplierQuotePage />}
            />
          </Route>

          {/*Client Logged in Route*/}
          <Route path="/clientDashboard" element={<ClientLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="projects-client" element={<ProjectsClient />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />

          <Route path="/admin-dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="hr/employees" element={<HR />} />
            <Route path="hr/attendance" element={<EmployeeAttendance />} />
            <Route path="hr/payroll" element={<EmployeePayroll />} />
            <Route path="hr/payslip" element={<Payslip />} />
            <Route
              path="finance/approved-payroll-from-hr"
              element={<Finance />}
            />
            <Route
              path="finance/salaryRelease"
              element={<SalaryReleaseInPerson />}
            />
            <Route
              path="finance/view-contracts"
              element={<FinanceContracts />}
            />
            <Route
              path="finance/approved-payroll-from-ceo"
              element={<ApprovedPayrollOfCeo />}
            />
            <Route
              path="finance/budget-supply-request"
              element={<FinanceBudgetSupplyRequest />}
            />
            <Route path="projects" element={<Projects />} />
            <Route path="engineer/my-project" element={<MyProject />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="inventory" element={<Inventory />} />
            <Route
              path="feedbacks/client-feedback"
              element={<ClientFeedback />}
            />
            <Route
              path="feedbacks/reported-issues"
              element={<ReportedIssues />}
            />
            <Route path="ceo-dashboard" element={<CeoDashboard />} />
            <Route path="AttendanceMonitoring" element={<Attendance />} />
            <Route path="finance/financePayment" element={<FinancePayment />} />
            <Route path="finance/clientPayment" element={<ClientPayment />} />
            <Route path="appointment" element={<Appointment />} />
            <Route path="site-manager/add-client" element={<AddClient />} />
            <Route path="sales/lead" element={<LeadManagement />} />
            <Route path="site-manager/proposal" element={<Proposal />} />
            <Route path="foreman/attendance" element={<AttendancePage />} />
            <Route
              path="project-manager/approved-contracts"
              element={<ApprovedContracts />}
            />
            <Route
              path="project/create/:contractId"
              element={<CreateProjectPage />}
            />
            <Route
              path="project/siteVisit"
              element={<SiteVisit />}
            />            
            <Route
              path="project/:id/milestone/:milestoneId/tasks"
              element={<MyProjectTaskBreakdown />}
            />
            <Route
              path="/admin-dashboard/profile"
              element={<EmployeeProfile />}
            />
            <Route
              path="ItemRequest"
              element={<RequestPage />}
            />
            <Route path="payment/:paymentId" element={<PaymentPage />} />
            <Route path="procurement/procurement-page" element={<ProcurementPage />} />
            <Route path="procurement/supplier-management" element={<SupplierManagement />} />
            <Route path="procurement/procurement-dashboard" element={<ProcurementReviewDashboard />} />
            <Route path="procurement/purchase-orders" element={<PurchaseOrderList />} />
          </Route>
        </Routes>
      </Router>

      <Toaster richColors position="top-right" />
    </div>
  );
};

const AppWrapper = () => (
  <PermissionsProvider>
    <App />
  </PermissionsProvider>
);

export default AppWrapper;
