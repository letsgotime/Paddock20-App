import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, AlertTriangle, Timer, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TwoFactorVerificationProps {
  username: string;
  onVerify: (code: string, useBackupCode: boolean) => Promise<void>;
  onCancel: () => void;
}

export function TwoFactorVerification({ username, onVerify, onCancel }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'app' | 'backup'>('app');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Countdown timer for TOTP code refresh
  useEffect(() => {
    if (activeTab !== 'app') return;
    
    // Calculate initial seconds remaining based on current time
    const initialSeconds = 30 - (Math.floor(Date.now() / 1000) % 30);
    setTimeRemaining(initialSeconds);
    
    const intervalId = setInterval(() => {
      const secondsRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeRemaining(secondsRemaining);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [activeTab]);
  
  // Handle verification code input
  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const code = e.target.value.replace(/[^0-9]/g, '').substring(0, 6);
    setVerificationCode(code);
  };
  
  // Handle backup code input
  const handleBackupCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow alphanumeric characters
    setBackupCode(e.target.value);
  };
  
  // Submit verification
  const handleSubmit = async () => {
    if (activeTab === 'app' && verificationCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code');
      return;
    }
    
    if (activeTab === 'backup' && backupCode.trim() === '') {
      setError('Please enter your backup code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onVerify(
        activeTab === 'app' ? verificationCode : backupCode,
        activeTab === 'backup'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-blue-500 shadow-blue-500/20 shadow-lg bg-[#111115] text-white">
        <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-slate-900 to-blue-900 rounded-t-lg">
          <CardTitle className="flex items-center text-xl font-racing">
            <ShieldCheck className="h-6 w-6 mr-2 text-[#08c519]" />
            Security Checkpoint
          </CardTitle>
          <CardDescription className="text-blue-300">
            Enter your two-factor authentication code
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-4">
            <div className="p-3 rounded-md bg-slate-800/50 border border-blue-500/30 mb-4">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-blue-300">Driver Authentication Required: </span>
                Please enter the verification code for <span className="font-semibold text-white">{username}</span>
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'app' | 'backup')} className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-slate-800">
              <TabsTrigger value="app" className="data-[state=active]:bg-blue-900/50">
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-1.5" />
                  <span>App Code</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="backup" className="data-[state=active]:bg-blue-900/50">
                <div className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-1.5" />
                  <span>Backup Code</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="app" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="verificationCode" className="text-sm font-medium text-gray-300">
                    Authentication Code
                  </label>
                  <div className="flex items-center bg-blue-900/20 px-2 py-1 rounded text-xs text-blue-300 border border-blue-500/20">
                    <Timer className="h-3 w-3 mr-1 text-[#08c519]" />
                    <span>Refreshes in <span className="font-mono font-bold">{timeRemaining}s</span></span>
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    id="verificationCode"
                    ref={inputRef}
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={handleCodeInput}
                    onKeyDown={handleKeyDown}
                    className="bg-slate-900 border-blue-500/50 focus-visible:ring-blue-500 font-mono text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <p className="text-xs text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="backup" className="space-y-4 mt-4">
              <div className="space-y-3">
                <label htmlFor="backupCode" className="text-sm font-medium text-gray-300">
                  Backup Authentication Code
                </label>
                
                <Input
                  id="backupCode"
                  type="text"
                  placeholder="Enter backup code"
                  value={backupCode}
                  onChange={handleBackupCodeInput}
                  onKeyDown={handleKeyDown}
                  className="bg-slate-900 border-blue-500/50 focus-visible:ring-blue-500 font-mono"
                />
                
                <div className="flex items-center p-2 rounded-md bg-yellow-900/20 border border-yellow-600/30">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="text-xs text-yellow-300">
                    Use a backup code only if you cannot access your authenticator app. Each code can only be used once.
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-gray-800 pt-4 bg-gradient-to-r from-slate-900 to-slate-800">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-600 hover:bg-slate-800 text-gray-300"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || (activeTab === 'app' && verificationCode.length !== 6) || (activeTab === 'backup' && !backupCode)}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Verify'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}