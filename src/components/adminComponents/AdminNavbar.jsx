import React, { useState } from 'react';
import { List, X, UserCheck, House, ListChecks, Bank, UsersThree, Calendar, SignOut, User } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const AdminNavbar = ({ children }) => {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setOpen(!open);
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
        { name: "Scheduler", icon: <Calendar size={32} />, href: "#" },
    ];

    const currentPage = menuItems.find(item => item.href === location.pathname)?.name || "Dashboard";

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: open ? 0 : -300 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 h-screen w-64 text-white fixed top-0 left-0 shadow-lg p-5 flex flex-col justify-between z-50"
            >
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <p className="font-bold text-lg">DUV ENGINEERS</p>
                        <button onClick={closeSideBar}><X size={24} className='text-white hover:text-[#4c735c] cursor-pointer'/></button>
                    </div>
                    <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                        <UserCheck size={42} className='border-2 rounded-full p-1 text-[#4c735c]' />
                        <p className='font-bold text-lg text-white'>Admin</p>
                    </div>
                    <div>
                        <input 
                            type="text" 
                            placeholder='Search...'
                            className='w-full bg-gray-800 text-white p-2 rounded-2xl mb-4'
                        />
                    </div>
                    <ul className='space-y-4'>
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link to={item.href} className='flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg'>
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
            <div className="fixed top-0 left-0 w-full bg-gray-900 text-white p-4 flex items-center gap-3 z-40">
                <button className="flex items-center gap-2" onClick={toggleSidebar}>
                    {open ? <X size={20} /> : <List size={20} className='hover:text-gray-400 cursor-pointer'/>}
                </button>
            </div>

            {/* Page Name*/}
            <motion.span 
                animate={{ marginLeft: open ? "260px" : "0px" }}
                transition={{ duration: 0.2 }}
                className="fixed top-3 left-10 justify text-white text-lg font-semibold z-40"
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
