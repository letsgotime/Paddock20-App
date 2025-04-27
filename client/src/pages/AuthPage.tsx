import React from 'react';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Login/Register Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-orbitron text-blue-500 mb-6">Paddock20™ Access</h1>
          <p className="text-gray-400 mb-8">
            Enter your credentials to access the Paddock20 platform.
          </p>
          
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-orbitron text-green-500 mb-4">Sign In</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" 
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="mr-2" />
                  <label htmlFor="remember" className="text-gray-400 text-sm">Remember me</label>
                </div>
                <a href="#" className="text-green-500 text-sm hover:text-green-400">Forgot password?</a>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium">
                Sign In
              </button>
            </form>
          </div>
          
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-orbitron text-green-500 mb-4">Register</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">First Name</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Last Name</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input type="email" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Confirm Password</label>
                <input type="password" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
              </div>
              <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-medium">
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Hero Side */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#000000] to-[#0a0a0a]">
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-4xl font-orbitron text-blue-500 mb-6">Join Paddock20™</h2>
          <p className="text-xl text-white mb-8">
            Your exclusive membership to the ultimate automotive lifestyle platform.
          </p>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Access premium car culture events and meetups
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Track maintenance and performance with our digital garage
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Connect with enthusiasts and industry insiders
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Exclusive product discounts and offers
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Real-time weather and track condition reports
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;