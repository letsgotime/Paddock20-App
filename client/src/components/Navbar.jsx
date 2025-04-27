import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className='bg-black border-b border-gray-700 px-6 py-4 flex justify-between items-center'>
      <h1 className='text-green-400 font-orbitron text-2xl tracking-wide'>Paddock20 Portal</h1>
      <div className='flex items-center gap-4'>
        <button className='text-white hover:text-green-400 px-3 py-1 rounded-md border border-gray-700 hover:border-green-400 transition-colors'>
          Login
        </button>
        <button className='bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-500 transition-colors'>
          Sign Up
        </button>
      </div>
    </header>
  );
}

export default Navbar;