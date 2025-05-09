import React from 'react';
import duvLogo from '../../assets/duvLogo.jpg';  // Import the logo image
import background from '../../assets/background.jpg'; // Import the background image

export const LoadingSpinner = () => {
  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-9999"
      style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
    >
      <img 
        src={duvLogo} 
        alt="Loading..." 
        className="bg-white/80 p-1 w-32 h-auto animate-pulse rounded-full" 
      />
    </div>
  );
}
