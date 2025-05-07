import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldCheck, QrCode, AlertTriangle, CheckCircle2, Copy, KeyRound } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TwoFactorSetupProps {
  userId: number;
  onComplete: (enabled: boolean) => void;
  onCancel: () => void;
}

export function TwoFactorSetup({ userId, onComplete, onCancel }: TwoFactorSetupProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'init' | 'verify' | 'complete'>('init');
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeUrl: string;
  } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  // Generate initial 2FA setup
  useEffect(() => {
    const generateSetup = async () => {
      try {
        setLoading(true);
        setError('');
        
        const res = await apiRequest('POST', '/api/2fa/setup', { userId });
        const data = await res.json();
        
        setSetupData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set up 2FA');
      } finally {
        setLoading(false);
      }
    };
    
    generateSetup();
  }, [userId]);
  
  // Handle verification code input
  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const code = e.target.value.replace(/[^0-9]/g, '').substring(0, 6);
    setVerificationCode(code);
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // Verify setup
  const handleVerify = async () => {
    if (!setupData) return;
    
    try {
      setLoading(true);
      setError('');
      
      const res = await apiRequest('POST', '/api/2fa/verify', {
        userId,
        secret: setupData.secret,
        token: verificationCode
      });
      
      const data = await res.json();
      
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep('complete');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };
  
  // Complete setup
  const handleComplete = () => {
    onComplete(true);
  };
  
  // Render QR code and setup instructions
  const renderSetupInstructions = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/20 p-4 rounded-md border border-blue-500/30">
        <h3 className="text-blue-300 font-medium mb-2 flex items-center">
          <ShieldCheck className="h-5 w-5 mr-1.5 text-[#08c519]" />
          Enhanced Security Protocol
        </h3>
        <p className="text-sm text-gray-300">
          Two-factor authentication adds an extra layer of security to your account. 
          After setup, you'll need both your password and a verification code from your 
          authentication app to sign in.
        </p>
      </div>
      
      {setupData && (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center">
              <div className="mb-2 text-sm text-gray-400 text-center">Scan with your authenticator app</div>
              <div className="bg-white p-2 rounded-md mb-2">
                <img 
                  src={setupData.qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                Google Authenticator, Authy, or any TOTP app
              </div>
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <Label htmlFor="secret" className="text-sm text-gray-400">Manual Entry Code</Label>
                <div className="flex mt-1">
                  <Input 
                    id="secret"
                    value={setupData.secret}
                    readOnly
                    className="bg-gray-900 border-gray-700 font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="ml-2 border-blue-500/30 hover:bg-blue-900/30"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If you can't scan the QR code, enter this code manually in your app
                </p>
              </div>
              
              <Separator className="my-6 bg-gray-800" />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-blue-300">Setup Instructions:</h4>
                <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5">
                  <li>Download an authenticator app like Google Authenticator or Authy</li>
                  <li>Scan the QR code or enter the manual code</li>
                  <li>Enter the 6-digit verification code from your app below</li>
                </ol>
              </div>
            </div>
          </div>
          
          <Separator className="my-3 bg-gray-800" />
          
          <div className="space-y-3">
            <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-300">
              Verification Code
            </Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={handleCodeInput}
              className="bg-gray-900 border-blue-500/50 focus-visible:ring-blue-500 font-mono text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-gray-400">
              Enter the 6-digit code shown in your authenticator app
            </p>
          </div>
        </>
      )}
    </div>
  );
  
  // Render backup codes and completion instructions
  const renderBackupCodes = () => (
    <div className="space-y-6">
      <div className="bg-green-900/20 p-4 rounded-md border border-green-500/30">
        <h3 className="text-green-300 font-medium mb-2 flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-1.5 text-[#08c519]" />
          Two-Factor Authentication Enabled
        </h3>
        <p className="text-sm text-gray-300">
          Your account is now protected with two-factor authentication. 
          You'll need to enter a verification code from your authenticator app 
          each time you sign in.
        </p>
      </div>
      
      <div className="bg-amber-900/20 p-4 rounded-md border border-amber-500/30">
        <h3 className="text-amber-300 font-medium mb-2 flex items-center">
          <KeyRound className="h-5 w-5 mr-1.5" />
          Save Your Backup Codes
        </h3>
        <p className="text-sm text-gray-300">
          If you lose access to your authenticator app, you can use one of these backup 
          codes to sign in. Each code can only be used once. Store them in a secure place.
        </p>
      </div>
      
      <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
        <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-300">Backup Codes</h4>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-8 border-gray-600 hover:bg-gray-700"
            onClick={() => copyToClipboard(backupCodes.join('\n'))}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy All
          </Button>
        </div>
        
        <ScrollArea className="h-48 p-3">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-gray-800 py-1 px-2 rounded font-mono text-sm flex-1 mr-1">
                  {code}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(code)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <Alert variant="default" className="bg-blue-900/10 border-blue-500/30">
        <AlertTriangle className="h-4 w-4 text-blue-400" />
        <AlertTitle className="text-blue-300">Important</AlertTitle>
        <AlertDescription className="text-gray-300 text-sm">
          If you lose access to your authenticator app and don't have backup codes, 
          you'll need to contact support to regain access to your account.
        </AlertDescription>
      </Alert>
    </div>
  );
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-blue-500 shadow-blue-500/20 shadow-lg bg-[#111115] text-white">
        <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-slate-900 to-blue-900 rounded-t-lg">
          <CardTitle className="flex items-center text-xl font-racing tracking-wider">
            <ShieldCheck className="h-6 w-6 mr-2 text-[#08c519]" />
            F1-GRADE SECURITY SETUP
          </CardTitle>
          <CardDescription className="text-blue-300">
            Configure two-factor authentication to protect your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Setup Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading && step === 'init' ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-300">Initializing security protocol...</p>
            </div>
          ) : step === 'init' ? (
            renderSetupInstructions()
          ) : step === 'complete' ? (
            renderBackupCodes()
          ) : null}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-gray-800 pt-4 bg-gradient-to-r from-slate-900 to-slate-800">
          {step === 'init' ? (
            <>
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-gray-600 hover:bg-slate-800 text-gray-300"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6 || !setupData}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                Verify & Enable
              </Button>
            </>
          ) : step === 'complete' ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Print backup codes
                  const printContent = `
                    <html>
                      <head>
                        <title>2FA Backup Codes</title>
                        <style>
                          body { font-family: system-ui, sans-serif; padding: 20px; }
                          h1 { font-size: 18px; margin-bottom: 15px; }
                          .code { font-family: monospace; padding: 5px; background: #f0f0f0; margin: 5px; display: inline-block; }
                          p { color: #555; font-size: 14px; }
                        </style>
                      </head>
                      <body>
                        <h1>Your Paddock20 Backup Codes</h1>
                        <p>Keep these codes in a safe place. Each code can only be used once.</p>
                        <div>
                          ${backupCodes.map(code => `<div class="code">${code}</div>`).join('')}
                        </div>
                      </body>
                    </html>
                  `;
                  
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="border-gray-600 hover:bg-slate-800 text-gray-300"
              >
                Print Backup Codes
              </Button>
              <Button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            </>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}