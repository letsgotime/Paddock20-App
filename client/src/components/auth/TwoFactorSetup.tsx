import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TwoFactorSetupProps {
  userId: number;
  onComplete: (enabled: boolean) => void;
  onCancel: () => void;
}

export function TwoFactorSetup({ userId, onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'initial' | 'verify' | 'backupCodes'>('initial');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Initialize 2FA setup
  const initSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/setup', { userId });
      const data = await response.json();
      
      if (response.ok) {
        setSecret(data.secret);
        setQrCode(data.otpAuthUrl);
        setStep('verify');
      } else {
        setError(data.error || 'Failed to initialize 2FA setup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('2FA setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify and enable 2FA
  const verifyAndEnable = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/verify', {
        userId,
        secret,
        token: verificationCode
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setStep('backupCodes');
        toast({
          title: '2FA Enabled Successfully',
          description: 'Your account is now protected with two-factor authentication',
          variant: 'success'
        });
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('2FA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast({
      title: 'Backup Codes Copied',
      description: 'Save these codes in a secure location',
      variant: 'default'
    });
  };

  // Handle verification code input
  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const code = e.target.value.replace(/[^0-9]/g, '').substring(0, 6);
    setVerificationCode(code);
  };

  // Complete 2FA setup
  const completeSetup = () => {
    onComplete(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-blue-500 shadow-blue-500/20 shadow-lg bg-[#111115] text-white">
        <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-slate-900 to-blue-900 rounded-t-lg">
          <CardTitle className="flex items-center text-xl font-racing">
            <ShieldCheck className="h-6 w-6 mr-2 text-[#08c519]" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-blue-300">
            F1-Grade Security for Your Paddock20 Account
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

          {step === 'initial' && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-slate-800/50 border border-blue-500/30">
                <h3 className="text-lg font-medium mb-2 text-blue-300">Enhance Your Security</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Two-factor authentication adds an extra layer of security to your account, requiring 
                  both your password and a verification code from an authenticator app. Like a pit wall 
                  security checkpoint, it ensures only you can access your Paddock20 data.
                </p>
                <div className="flex items-center p-2 rounded-md bg-yellow-900/20 border border-yellow-600/30">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                  <span className="text-xs text-yellow-300">
                    You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden border border-blue-500/50 p-1 bg-white">
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code for 2FA" className="max-w-full h-auto" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-md font-medium text-blue-300">Setup Instructions:</h3>
                <ol className="list-decimal list-inside text-sm space-y-2 text-gray-300">
                  <li>Open your authenticator app</li>
                  <li>Scan the QR code above or manually enter the secret key</li>
                  <li>Enter the 6-digit verification code shown in your app</li>
                </ol>
              </div>
              
              <div className="p-3 rounded-md bg-blue-900/20 border border-blue-500/30 flex items-center">
                <p className="text-xs font-mono bg-black/30 p-2 rounded flex-1 overflow-x-auto text-blue-300">
                  {secret}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 h-8 text-xs border-blue-500/70 bg-blue-900/20 hover:bg-blue-900/50"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    toast({
                      title: "Secret Copied",
                      description: "The secret key has been copied to clipboard",
                      variant: "default"
                    });
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium text-gray-300">
                  Verification Code
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={handleCodeInput}
                  className="bg-slate-900 border-blue-500/50 focus-visible:ring-blue-500"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {step === 'backupCodes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-blue-900/20 border border-blue-500/30">
                <div className="flex items-center mb-3">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-[#08c519]" />
                  <h3 className="text-md font-medium text-blue-300">2FA Successfully Enabled</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Save these backup codes in a secure location. If you lose access to your 
                  authenticator app, you can use one of these one-time codes to sign in.
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 text-center font-mono text-xs bg-black/50 rounded border border-blue-900/50 text-blue-300">
                      {code}
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full text-xs bg-blue-900/30 hover:bg-blue-900/50"
                  onClick={copyBackupCodes}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy Backup Codes
                </Button>
              </div>
              
              <Alert className="bg-yellow-900/20 border-yellow-600/30">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">Important Safety Notice</AlertTitle>
                <AlertDescription className="text-yellow-300/80 text-xs">
                  Each backup code can only be used once. Keep these codes secure - like your race strategies, 
                  they should never fall into the wrong hands.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-gray-800 pt-4 bg-gradient-to-r from-slate-900 to-slate-800">
          {step === 'initial' && (
            <>
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-gray-600 hover:bg-slate-800 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={initSetup}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Get Started
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-gray-600 hover:bg-slate-800 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length < 6}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Enable
              </Button>
            </>
          )}

          {step === 'backupCodes' && (
            <Button 
              onClick={completeSetup}
              className="w-full bg-[#08c519] hover:bg-green-600 text-black font-bold"
            >
              Complete Setup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}