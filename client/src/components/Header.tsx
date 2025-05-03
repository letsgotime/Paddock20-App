import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Header component with logout functionality
 * Uses the authentication context to show the correct user information
 */
const Header: React.FC = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  // Mock user for preview mode is handled by previewMode in App.tsx
  // Here we directly use the authenticated user from the context
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Could not log out. Please try again.',
        variant: 'destructive',
      });
    }
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