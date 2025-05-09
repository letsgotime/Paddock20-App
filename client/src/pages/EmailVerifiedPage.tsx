import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const EmailVerifiedPage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();
  
  // Function to navigate programmatically
  const navigate = (path: string) => setLocation(path);
  
  // Function to fetch user data
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);
  
  // If already authenticated and verified, redirect to dashboard
  useEffect(() => {
    if (user && !isLoading && user?.isEmailVerified) {
      // Set a timeout to allow the success message to be seen
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 5000); // 5 seconds
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-gradient-to-b from-black to-zinc-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Premium F1-style header */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-gradient-to-r from-[#1982FC] to-[#08c519] rounded-t-md"></div>
        
        <Card className="border-0 shadow-2xl bg-[#111] rounded-b-md">
          <CardHeader className="text-center border-b border-gray-800 pb-6">
            <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-[#1111] border-4 border-[#1982FC]/20">
              {isLoading ? (
                <Loader2 className="h-10 w-10 text-[#1982FC] animate-spin" />
              ) : user?.isEmailVerified ? (
                <CheckCircle2 className="h-10 w-10 text-[#08c519]" />
              ) : (
                <Info className="h-10 w-10 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {isLoading ? "Verifying..." : 
               user?.isEmailVerified ? "Email Verified!" : 
               "Verification Status"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLoading ? "Checking your account status..." : 
               user?.isEmailVerified ? "Your email has been successfully verified." : 
               "Unable to determine verification status."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-gray-300">Retrieving your account information...</p>
              ) : user?.isEmailVerified ? (
                <>
                  <div className="bg-[#1982FC]/10 border border-[#1982FC]/20 rounded p-4">
                    <h3 className="font-medium text-[#1982FC] mb-2">Account Successfully Verified</h3>
                    <p className="text-gray-300 text-sm">
                      {user.role === 'premium' ? 
                        "Thank you for verifying your premium account! You now have full access to all exclusive features." :
                        "Your account verification is complete. You can now enjoy all PADDOCK20 features."}
                    </p>
                  </div>
                  <p className="text-center text-gray-400 text-sm">
                    Redirecting to Command Center in a moment...
                  </p>
                </>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4">
                  <h3 className="font-medium text-amber-500 mb-2">Verification Issue</h3>
                  <p className="text-gray-300 text-sm">
                    There was an issue verifying your email. The link may have expired or already been used.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-2">
            {user?.isEmailVerified ? (
              <Button 
                className="w-full bg-[#1982FC] hover:bg-[#1982FC]/90 text-white"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  className="w-full bg-[#1982FC] hover:bg-[#1982FC]/90 text-white"
                  onClick={() => fetchUserData()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Status
                    </>
                  ) : (
                    'Refresh Status'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={() => navigate('/auth')}
                >
                  Return to Login
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 GoTime Motorsports - Bespoke Technology Syndicate (BTS). All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;