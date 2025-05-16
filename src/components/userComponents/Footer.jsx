import React from 'react';
import { Phone, FacebookLogo, Envelope } from '@phosphor-icons/react';
import DUVLogoWhite from '../../assets/DUVLogoWhite.png';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 text-center w-full mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-6 md:space-y-0 md:space-x-10">
          <div className="flex justify-center md:justify-start">
            <img src={DUVLogoWhite} className='w-32 md:w-44' alt="DUV Logo" />
          </div>
          <div className="text-center max-w-md">
            <p className="font-bold text-lg">About Us</p>
            <p className="text-sm">DUV Engineers and Construction Services specializes in fiber optic network installation, civil works, and infrastructure projects, delivering quality and reliable solutions with efficiency and excellence.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-4">
            <p className="font-bold text-lg">Contact Us</p>
            <div className="flex space-x-4">
              <Phone size={30} className='hover:text-gray-400 cursor-pointer' />
              <FacebookLogo size={30} className='hover:text-gray-400 cursor-pointer' />
              <Envelope size={30} className='hover:text-gray-400 cursor-pointer' />
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-700 pt-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} DUV ENGINEERS. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;