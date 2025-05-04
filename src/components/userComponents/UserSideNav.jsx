import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { House, CaretDown, X, List, ClipboardText, Envelope } from "@phosphor-icons/react"; // Add necessary icons
import DUVLogoWhite from "../../assets/DUVLogoWhite.png";



export const UserSideNav = ({ children }) => {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const menuItems = [
        { name: "Home", icon: <House size={20} />, href: "/ClientDashboard" },
        { name: "Projects", icon: <ClipboardText size={20} />, href: "/ClientDashboard/projects-client" },
        { name: "Messages", icon: <Envelope size={20} />, href: "/ClientDashboard/messages" },
        
    ];

    const currentPage = (() => {
        // Check against menuItems to determine the current page name based on the URL
        const matchedPage = menuItems.find((item) => location.pathname === item.href)?.name;

        return matchedPage || "Home";
    })();

    const handleLogout = () => {
        // Handle user logout logic here (e.g., clear session, navigate to login)
        navigate('/login');
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
                            <button className="block px-4 py-2 text-black hover:bg-gray-700 w-full" onClick={handleLogout}>Logout</button>
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
                        {menuItems.map((item, index) => (
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
                    </ul>
                </div>

                {/* Logout Button */}
                <div>
                    <button className="flex items-center gap-3 p-3 hover:bg-[#5A8366] rounded-lg w-full" onClick={handleLogout}>
                        <X size={22} /> Logout
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
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
                </div>
            )}

            {/* Mobile Sidebar Toggle Button */}
            {!mobileSidebarOpen && (
                <button className="fixed top-4 left-4 z-50 lg:hidden" onClick={toggleMobileSidebar}>
                    <List size={24} className="text-gray-800 cursor-pointer" />
                </button>
            )}

            {/* Page Content Wrapper */}
            <div className={`flex-1 min-h-screen bg-gray-100 pt-16 w-full transition-all duration-300 ${mobileSidebarOpen ? "ml-0" : "lg:ml-64"}`}>
                {/* Add your main content here */}
                {children}
            </div>
        </div>
    );
};

export default UserSideNav;
