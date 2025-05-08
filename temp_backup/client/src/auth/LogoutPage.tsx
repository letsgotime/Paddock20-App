/**
 * PADDOCK20 Enhanced Logout Page
 * F1-styled pit exit experience with social media connections
 */
import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from './useAuth';
import { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaDiscord } from 'react-icons/fa';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LogoutPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  
  // Logout effect - if user is still authenticated when visiting this page
  useEffect(() => {
    const performLogout = async () => {
      if (isAuthenticated) {
        await logout();
      }
    };
    
    performLogout();
  }, [isAuthenticated, logout]);
  
  // Social media links with F1 racing theme
  const socialLinks = [
    { 
      name: 'Twitter', 
      icon: <FaTwitter className="h-6 w-6" />, 
      url: 'https://twitter.com/paddock20',
      color: 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90'
    },
    { 
      name: 'Instagram', 
      icon: <FaInstagram className="h-6 w-6" />, 
      url: 'https://instagram.com/paddock20',
      color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90'
    },
    { 
      name: 'YouTube', 
      icon: <FaYoutube className="h-6 w-6" />, 
      url: 'https://youtube.com/paddock20',
      color: 'bg-[#FF0000] hover:bg-[#FF0000]/90'
    },
    { 
      name: 'TikTok', 
      icon: <FaTiktok className="h-6 w-6" />, 
      url: 'https://tiktok.com/@paddock20',
      color: 'bg-black hover:bg-zinc-800'
    },
    { 
      name: 'Discord', 
      icon: <FaDiscord className="h-6 w-6" />, 
      url: 'https://discord.gg/paddock20',
      color: 'bg-[#5865F2] hover:bg-[#5865F2]/90'
    }
  ];
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-carolina-blue mb-4">
            PIT EXIT CONFIRMED
          </h1>
          <p className="text-zinc-300 text-lg mb-3">
            You've successfully signed out of PADDOCK
            <span className="text-gotime-green font-bold">20</span>
          </p>
          
          <div className="w-fit mx-auto px-3 py-1 bg-zinc-800/50 rounded-full mb-6">
            <p className="text-zinc-400 text-sm">
              Thank you for being part of our beta experience
            </p>
          </div>
          
          {user?.username && (
            <p className="text-zinc-400 italic mb-8">
              Goodbye, {user.username}. We hope you enjoyed your session.
            </p>
          )}
        </div>
        
        <Card className="p-8 bg-zinc-900 border-carolina-blue">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-white mb-3">
                Stay Connected With The Grid
              </h2>
              <p className="text-zinc-400 mb-6">
                Follow us on social media for updates, motorsports content, and community events.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} p-3 rounded-md flex items-center justify-center space-x-2 text-white transition duration-200`}
                >
                  {social.icon}
                  <span className="font-medium">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </Card>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-carolina-blue hover:bg-carolina-blue/90 text-white px-6 py-2 rounded-md font-medium flex items-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Return to the Grid</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-transparent border-carolina-blue text-carolina-blue hover:bg-carolina-blue/10 px-6 py-2 rounded-md font-medium flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Return to Home</span>
          </Button>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} PADDOCK20. All Rights Reserved.
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy-policy" className="text-zinc-400 hover:text-carolina-blue text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-zinc-400 hover:text-carolina-blue text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;