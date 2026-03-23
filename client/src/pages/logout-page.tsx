import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const LogoutPage = () => {
  const { logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [logoutInitiated, setLogoutInitiated] = useState(false);
  
  // Clear any local user data
  useEffect(() => {
    // Check if we're already on the logout page from Auth0 redirect
    const isAuthRedirect = window.location.href.includes('?federated');
    
    // Only handle local cleanup, prevent triggering logout again
    // Auth0 logout should have already been triggered from AuthContext
    
    // Maybe add a welcome message
    
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <Card className="w-full max-w-md p-8 border border-[#1982FC] bg-gray-900 text-white">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1982FC]/10 mb-4">
            <div className="text-4xl">👋</div>
          </div>
          
          <h1 className="text-2xl font-bold text-[#1982FC]">You've Been Logged Out</h1>
          
          <p className="text-gray-300">
            Thank you for visiting Paddock<span className="text-[#08c519]">20</span>. We look forward to seeing you on the track again soon.
          </p>
          
          <Link href="/auth">
            <Button className="w-full mt-6" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Login
            </Button>
          </Link>
        </div>
      </Card>

      <p className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Paddock20 | All Rights Reserved
      </p>
    </div>
  );
};

export default LogoutPage;