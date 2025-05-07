import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function NativeLogoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { logout, isAuthenticated } = useNativeAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await logout();
      
      if (result.success) {
        toast({
          title: "Logout Successful",
          description: "You have been securely logged out",
        });
        navigate('/');
      } else {
        setError(result.error || 'An error occurred during logout');
        toast({
          title: "Logout Failed", 
          description: result.error || "Failed to log out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during logout';
      setError(errorMessage);
      toast({
        title: "Logout Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border border-[#1982FC] bg-black/90 text-white">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl text-[#1982FC] font-['Orbitron']">Logout Confirmation</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="mb-6">Are you sure you want to log out of your Paddock20 account?</p>
          
          {error && (
            <div className="p-3 mb-4 bg-red-900/30 border border-red-700 rounded-md text-red-50 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleLogout} 
              className="bg-[#1982FC] hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Yes, Log Out"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col text-center text-sm text-gray-400">
          <p>You will need to log in again to access your account.</p>
        </CardFooter>
      </Card>
    </div>
  );
}