import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  userId?: number;
}

export function TwoFactorSetup({ onComplete, userId }: TwoFactorSetupProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTwoFactorSetupData();
  }, [userId]);

  const fetchTwoFactorSetupData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate new 2FA secret for the user
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId || (user?.id || 0) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set up 2FA');
      }

      const data = await response.json();
      setSecret(data.secret);

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(data.otpAuthUrl);
      setQrCodeDataUrl(qrCodeUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verify the code and enable 2FA
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userId || (user?.id || 0),
          secret,
          token: verificationCode
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify code');
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setSuccess('Two-factor authentication enabled successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-black/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-gray-400">
          Secure your account with two-factor authentication
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && !showBackupCodes ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-gray-400">Setting up two-factor authentication...</p>
          </div>
        ) : showBackupCodes ? (
          <>
            <div className="space-y-2">
              <Alert variant="default" className="border-blue-500 bg-blue-950/50">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm">
                  Keep these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-900 p-4 rounded border border-gray-700 my-3">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm text-blue-400 font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                1. Download an authenticator app like Google Authenticator or Authy
              </p>
              <p className="text-gray-300 text-sm">
                2. Scan this QR code with the app
              </p>
              <p className="text-gray-300 text-sm">
                3. Enter the verification code provided by the app
              </p>
            </div>

            <div className="flex justify-center my-4">
              {qrCodeDataUrl && (
                <div className="p-2 bg-white rounded">
                  <img src={qrCodeDataUrl} alt="QR Code for 2FA" width={200} height={200} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-500 bg-red-950/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && !showBackupCodes && (
          <Alert variant="default" className="border-green-500 bg-green-950/50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {!showBackupCodes ? (
          <Button 
            onClick={handleVerify} 
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify & Enable'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Complete Setup
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}