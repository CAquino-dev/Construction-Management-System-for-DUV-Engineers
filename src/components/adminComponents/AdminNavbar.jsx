import React, { useState } from "react";
import { List,UserCircleCheck, X, UserCheck, Package, House, ListChecks, Bank, UsersThree, Calendar, SignOut, User, CaretDown, HardHat } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DUVLogoWhite from "../../assets/DUVLogoWhite.png";
import { usePermissions } from "../../context/PermissionsContext";

const AdminNavbar = ({ children }) => {

    const permissions = JSON.parse(localStorage.getItem('permissions')) || {}; // Default to an empty object if permissions don't exist
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isHrOpen, setIsHrOpen] = useState(false); // HR dropdown state
    const [isFinanceOpen, setIsFinanceOpen] = useState(false); // Finance dropdown state
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isEngineerOpen, setIsEngineerOpen] = useState(false); // Engineer dropdown state
    const toggleFeedbackDropdown = () => setIsFeedbackOpen(!isFeedbackOpen);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
    const toggleHrDropdown = () => setIsHrOpen(!isHrOpen);
    const toggleFinanceDropdown = () => setIsFinanceOpen(!isFinanceOpen);
    const toggleEngineerDropdown = () => setIsEngineerOpen(!isEngineerOpen);

    const menuItems = [
        { name: "Dashboard", icon: <House size={20} />, href: "/admin-dashboard" },
        { name: "Users", icon: <User size={20} />, href: "/admin-dashboard/user-management", permission: "can_access_user" },
        { name: "Employees", icon: <UserCheck size={20} />, href: "/admin-dashboard/employees", },
        { name: "Scheduler", icon: <Calendar size={20} />, href: "/admin-dashboard/scheduler" },
        { name: "Inventory", icon: <Package size={20} />, href: "/admin-dashboard/inventory" },
        { name: "CEO Dashboard", icon: <UserCircleCheck size={20} />, href: "/admin-dashboard/ceo-dashboard",},
        { name: "Attendance Monitoring", icon: <UserCircleCheck size={20} />, href: "/admin-dashboard/AttendanceMonitoring",},
    ];

    const currentPage = (() => {
        // HR Pages
        if (location.pathname.startsWith("/admin-dashboard/hr/attendance")) return "Attendance";
        if (location.pathname.startsWith("/admin-dashboard/hr/payroll")) return "Payroll";
        if (location.pathname.startsWith("/admin-dashboard/hr/employees")) return "Employee";
        if (location.pathname.startsWith("/admin-dashboard/hr/payslip")) return "Payslip";

        // Finance Pages
        if (location.pathname.startsWith("/admin-dashboard/finance/approved-payroll-from-hr")) return "HR Payroll (Approved Records of HR)";
        if (location.pathname.startsWith("/admin-dashboard/finance/approved-payroll-from-ceo")) return "HR Payroll (Approved Records of CEO)";
      
        // Other Admin Pages (Matches Against `menuItems`)
        const matchedPage = menuItems.find((item) => location.pathname === item.href)?.name;
        
        return matchedPage || "Dashboard"; // Default fallback remains "Dashboard"
      })();
      

    const handleLogout = () => {
      
        // Clear permissions from localStorage
        localStorage.removeItem('permissions');
      
        // Redirect to login page or home page
        navigate('/login');  // Example redirection
      };
      

    return (
        <div className="flex min-h-screen">

            {/* Top Navigation Bar */}
            <div className="fixed top-0 left-0 w-full bg-white p-4 flex justify-between items-center shadow-md z-40">
                <h1 className="text-lg font-bold text-gray-800 lg:ml-64 ml-10">{currentPage}</h1>

                {/* Profile Section */}
                <div className="relative hover:text-gray-400 cursor-pointer">
                <button className="flex items-center gap-2 cursor-pointer" onClick={toggleProfileDropdown}>
                    <div className="w-8 h-8 bg-black rounded-full"></div> {/* Profile Picture */}
                    <p className="text-sm font-semibold text-gray-800 hidden md:block">Christian Aquino</p>
                    <CaretDown size={18} className="text-gray-800" />
                </button>

                {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2">
                    <button className="block px-4 py-2 text-black hover:bg-[#3b5d47] w-full" >Logout</button>
                    </div>
                )}
                </div>
            </div>
            {/* Sidebar */}
            <div className="bg-[#3b5d47] h-screen lg:w-64 w-0 text-white fixed top-0 left-0 shadow-lg p-5 flex flex-col justify-between z-50 overflow-y-auto hidden lg:block">
                <div>
                    <div className="flex justify-center items-center mb-6">
                        <img src={DUVLogoWhite} alt="Logo" className="w-32 h-auto" />
                    </div>
                    <ul className="space-y-4">

                        {menuItems.filter(item => !item.permission || permissions?.[item.permission] === "Y")
                        .map((item, index) => (
                            <li key={index}>
                                <Link 
                                to={item.href} 
                                className={`flex items-center gap-3 p-3 rounded-lg font-semibold ${
                                    location.pathname === item.href ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        ))}

                        {/* Collapsible Engineering Section */}
                        <li>
                            <button onClick={toggleEngineerDropdown} className="w-full flex items-center justify-between p-3 hover:bg-[#5A8366] rounded-lg">
                                <span className="flex items-center gap-3 font-semibold"> 
                                    <HardHat size={20} /> Engineer
                                </span>
                                <CaretDown size={20} className={`transform transition-all ${isEngineerOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isEngineerOpen && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                        <Link 
                                            to="/admin-dashboard/engineer/projects" 
                                            className={`block p-2 rounded-lg ${
                                                location.pathname === "/admin-dashboard/engineer/projects" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                            }`}>
                                            Projects
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/admin-dashboard/engineer/my-project"
                                            className={`block p-2 rounded-lg ${
                                                location.pathname === "/admin-dashboard/engineer/my-project" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                            }`}>
                                            My Project
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                        {/* Collapsible Finance Section */}
                        <li>
                            { permissions.can_access_finance === 'Y' && <button onClick={toggleFinanceDropdown} className="w-full flex items-center justify-between p-3 hover:bg-[#5A8366] rounded-lg">
                                <span className="flex items-center gap-3 font-semibold"> 
                                    <Bank size={20} /> Finance
                                </span>
                                <CaretDown size={20} className={`transform transition-all ${isFinanceOpen ? "rotate-180" : ""}`} />
                            </button>}
                            {isFinanceOpen && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                        <Link 
                                            to="/admin-dashboard/finance/approved-payroll-from-hr" 
                                            className={`block p-2 rounded-lg ${
                                                location.pathname === "/admin-dashboard/finance/approved-payroll-from-hr" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                            }`}>
                                            HR Payroll (Approved Records of HR) 
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin-dashboard/finance/approved-payroll-from-ceo" 
                                            className={`block p-2 rounded-lg ${
                                                location.pathname === "/admin-dashboard/finance/approved-payroll-from-ceo" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                            }`}>
                                            HR Payroll (Approved Records of CEO) 
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                        {/* Collapsible HR Section */}
                        <li>
                            { permissions.can_access_hr === 'Y' && <button onClick={toggleHrDropdown} className="w-full flex items-center justify-between p-3 hover:bg-[#5A8366] rounded-lg">
                                <span className="flex items-center gap-3 font-semibold">
                                    <UsersThree size={20} /> Human Resources
                                </span>
                                <CaretDown size={20} className={`transform transition-all ${isHrOpen ? "rotate-180" : ""}`} />
                            </button>}
                            {isHrOpen && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                    <Link 
                                    to="/admin-dashboard/hr/attendance" 
                                    className={`block p-2 rounded-lg ${
                                        location.pathname === "/admin-dashboard/hr/attendance" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                    }`}
                                    >
                                    Attendance
                                    </Link>
                                    </li>
                                    <li>
                                    <Link 
                                    to="/admin-dashboard/hr/payroll" 
                                    className={`block p-2 rounded-lg ${
                                        location.pathname === "/admin-dashboard/hr/payroll" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                    }`}
                                    >
                                    Payroll
                                    </Link>
                                    </li>
                                    <li>
                                    <Link 
                                    to="/admin-dashboard/hr/payslip" 
                                    className={`block p-2 rounded-lg ${
                                        location.pathname === "/admin-dashboard/hr/payslip" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                    }`}
                                    >
                                    Payslip
                                    </Link>
                                    </li>
                                    <li>
                                    <Link 
                                    to="/admin-dashboard/hr/employees" 
                                    className={`block p-2 rounded-lg ${
                                        location.pathname === "/admin-dashboard/hr/employees" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                    }`}
                                    >
                                    Employee
                                    </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                        {/* Feedback Dropdown */}
                        <li>
                            <button onClick={toggleFeedbackDropdown} className="w-full flex items-center justify-between p-3 hover:bg-[#5A8366] rounded-lg">
                                <span className="flex items-center gap-3 font-semibold">
                                    <ListChecks size={20} /> Feedbacks
                                </span>
                                <CaretDown size={20} className={`transform transition-all ${isFeedbackOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isFeedbackOpen && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                        <Link 
                                            to="/admin-dashboard/feedbacks/client-feedback" 
                                            className={`block p-2 rounded-lg ${
                                                location.pathname === "/admin-dashboard/feedbacks/client-feedback" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                            }`}>
                                            Client Feedback
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin-dashboard/feedbacks/reported-issues" 
                                            className={`block p-2 rounded-lg ${
                                                location.pathname === "/admin-dashboard/feedbacks/reported-issues" ? "bg-[#5A8366] text-white" : "hover:bg-[#5A8366]"
                                            }`}>
                                            Reported Issues
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>
                <div>
                    <button className="flex items-center gap-3 p-3 hover:bg-[#5A8366] rounded-lg w-full" onClick={handleLogout}>
                        <SignOut size={22} /> Logout
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 bg-[#3b5d47] text-white p-5 z-50 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <img src={DUVLogoWhite} alt="Logo" className="w-3 h-auto" />
                        <button onClick={toggleMobileSidebar}>
                            <X size={24} className="text-white cursor-pointer hover:text-[#5A8366]" />
                        </button>
                    </div>
                    <ul className="space-y-4 flex-1">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link to={item.href} className="flex items-center gap-3 p-3 hover:bg-[#5A8366] rounded-lg" onClick={toggleMobileSidebar}>
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        {/* Finance Section in Mobile Sidebar */}
                        <li>
                            <button onClick={toggleFinanceDropdown} className="w-full flex items-center justify-between p-3 hover:bg-[#5A8366] rounded-lg">
                                <span className="flex items-center gap-3">
                                    <Bank size={20} /> Finance
                                </span>
                                <CaretDown size={20} className={`transform transition-all ${isFinanceOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isFinanceOpen && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                        <Link to="/admin-dashboard/finance/approved-payroll-from-hr" className="block p-2 hover:bg-[#5A8366] rounded-lg">HR Payroll (Approved Records of HR)</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin-dashboard/finance/approved-payroll-from-ceo" className="block p-2 hover:bg-[#5A8366] rounded-lg">HR Payroll (Approved Records of CEO)</Link>
                                    </li>
                                </ul>
                                )}
                        </li>
                        {/* HR Section in Mobile Sidebar */}
                        <li>
                            <button onClick={toggleHrDropdown} className="w-full flex items-center justify-between p-3 hover:bg-[#5A8366] rounded-lg">
                                <span className="flex items-center gap-3">
                                    <UsersThree size={20} /> Human Resources
                                </span>
                                <CaretDown size={20} className={`transform transition-all ${isHrOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isHrOpen && (
                                <ul className="pl-6 mt-2 space-y-2">
                                    <li>
                                        <Link to="/admin-dashboard/hr/attendance" className="block p-2 hover:bg-[#5A8366] rounded-lg">Attendance</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin-dashboard/hr/payroll" className="block p-2 hover:bg-[#5A8366] rounded-lg">Payroll</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin-dashboard/hr/employees" className="block p-2 hover:bg-[#5A8366] rounded-lg">Employee</Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>
            )}

            {/* Mobile Sidebar Toggle Button */}
            {!mobileSidebarOpen && (
                <button className="fixed top-4 left-4 z-50 lg:hidden" onClick={toggleMobileSidebar}>
                    <List size={24} className="text-gray-800 cursor-pointer" />
                </button>
            )}

            {/* Page Content Wrapper - Adjusts for Sidebar */}
            <div className={`flex-1 min-h-screen bg-gray-100 pt-16 w-full transition-all duration-300 ${mobileSidebarOpen ? "ml-0" : "lg:ml-64"}`}>
                {children}
            </div>
        </div>
    );
};

export default AdminNavbar;