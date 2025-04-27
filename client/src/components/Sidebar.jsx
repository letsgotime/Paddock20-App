import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className='w-64 bg-gray-900 p-6 hidden md:block'>
      <nav className='flex flex-col space-y-4'>
        <Link to='/' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>🏠</span> Home
        </Link>
        <Link to='/garage-vault' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>🚗</span> Garage Vault
        </Link>
        <Link to='/manifestation-station' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>🧭</span> Manifestation Station
        </Link>
        <Link to='/mod-planner' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>🔧</span> Mod Planner
        </Link>
        <Link to='/concierge' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>👔</span> Concierge
        </Link>
        <Link to='/redline-report' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>📊</span> Redline Report
        </Link>
        <Link to='/hustle-planner' className='text-white hover:text-green-400 transition-colors font-medium flex items-center gap-2'>
          <span>💰</span> Hustle Planner
        </Link>
      </nav>
      
      <div className='mt-10 pt-6 border-t border-gray-800'>
        <h3 className='text-gray-400 uppercase text-xs font-semibold mb-3'>Quick Tools</h3>
        <div className='flex flex-col space-y-3'>
          <button className='text-white hover:text-green-400 transition-colors text-sm text-left flex items-center gap-2'>
            <span>📅</span> Calendar
          </button>
          <button className='text-white hover:text-green-400 transition-colors text-sm text-left flex items-center gap-2'>
            <span>⏱️</span> Track Day Timer
          </button>
          <button className='text-white hover:text-green-400 transition-colors text-sm text-left flex items-center gap-2'>
            <span>📝</span> Export Data
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;