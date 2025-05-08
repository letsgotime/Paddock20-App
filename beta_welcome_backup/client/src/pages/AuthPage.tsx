import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { CheckCircle, ChevronRight, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  // Use both our wrapped auth context and the direct Auth0 hook for maximum reliability
  const { login, register, user, logout, isAuthenticated } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const [, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Debug logs to help diagnose Auth0 issues
  useEffect(() => {
    console.log('Auth Page - Direct Auth0 Login Redirect URI:', `${window.location.origin}/auth/callback`);
    console.log('Auth Page - Current location:', window.location.href);
  }, []);
  
  // Redirect if already logged in, but add a delay to give the logout time to process
  React.useEffect(() => {
    // If there's a user and we're not in the process of logging out, redirect
    if (user && !isLoggingOut) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/dashboard';
      // Add a small delay to prevent immediate redirect if the user just clicked logout
      const timer = setTimeout(() => {
        setLocation(redirectPath);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, setLocation, isLoggingOut]);
  
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    // Reset the flag after a delay - the Auth0 logout should have completed by then
    setTimeout(() => setIsLoggingOut(false), 2000);
  };

  // Direct Auth0 login - using Auth0's own function to ensure redirect works properly
  const handleDirectAuth0Login = () => {
    // Use the Auth0 loginWithRedirect directly to avoid any middleware issues
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/auth/callback`,
      }
    });
  };
  
  // Show a simpler debug version if user is logged in
  if (user && !isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-xl">
          <h2 className="text-2xl font-bold text-[#1982FC] mb-4 text-center">Currently Logged In</h2>
          <p className="text-gray-200 mb-8 text-center">You are currently logged in as {user.username || user.email}</p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleLogout}
              variant="destructive" 
              className="w-full font-bold py-6 h-16 rounded-lg transition-all duration-200"
            >
              Log Out
              <LogOut className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              onClick={() => setLocation('/dashboard')} 
              className="w-full bg-[#1982FC] hover:bg-[#1982FC]/80 text-white font-bold py-6 h-16 rounded-lg transition-all duration-200"
            >
              Go to Dashboard
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show a loading state while logout is in progress
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-xl text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-[#1982FC] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Logging Out...</h2>
          <p className="text-gray-200">Please wait while we complete the logout process</p>
        </div>
      </div>
    );
  }
  
  // Regular auth page for non-logged in users
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1982FC] mb-4">PADDOCK<span className="text-[#08c519]">20</span></h1>
          <p className="text-xl text-gray-200 italic max-w-3xl mx-auto">
            The bespoke automotive lifestyle platform with F1-precision intelligence that transforms everyday car care into a curated experience
          </p>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left column: Features */}
          <div className="space-y-10">
            <div className="border-l-4 border-[#1982FC] pl-6 py-2">
              <h3 className="text-2xl font-semibold mb-2 text-white">Track maintenance, mods, and detailing with precision</h3>
              <p className="text-gray-300">A comprehensive system for all maintenance, modifications, and detailing records with F1-inspired interfaces</p>
            </div>
            
            <div className="border-l-4 border-[#08c519] pl-6 py-2">
              <h3 className="text-2xl font-semibold mb-2 text-white">Discover perfect drives with Weather Paddock intelligence</h3>
              <p className="text-gray-300">Advanced weather telemetry and route planning designed specifically for the automotive enthusiast</p>
            </div>
            
            <div className="border-l-4 border-[#1982FC] pl-6 py-2">
              <h3 className="text-2xl font-semibold mb-2 text-white">Level up with premium features for the complete enthusiast</h3>
              <p className="text-gray-300">Competitive goal tracking, performance analytics, and exclusive automotive experiences</p>
            </div>
            
            <div className="bg-[#1982FC]/10 border border-[#1982FC]/40 rounded-lg p-8 mt-10">
              <h4 className="text-2xl font-bold text-[#1982FC] mb-3 text-center">BETA ACCESS</h4>
              <p className="text-lg text-gray-200 text-center mb-4">
                Join the movement. Full access to our complete ecosystem during the exclusive beta phase
              </p>
            </div>
          </div>
          
          {/* Right column: Auth card */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8 w-full max-w-md shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">Thanks for visiting!</h2>
              </div>
              
              <div className="space-y-5 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#08c519] mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-200 text-lg">Advanced vehicle management dashboard</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#08c519] mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-200 text-lg">Intelligent weather-based drive planning</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#08c519] mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-200 text-lg">Exclusive automotive community features</p>
                </div>
              </div>
              
              {/* Single button for Auth0 login */}
              <Button 
                onClick={handleDirectAuth0Login} 
                className="w-full bg-[#08c519] hover:bg-[#08c519]/80 text-white font-bold text-xl py-6 h-16 rounded-lg transition-all duration-200 shadow-lg shadow-[#08c519]/20"
              >
                Join the Grid
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
              
              <p className="text-sm text-center text-gray-400 mt-4">
                By signing up, you agree to our <a href="/terms-of-service" className="text-[#1982FC] hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-[#1982FC] hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;