import React, { useState } from "react";
import { Link } from "react-router-dom";
import DUV from "../../assets/DUVLogo.jpg";
import { List, X, CaretDown } from "@phosphor-icons/react";

const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false); // Dropdown toggle state

  return (
    <>
      <div className="flex fixed top-0 left-0 right-0 bg-[#4c735c] h-16 justify-between px-10 z-50">
        {/* Logo Section */}
        <div className="flex items-center font-bold">
          <div className="w-16">
            <Link to="/">
              <img src={DUV} alt="" className="w-full h-full object-contain" />
            </Link>
          </div>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center gap-10 text-white font-bold">
          <Link to="/projects" className="hover:text-gray-400 transition">Projects</Link>
          <Link to="/our-team" className="hover:text-gray-400 transition">Our Team</Link>
          <Link to="/aboutus" className="hover:text-gray-400 transition">About Us</Link>
          <Link to="/login" className="hover:text-gray-400 transition">Login</Link>

          {/* Support Desk Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 cursor-pointer" onClick={() => setSupportOpen(!supportOpen)}>
              Support Desk <CaretDown size={18} />
            </button>

            {supportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md py-2 z-10">
                <Link to="/report-problem" className="block px-4 py-2 hover:bg-gray-200 text-black font-semibold">Report a Problem</Link>
                <Link to="/send" className="block px-4 py-2 hover:bg-gray-200 text-black font-semibold">Send Feedback</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <List size={32} className="text-white cursor-pointer" onClick={() => setMenuOpen(true)} />
        </div>
      </div>

      {/* Mobile Side Nav */}
      <div className={`fixed right-0 top-0 h-screen w-64 bg-[#4c735c] text-white font-bold flex flex-col p-6 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"} z-50`}>
        {/* Close Button */}
        <div className="flex justify-end">
          <X size={32} className="cursor-pointer" onClick={() => setMenuOpen(false)} />
        </div>

        {/* Menu Items */}
        <Link to="/projects" className="py-2 hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Projects</Link>
        <Link to="/our-team" className="py-2 hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Our Team</Link>
        <Link to="/aboutus" className="py-2 hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>About Us</Link>
        <Link to="/login" className="py-2 hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Login</Link>

        {/* Mobile Support Desk Dropdown */}
        <div>
          <button className="py-2 flex items-center gap-2 hover:text-gray-300 transition" onClick={() => setSupportOpen(!supportOpen)}>
            Support Desk <CaretDown size={18} />
          </button>
          {supportOpen && (
            <div className="ml-4 bg-[#4c735c]">
              <Link to="/report-problem" className="block py-2 hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Report a Problem</Link>
              <Link to="/send" className="block py-2 hover:text-gray-300 transition" onClick={() => setMenuOpen(false)}>Send Feedback</Link>
            </div>
          )}
        </div>
      </div>

      {/* Overlay Effect */}
      {menuOpen && <div className="fixed top-0 left-0 w-full h-screen bg-opacity-40 z-40" onClick={() => setMenuOpen(false)}></div>}
    </>
  );
};

export default UserNavbar;
