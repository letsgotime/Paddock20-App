import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * SmartcarCallback Component
 * 
 * This component handles the OAuth callback from Smartcar
 * It processes the authorization code and exchanges it for access tokens
 */
const SmartcarCallback = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/smartcar/callback');
  const [status, setStatus] = useState('Processing your vehicle connection...');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError(`Authorization failed: ${errorParam}`);
      toast({
        title: 'Connection Failed',
        description: `Vehicle connection failed: ${errorParam}`,
        variant: 'destructive',
      });
      
      // Redirect back to garage after a short delay
      setTimeout(() => {
        setLocation('/garage');
      }, 3000);
      
      return;
    }
    
    if (!code) {
      setError('Missing authorization code');
      
      // Redirect back to garage after a short delay
      setTimeout(() => {
        setLocation('/garage');
      }, 3000);
      
      return;
    }
    
    // Exchange the authorization code for tokens
    const exchangeCode = async () => {
      try {
        // The actual code exchange happens on the server side
        const response = await apiRequest('GET', `/api/smartcar/exchange?code=${code}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('Vehicle connected successfully!');
          toast({
            title: 'Connection Successful',
            description: 'Your vehicle was connected successfully.',
            variant: 'default',
          });
          
          // Redirect to garage page after a short delay
          setTimeout(() => {
            setLocation('/garage');
          }, 2000);
        } else {
          setError(data.error || 'Failed to connect vehicle');
          toast({
            title: 'Connection Failed',
            description: data.error || 'There was a problem connecting your vehicle',
            variant: 'destructive',
          });
          
          // Redirect to garage page after a short delay
          setTimeout(() => {
            setLocation('/garage');
          }, 3000);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during vehicle connection');
        toast({
          title: 'Connection Error',
          description: err.message || 'An error occurred during vehicle connection',
          variant: 'destructive',
        });
        
        // Redirect to garage page after a short delay
        setTimeout(() => {
          setLocation('/garage');
        }, 3000);
      }
    };
    
    exchangeCode();
  }, [setLocation, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="text-center max-w-md">
        {error ? (
          <div className="p-4 rounded-md bg-red-900/20 border border-red-600">
            <h2 className="text-xl font-bold text-red-500 mb-2">Connection Error</h2>
            <p className="text-white">{error}</p>
            <p className="text-zinc-400 mt-4">Redirecting back to the garage...</p>
          </div>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-[#1982FC] mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{status}</h2>
            <p className="text-zinc-400">
              Please wait while we establish a secure connection to your vehicle.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartcarCallback;