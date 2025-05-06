import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Left side: Branding and marketing information */}
      <div className="hidden md:flex md:w-1/2 flex-col p-8 justify-center border-r border-gray-800">
        <div className="space-y-8 max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-[#1982FC] mb-4">PADDOCK20</h1>
            <p className="text-lg text-gray-200 italic">
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
          </div>
          
          <div className="bg-[#1982FC]/10 border border-[#1982FC]/50 rounded-lg p-6 mt-8">
            <h4 className="text-xl font-bold text-[#1982FC] mb-2 text-center">BETA ACCESS</h4>
            <p className="text-gray-300 text-center mb-4">
              Join the movement. Full access to our complete ecosystem during the exclusive beta phase
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side: Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1982FC] mb-2">PADDOCK20</h1>
            <p className="text-gray-300">Your automotive intelligence platform</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Welcome to Paddock20</h2>
                <p className="text-gray-400">Your automotive lifestyle platform awaits</p>
              </div>
              
              <div className="space-y-4">
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
              
              <p className="text-xs text-center text-gray-500">
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