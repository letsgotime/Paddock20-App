import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, UserPlus, Shield } from 'lucide-react';

// Import UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in (using useEffect to avoid React Router warnings)
  React.useEffect(() => {
    console.log('AuthPage useEffect - user:', user ? 'authenticated' : 'not authenticated');
    
    if (user) {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/dashboard';
      
      // Navigate to the specified path or dashboard as default
      console.log('Redirecting authenticated user to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } else {
      console.log('User not authenticated, showing auth forms');
    }
  }, [user, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Auth Forms */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
              PADDOCK<span style={{ color: '#08c519' }}>20</span>
            </h1>
            <p className="text-gray-300">Your automotive intelligence platform</p>
          </div>
          
          {/* Auth0 Login Card */}
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-100">Thanks for visiting!</CardTitle>
              <CardDescription className="text-gray-400">
                Join our community of automotive enthusiasts
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-[#1982FC]/10 border border-[#1982FC]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-[#1982FC] mb-4 text-center">Your Automotive Lifestyle Platform</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#08c519] mr-3 flex-shrink-0 mt-1" />
                    <p className="text-gray-200">Complete vehicle tracking with F1-inspired dashboards</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#08c519] mr-3 flex-shrink-0 mt-1" />
                    <p className="text-gray-200">Weather intelligence for perfect driving conditions</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#08c519] mr-3 flex-shrink-0 mt-1" />
                    <p className="text-gray-200">Premium features with exclusive automotive experiences</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => login()} 
                  className="w-full bg-[#08c519] hover:bg-[#08c519]/90 text-white font-bold py-3 px-6 h-14 text-lg"
                >
                  Join the Grid!
                  <UserPlus className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Securely powered by Auth0 authentication</span>
                </div>
                
                <p className="text-xs text-center text-gray-500">
                  By signing up, you agree to our <a href="/terms-of-service" className="text-[#1982FC] hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-[#1982FC] hover:underline">Privacy Policy</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Brand Hero */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="p-6 rounded-lg bg-gray-900 border border-gray-800">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2 text-[#1982FC]">PADDOCK20</h1>
              <p className="text-lg text-gray-200 italic mb-4">
                The bespoke automotive lifestyle platform with F1-precision intelligence that transforms everyday car care into a curated experience
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-[#1982FC] pl-4">
                <h3 className="text-xl font-semibold mb-1 text-white">Track maintenance, mods, and detailing with precision</h3>
                <p className="text-gray-400">A comprehensive system for all maintenance, modifications, and detailing records with F1-inspired interfaces</p>
              </div>
              
              <div className="border-l-4 border-[#08c519] pl-4">
                <h3 className="text-xl font-semibold mb-1 text-white">Discover perfect drives with Weather Paddock intelligence</h3>
                <p className="text-gray-400">Advanced weather telemetry and route planning designed specifically for the automotive enthusiast</p>
              </div>
              
              <div className="border-l-4 border-[#1982FC] pl-4">
                <h3 className="text-xl font-semibold mb-1 text-white">Level up with premium features for the complete enthusiast</h3>
                <p className="text-gray-400">Competitive goal tracking, performance analytics, and exclusive automotive experiences</p>
              </div>
              
              <div className="bg-[#1982FC]/10 border border-[#1982FC]/50 rounded-lg p-4 mt-6">
                <h4 className="text-xl font-bold text-[#1982FC] mb-2 text-center">BETA ACCESS</h4>
                <p className="text-gray-300 text-center mb-4">
                  Join the movement. Full access to our complete ecosystem during the exclusive beta phase
                </p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => login()} 
                    className="bg-[#08c519] hover:bg-[#08c519]/80 text-white font-bold py-3 px-6 rounded-md transition-all"
                  >
                    Join the Grid!
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-4">
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