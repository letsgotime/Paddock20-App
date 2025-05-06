import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth0Management } from '@/services/auth0Management';
import { Loader2 } from 'lucide-react';

/**
 * Button component that allows users to request beta tester status
 */
const BetaTesterRequestButton = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();
  const { checkBetaTesterStatus, requestBetaTesterStatus } = useAuth0Management();
  
  const betaStatus = checkBetaTesterStatus();
  
  const handleRequestBetaStatus = async () => {
    setIsRequesting(true);
    
    try {
      const success = await requestBetaTesterStatus();
      
      if (success) {
        toast({
          title: 'Beta Tester Request Submitted',
          description: 'Your application for beta tester status has been submitted. You will receive an email when approved.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Request Failed',
          description: 'There was an error submitting your beta tester request. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to request beta status:', error);
      toast({
        title: 'Request Failed',
        description: 'There was an error submitting your beta tester request. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };
  
  // Already a beta tester
  if (betaStatus === 'approved') {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-md">
        <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
        <span className="text-sm text-emerald-400 font-medium">
          Beta Tester Status: Active
        </span>
      </div>
    );
  }
  
  // Pending approval
  if (betaStatus === 'pending') {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-900/20 border border-amber-600/30 rounded-md">
        <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></div>
        <span className="text-sm text-amber-400 font-medium">
          Beta Tester Status: Awaiting Approval
        </span>
      </div>
    );
  }
  
  // Not authenticated
  if (betaStatus === 'not_authenticated') {
    return null;
  }
  
  // Default: user can request beta access
  return (
    <Button
      onClick={handleRequestBetaStatus}
      disabled={isRequesting}
      className="bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:bg-gradient-to-r hover:from-[#1982FC]/90 hover:to-[#08c519]/90 text-white"
    >
      {isRequesting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Request Beta Tester Access'
      )}
    </Button>
  );
};

export default BetaTesterRequestButton;