import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DUV from '../../assets/DUVLogo.jpg'
import { List } from '@phosphor-icons/react'

const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className='flex fixed top-0 left-0 right-0 bg-[#4c735c] h-16 justify-between px-10 mb-16 z-50'>
      <div className='left-section flex items-center font-bold'>
        <div className='w-16'>
          <Link to="/"><img src={DUV} alt="" className='w-full h-full object-contain' /> </Link>
        </div>
      </div>
      <div className='hidden md:flex items-center gap-10 text-white font-bold'>
        <Link to="projects" className='hover:text-gray-400 transition' >Projects</Link>
        <Link to="our-team" className='hover:text-gray-400 transition'>Our Team</Link>
        <Link to="/aboutus" className='hover:text-gray-400 transition'>About us</Link>
        <Link to="/Login" className='hover:text-gray-400 transition'>Login</Link>
      </div>
      <div className='md:hidden flex  items-center '>
        <List size={32}className='text-white cursor-pointer flex justify-center' onClick={() => {setMenuOpen(!menuOpen)}}/>
      </div>
      {
        menuOpen && (
          <div className='absolute top-16 left-0 right-0 bg-[#4c735c] flex flex-col items-center font-bold text-white'>
            <Link to="projects" className='py-2 hover:text-gray-400 transition' onClick={() => {setMenuOpen(false)}}>Projects</Link>
            <Link to="our-team" className='py-2 hover:text-gray-400 transition' onClick={() => {setMenuOpen(false)}}>Our Team</Link>
            <Link to="about-us" className='py-2 hover:text-gray-400 transition' onClick={() => {setMenuOpen(false)}}>About Us</Link>
            <Link to="/login" className='py-2 hover:text-gray-400 transition' onClick={() => {setMenuOpen(false)}}>Login</Link>
          </div>
        )
      }
    </div>
  )
}

export default UserNavbar
