import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * A button that allows users to request beta tester status.
 * The component displays different states based on current beta status.
 */
const BetaTesterRequestButton: React.FC = () => {
  const { user, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();
  
  // Get beta status from user metadata if available
  const betaStatus = user?.['https://paddock20.app/beta_status'] || 'none';
  
  const requestBetaAccess = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request beta access.",
        variant: "destructive"
      });
      return;
    }
    
    setRequesting(true);
    
    try {
      // Get the access token for making authenticated requests
      const token = await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "update:current_user_metadata"
      });
      
      // Send request to the backend to update user metadata
      const response = await fetch('/api/auth0/request-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to request beta access');
      }
      
      // Success! Show toast notification
      toast({
        title: "Beta Request Submitted",
        description: "Your beta tester request has been submitted for approval.",
        variant: "default"
      });
      
      // Force reload user data to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Beta request error:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your beta access request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setRequesting(false);
    }
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <Button variant="outline" disabled className="mt-2 bg-black text-[#4B9CD3] border-[#4B9CD3]/30 hover:bg-black/90">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }
  
  // Render button based on beta status
  const renderButtonByStatus = () => {
    switch (betaStatus) {
      case 'approved':
        return (
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="bg-black/30 border-green-500 text-green-400 flex items-center mb-1 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Beta Access Approved
            </Badge>
            <p className="text-xs text-gray-400">You have full beta testing access</p>
          </div>
        );
        
      case 'pending':
        return (
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="bg-black/30 border-yellow-500 text-yellow-400 flex items-center mb-1 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Beta Request Pending
            </Badge>
            <p className="text-xs text-gray-400">Your request is awaiting approval</p>
          </div>
        );
        
      case 'rejected':
        return (
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="bg-black/30 border-red-500 text-red-400 flex items-center mb-1 py-1.5">
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Beta Request Declined
            </Badge>
            <p className="text-xs text-gray-400">Please try again later</p>
          </div>
        );
        
      case 'none':
      default:
        return (
          <Button 
            variant="outline" 
            className="mt-1 bg-black text-[#4B9CD3] border-[#4B9CD3]/30 hover:bg-black/90 hover:text-[#4B9CD3] hover:border-[#4B9CD3]/50"
            onClick={requestBetaAccess}
            disabled={requesting}
          >
            {requesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>Request Beta Access</>
            )}
          </Button>
        );
    }
  };
  
  return (
    <div className="flex justify-center pb-1 pt-2">
      {renderButtonByStatus()}
    </div>
  );
};

export default BetaTesterRequestButton;