import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DropdownNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black border-b border-gray-700 p-4 flex items-center justify-between">
      <h1 className="text-blue-400 font-orbitron text-2xl">
        ApexVault™
      </h1>

      <div className="relative">
        <button 
          onClick={toggleDropdown}
          className="bg-gray-900 hover:bg-gray-800 text-green-400 font-orbitron uppercase px-4 py-2 rounded-lg"
        >
          Menu
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg z-20">
            <Link 
              to="/" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/garage" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Garage Vault
            </Link>
            <Link 
              to="/journal" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Drive Journal
            </Link>
            <Link 
              to="/marketplace" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              to="/motorsports" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Motorsports
            </Link>
            <Link 
              to="/events" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Events & Meetups
            </Link>
            <Link 
              to="/juicebox" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Juice Box™
            </Link>
            <Link 
              to="/settings" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default DropdownNavbar;