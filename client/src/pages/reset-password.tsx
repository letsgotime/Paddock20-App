import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/services/supabaseClient';

/**
 * Reset Password page for Supabase authentication
 * Allows users to set a new password after clicking a reset link
 */
const ResetPassword: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully reset.',
          variant: 'default',
        });
        
        // Redirect to login after a delay
        setTimeout(() => {
          setLocation('/auth');
        }, 3000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        {/* F1-inspired racing stripe */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1982FC]" />
        <div className="absolute top-0 left-2 w-1 h-full bg-[#08c519]" />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide mb-2">
            RESET PASSWORD
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your new password below
          </p>
        </div>
        
        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#08c519]" />
            <p className="text-white">Your password has been reset successfully!</p>
            <p className="text-gray-400 text-sm">Redirecting you to the login page...</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-900 rounded-md flex items-start space-x-3">
                <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-300 font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm text-gray-300 font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reset Password
            </Button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setLocation('/auth')}
                className="text-sm text-[#1982FC] hover:text-[#1982FC]/80"
              >
                Return to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;