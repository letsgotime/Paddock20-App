import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { AuthContext } from '../context/SupabaseAuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, LogOut, User } from 'lucide-react';

export default function AuthStatus() {
  const auth = useContext(AuthContext);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  if (!auth) {
    return null;
  }

  const { user, loading, logout } = auth;

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out",
        });
        navigate('/auth');
      }
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

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
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