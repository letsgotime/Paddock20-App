import React from 'react';

function Footer() {
  return (
    <footer className='bg-black text-center text-gray-600 py-4 border-t border-gray-800'>
      <div className='container mx-auto'>
        <div className='flex flex-col items-center md:flex-row md:justify-between px-6'>
          <div className='text-xs mb-3 md:mb-0'>
            © 2025 GoTime Motorsports™ - ApexVault™ Systems. Capital Made Tangible.
          </div>
          <div className='flex items-center gap-4'>
            <button className='text-gray-500 hover:text-green-400 text-xs'>Privacy</button>
            <button className='text-gray-500 hover:text-green-400 text-xs'>Terms</button>
            <button className='text-gray-500 hover:text-green-400 text-xs'>Support</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;