import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  ChevronRight, 
  Shield, 
  Lock, 
  Instagram, 
  Twitter, 
  Youtube, 
  Facebook,
  ArrowRight,
  Clock,
  Calendar,
  Car
} from 'lucide-react';

/**
 * Enhanced Logout Page with F1-inspired design
 * This page shows after user logs out, with animated elements and social links
 */
const EnhancedLogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Format current date in F1-style: 07 MAY 2025
  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
  
  // Current time in 24-hour format
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Perform logout on component mount
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
    
    performLogout();
  }, [logout]);
  
  // Handle login button click
  const handleLoginAgain = () => {
    setLocation('/auth');
  };
  
  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[url('/assets/textures/telemetry-grid.png')] bg-repeat opacity-10"></div>
      
      {/* Top checkpoint pattern */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1982FC] via-black to-[#08c519]"></div>
      
      {/* Side checkpoint patterns */}
      <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-[#1982FC] via-black to-[#08c519]"></div>
      <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-b from-[#08c519] via-black to-[#1982FC]"></div>
      
      {/* Bottom checkpoint pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#08c519] via-black to-[#1982FC]"></div>
      
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-4xl mx-auto">
          {/* F1-style telemetry header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center">
                <Badge className="bg-[#08c519] text-black font-bold mr-2">LOGOUT</Badge>
                <div className="text-[#1982FC] font-mono text-sm">SESSION COMPLETE</div>
              </div>
              <h1 className="font-orbitron text-4xl md:text-5xl mt-2 bg-gradient-to-r from-[#1982FC] to-[#08c519] bg-clip-text text-transparent">
                PADDOCK<span className="text-[#08c519]">20</span> BETA
              </h1>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded px-3 py-2 mt-4 md:mt-0">
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="h-3 w-3 mr-1" /> {formattedDate}
                <Separator orientation="vertical" className="mx-2 h-3" />
                <Clock className="h-3 w-3 mr-1" /> {currentTime}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 md:p-12 relative overflow-hidden">
            {/* Background corner graphic */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1982FC]/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#08c519]/10 rounded-full blur-2xl"></div>
            
            {/* Status line */}
            <div className="flex items-center mb-6">
              <div className="h-2 w-2 rounded-full bg-[#08c519] animate-pulse mr-2"></div>
              <div className="text-[#08c519] font-mono text-sm tracking-wider">SECURE CONNECTION TERMINATED</div>
            </div>
            
            {/* Main message */}
            <div className="mb-8">
              <h2 className="text-3xl font-orbitron mb-4">You've Successfully Logged Out</h2>
              <p className="text-gray-400 max-w-2xl">
                Your PADDOCK20 session has been securely terminated. All driver telemetry and system access has been locked down. Thank you for being part of our exclusive BETA program.
              </p>
            </div>
            
            {/* Status metrics - F1 style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-md p-4">
                <div className="flex items-center mb-1">
                  <Shield className="h-4 w-4 text-[#1982FC] mr-2" />
                  <span className="text-xs text-gray-400">SECURITY STATUS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">LOCKED</span>
                  <Badge className="bg-[#1982FC]/20 text-[#1982FC] hover:bg-[#1982FC]/30">100%</Badge>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-md p-4">
                <div className="flex items-center mb-1">
                  <Lock className="h-4 w-4 text-[#08c519] mr-2" />
                  <span className="text-xs text-gray-400">SESSION STATE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">TERMINATED</span>
                  <Badge className="bg-[#08c519]/20 text-[#08c519] hover:bg-[#08c519]/30">VERIFIED</Badge>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-md p-4">
                <div className="flex items-center mb-1">
                  <Car className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-xs text-gray-400">NEXT SESSION</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">READY</span>
                  <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">STANDBY</Badge>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <Button 
                onClick={handleLoginAgain}
                className="bg-[#1982FC] hover:bg-[#1982FC]/90 w-full sm:w-auto"
              >
                Return to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-[#08c519] text-[#08c519] hover:bg-[#08c519]/10 w-full sm:w-auto"
                onClick={() => window.open('https://paddock20.com', '_blank')}
              >
                Visit Paddock20.com <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            {/* Social media links with F1-style design */}
            <div>
              <Separator className="mb-6 bg-gray-800" />
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-500 mb-1">Follow PADDOCK20</p>
                  <div className="flex space-x-3">
                    <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                      <Instagram className="h-5 w-5 text-[#1982FC]" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                      <Twitter className="h-5 w-5 text-[#1982FC]" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                      <Youtube className="h-5 w-5 text-[#1982FC]" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                      <Facebook className="h-5 w-5 text-[#1982FC]" />
                    </Button>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs text-gray-500 mb-1">PADDOCK20 BETA v1.0.0</div>
                  <div className="text-xs text-gray-500">
                    © {new Date().getFullYear()} PADDOCK20. All rights reserved.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogoutPage;