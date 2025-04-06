import React, { useState } from "react";
import { List, X, UserCheck, House, ListChecks, Bank, UsersThree, Calendar, SignOut, User, CaretDown } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import DUVLogoWhite from "../../assets/DUVLogoWhite.png";
import { usePermissions } from "../../context/PermissionsContext";

const AdminNavbar = ({ children }) => {
    const { permissions } = usePermissions();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();
    console.log(permissions)

    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const menuItems = [
        { name: "Dashboard", icon: <House size={20} />, href: "/admin-dashboard" },
        { name: "Users", icon: <User size={20} />, href: "/admin-dashboard/user-management", permission: "can_access_user" },
        { name: "Employees", icon: <UserCheck size={20} />, href: "/admin-dashboard/employees", },
        { name: "Projects", icon: <ListChecks size={20} />, href: "/admin-dashboard/projects", permission: "can_access_projects" },
        { name: "Finance", icon: <Bank size={20} />, href: "/admin-dashboard/finance", permission: "can_access_finance" },
        { name: "Human Resource", icon: <UsersThree size={20} />, href: "/admin-dashboard/hr" },
        { name: "Scheduler", icon: <Calendar size={20} />, href: "/admin-dashboard/scheduler" },
    ];

    // Find the current page name based on the pathname
    const currentPage = menuItems.find((item) => location.pathname.includes(item.href))?.name || "Dashboard";

    return (
        <div className="flex min-h-screen">
            {/* Sidebar - Fixed & Scrollable on Desktop */}
            <div className="bg-[#3b5d47] h-screen w-64 text-white fixed top-0 left-0 shadow-lg p-5 flex flex-col justify-between z-50 overflow-y-auto hidden lg:block">
                <div>
                    <div className="flex justify-center items-center mb-6">
                        <img src={DUVLogoWhite} alt="Logo" className="w-32 h-auto" />
                    </div>
                    <ul className="space-y-4">

                        {menuItems.filter(item => !item.permission || permissions?.[item.permission] === "Y")
                        .map((item, index) => (
                            <li key={index}>
                                <Link to={item.href} className="flex items-center gap-3 p-3 hover:bg-[#5A8366] rounded-lg">
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <button className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg w-full">
                        <SignOut size={22} /> Logout
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar - Fullscreen & Scrollable */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 bg-[#3b5d47] text-white p-5 z-50 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <img src={DUVLogoWhite} alt="Logo" className="w-32 h-auto" />
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
                    </ul>
                    <div>
                        <button className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg w-full">
                            <SignOut size={32} /> Logout
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Toggle Button */}
            {!mobileSidebarOpen && (
                <button className="fixed top-4 left-4 z-50 lg:hidden" onClick={toggleMobileSidebar}>
                    <List size={24} className="text-gray-800 cursor-pointer" />
                </button>
            )}

            {/* Top Navbar - Page Indicator (Properly Positioned on Desktop & Mobile) */}
            <div className="fixed top-0 left-0 w-full bg-white p-4 flex justify-between items-center gap-3 z-40">
                <h1 className="text-lg font-semibold text-gray-800 lg:ml-64 ml-10">{currentPage}</h1>

                {/* Profile Section */}
                <div className="relative hover:text-gray-400 cursor-pointer">
                    <button className="flex items-center gap-2 cursor-pointer" onClick={toggleProfileDropdown}>
                        <div className="w-8 bg-black h-8 rounded-full"></div> {/* Profile picture */}
                        <p className="text-sm font-semibold text-gray-800">Christian Aquino</p>
                        <CaretDown size={18} className="text-gray-800" />
                    </button>

                    {profileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2">
                            <button className="block px-4 py-2 text-black hover:bg-gray-700 w-full">Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Page Content Wrapper */}
            <div className="flex-1 min-h-screen bg-gray-100 pt-16 lg:ml-64">
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default AdminNavbar;
