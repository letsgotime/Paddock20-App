import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * DemoMode - Direct entry point to enable demo mode
 * This bypasses Auth0 completely and allows for testing without Auth0 configuration
 */
const DemoMode = () => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Enable demo mode flags
    localStorage.setItem('PADDOCK20_DEMO_MODE', 'true');
    localStorage.setItem('paddock20_demo_auth_bypass', 'true');
    
    // Create a demo user with admin capabilities
    const demoUser = {
      id: 9999,
      username: 'demoadmin',
      email: 'demo@paddock20.example',
      firstName: 'Demo',
      lastName: 'User',
      fullName: 'Demo User',
      profileImage: 'https://ui-avatars.com/api/?name=Demo+User&background=1982FC&color=fff',
      role: 'admin',
    };
    
    // Store user data
    localStorage.setItem('userProfile', JSON.stringify(demoUser));
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      console.log('Demo mode activated - redirecting to The Paddock');
      setLocation('/the-paddock');
    }, 1500);
  }, [setLocation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#1982FC]" />
          <h1 className="text-2xl font-bold text-white">
            Enabling Demo Mode...
          </h1>
          <p className="text-gray-400">
            Please wait while we prepare your demo environment
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;