import React, { useState } from 'react';
import { List, X, UserCheck, House, ListChecks, Bank, UsersThree, Calendar, SignOut, User, CaretDown } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import DUVLogoWhite from '../../assets/DUVLogoWhite.png'

const AdminNavbar = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // New state for dropdown visibility
    const location = useLocation();

    const toggleSidebar = () => {
        setOpen(!open);
    };

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    const closeSideBar = () => {
        setOpen(false);
    };

    const menuItems = [
        { name: "Dashboard", icon: <House size={20} />, href: "/admin-dashboard" },
        { name: "Users", icon: <User size={20} />, href: "/admin-dashboard/user-management" },
        { name: "Employees", icon: <UserCheck size={20} />, href: "/admin-dashboard/employees" },
        { name: "Projects", icon: <ListChecks size={20} />, href: "/admin-dashboard/projects" },
        { name: "Finance", icon: <Bank size={20} />, href: "#" },
        { name: "Human Resource", icon: <UsersThree size={20} />, href: "/admin-dashboard/hr" },
        { name: "Scheduler", icon: <Calendar size={20} />, href: "#" },
    ];

    const currentPage = menuItems.find(item => item.href === location.pathname)?.name || "Dashboard";

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: open ? 0 : -300 }}
                transition={{ duration: 0.2 }}
                className="bg-[#3b5d47] h-screen w-64 text-white fixed top-0 left-0 shadow-lg p-5 flex flex-col justify-between z-50 overflow-y-auto"
            >
                {/* Sidebar Content */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <img src={DUVLogoWhite} alt="" className='w-25 relative left-12 h-auto'/>
                        <button onClick={closeSideBar}><X size={24} className='text-white hover:text-[#5A8366] cursor-pointer'/></button>
                    </div>
                    <ul className='space-y-4'>
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link to={item.href} className='flex items-center gap-3 p-3 hover:bg-[#5A8366] rounded-lg'>
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <a href="#" className='flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg w-full'>
                        <SignOut size={32} />
                        Logout
                    </a>
                </div>
            </motion.div>

            {/* Top Navbar */}
            <div className="fixed top-0 left-0 w-full bg-white p-4 flex justify-between items-center gap-3 z-40">
                {/* Sidebar Toggle Button */}
                <button className="flex items-center gap-2" onClick={toggleSidebar}>
                    {open ? <X size={20} /> : <List size={20} className='hover:text-gray-400 cursor-pointer'/>}
                </button>

                {/* Profile Section with Dropdown */}
                <div className="relative hover:text-gray-400 cursor-pointer">
                    <button
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={toggleProfileDropdown}
                    >
                        <div className="w-8 bg-black h-8 rounded-full"></div> {/* Profile picture */}
                        <p className="text-sm font-semibold text-gray-800">Christian Aquino</p>
                        <CaretDown size={18} className='text-gray-800'/>
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2">
                            <button className="block px-4 py-2 text-black hover:bg-gray-700 w-full">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Page Name */}
            <motion.span 
                animate={{ marginLeft: open ? "260px" : "0px" }}
                transition={{ duration: 0.2 }}
                className="fixed top-4 left-10 text-black text-lg font-semibold z-40"
            >
                {currentPage}
            </motion.span>

            {/* Page Content Wrapper */}
            <motion.div 
                animate={{ marginLeft: open ? "260px" : "0px" }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-h-screen bg-gray-100 pt-16"
            >
                {/* Page Content is Rendered Here */}
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
};

export default AdminNavbar;
