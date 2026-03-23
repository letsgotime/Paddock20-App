import React from 'react';
import { Link } from 'wouter';

function Navbar() {
  return (
    <nav className="bg-black border-b border-gray-700 py-4 px-8 flex space-x-8">
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/">Home</Link>
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/garage">Garage</Link>
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/journal">Journal</Link>
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/marketplace">Marketplace</Link>
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/motorsports">Motorsports</Link>
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/events">Events</Link>
      <Link className="text-blue-400 hover:text-green-400 font-orbitron uppercase" to="/settings">Settings</Link>
    </nav>
  );
}

export default Navbar;