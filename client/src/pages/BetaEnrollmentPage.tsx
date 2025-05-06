import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { Loader2, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

/**
 * Beta Enrollment Page
 * Shown to users after authentication to opt into the beta program
 */
const BetaEnrollmentPage = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [betaRequested, setBetaRequested] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [hasAgreedToNDA, setHasAgreedToNDA] = useState(false);
  const [feedbackCommitment, setFeedbackCommitment] = useState(false);
  
  // Function to submit beta tester request
  const handleBetaRequest = async () => {
    if (!hasAgreedToTerms || !hasAgreedToNDA || !feedbackCommitment) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to all terms to join the beta program.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get access token for API call
      const token = await getAccessTokenSilently();
      
      // Submit beta tester request
      const response = await fetch('/api/auth0/request-beta-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user?.email,
          hasAgreedToTerms,
          hasAgreedToNDA,
          feedbackCommitment
        })
      });
      
      if (response.ok) {
        setBetaRequested(true);
        toast({
          title: 'Beta Request Submitted',
          description: 'Your beta tester request has been submitted for approval.',
          variant: 'default',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit beta request');
      }
    } catch (error) {
      console.error('Beta request error:', error);
      toast({
        title: 'Request Failed',
        description: error instanceof Error ? error.message : 'Failed to submit beta request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to skip beta enrollment and go to dashboard
  const skipBetaEnrollment = () => {
    toast({
      title: 'Welcome to Paddock20',
      description: 'You can request beta access anytime from your profile.',
      variant: 'default',
    });
    setLocation('/dashboard');
  };
  
  // If the request was submitted successfully, show confirmation
  if (betaRequested) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-[#1982FC] p-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-[#08c519] mx-auto" />
            <h1 className="text-2xl font-bold text-white">Beta Request Submitted</h1>
            <p className="text-gray-300">
              Thank you for your interest in the Paddock20 beta program. Your request has been submitted and is pending approval.
            </p>
            <p className="text-gray-400 text-sm">
              You'll receive an email notification when your request is approved.
            </p>
            <Button 
              className="mt-4 w-full bg-[#1982FC] hover:bg-[#1982FC]/80"
              onClick={() => setLocation('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-[#1982FC]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#1982FC] mb-2">Join the Paddock20 Beta Program</h1>
          <p className="text-gray-300 mb-6">
            Be among the first to experience the future of automotive lifestyle technology and help shape its evolution.
          </p>
          
          <Separator className="my-4 bg-gray-700" />
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={hasAgreedToTerms} 
                onCheckedChange={(checked) => setHasAgreedToTerms(checked as boolean)}
                className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
              />
              <div>
                <label htmlFor="terms" className="text-white font-medium cursor-pointer">
                  Terms and Conditions
                </label>
                <p className="text-gray-400 text-sm">
                  I agree to the Paddock20 <a href="/terms-of-service" target="_blank" className="text-[#1982FC] hover:underline">Terms of Service</a> and acknowledge that I am joining a pre-release program.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="nda" 
                checked={hasAgreedToNDA} 
                onCheckedChange={(checked) => setHasAgreedToNDA(checked as boolean)}
                className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
              />
              <div>
                <label htmlFor="nda" className="text-white font-medium cursor-pointer">
                  Confidentiality Agreement
                </label>
                <p className="text-gray-400 text-sm">
                  I agree to maintain confidentiality regarding unreleased features and will not share screenshots, videos, or detailed descriptions without permission.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="feedback" 
                checked={feedbackCommitment} 
                onCheckedChange={(checked) => setFeedbackCommitment(checked as boolean)}
                className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
              />
              <div>
                <label htmlFor="feedback" className="text-white font-medium cursor-pointer">
                  Feedback Commitment
                </label>
                <p className="text-gray-400 text-sm">
                  I commit to providing constructive feedback on features, usability, and performance to help improve the platform.
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6 bg-gray-700" />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={skipBetaEnrollment}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Skip for Now
            </Button>
            
            <Button 
              onClick={handleBetaRequest}
              disabled={isLoading || !hasAgreedToTerms || !hasAgreedToNDA || !feedbackCommitment}
              className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request
                </>
              ) : (
                'Request Beta Access'
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="mt-4 text-center text-gray-500 text-sm">
        You can request beta access anytime from your user profile
      </div>
    </div>
  );
};

export default BetaEnrollmentPage;