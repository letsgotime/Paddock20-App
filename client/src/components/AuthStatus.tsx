import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthStatus() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      navigate('/auth');
    } catch (err: any) {
      toast({
        title: "Logout Failed",
        description: err.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user.username || user.email}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="text-[#1982FC] hover:text-white hover:bg-[#1982FC]/80 border-[#1982FC]"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  // Don't show login button if we're already on the auth page
  if (location === '/auth') {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => navigate('/auth')}
      className="text-[#1982FC] hover:text-white hover:bg-[#1982FC]/80 border-[#1982FC]"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Login
    </Button>
  );
}