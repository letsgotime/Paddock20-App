import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock user for preview mode (same as in App.tsx)
const mockUser = { 
  id: 99999, 
  username: 'Alex Garza', 
  email: 'alex@gotime.com', 
  firstName: 'Alex', 
  lastName: 'Garza', 
  fullName: 'Alex Garza', 
  profileImage: null, 
  role: 'admin' as const 
};

/**
 * Header component with logout functionality
 * This implementation works with preview mode and will be ready to integrate with
 * the auth system once preview mode is disabled
 */
const Header: React.FC = () => {
  const { toast } = useToast();
  
  // Always using mockUser for now with preview mode, but this will be replaced
  // with real authentication once the system is ready
  const user = mockUser;
  
  const handleLogout = () => {
    // Since we're in preview mode, just show a toast notification
    toast({
      title: 'Logout Functionality',
      description: 'The logout button is now implemented and ready for authentication.',
    });
    
    // In real implementation, this would call the API and redirect
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b-2 border-blue-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-3xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors font-['Orbitron'] tracking-wider">
            PADDOCK<span style={{ color: '#08c519' }}>20</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center text-white font-medium">
                <span className="mr-2">
                  <User className="h-5 w-5 inline text-blue-400" />
                </span>
                <span className="text-lg">{user.username}</span>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={handleLogout}
                className="text-white bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 font-bold px-6 shadow-lg"
              >
                <LogOut className="h-5 w-5 mr-2 text-white" />
                <span className="text-white uppercase tracking-wider">Logout</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button 
                variant="outline" 
                size="default"
                className="text-white bg-green-600 hover:bg-green-700 border-2 border-green-500 font-bold px-6 shadow-lg"
              >
                <User className="h-5 w-5 mr-2 text-white" />
                <span className="text-white uppercase tracking-wider">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;