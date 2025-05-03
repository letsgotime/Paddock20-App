import React, { useState } from 'react';
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
import { Loader2, AlertCircle, LockKeyhole } from 'lucide-react';

interface TwoFactorVerificationProps {
  username: string;
  onVerify: (code: string, useBackupCode: boolean) => Promise<void>;
  onCancel: () => void;
}

export function TwoFactorVerification({ username, onVerify, onCancel }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onVerify(verificationCode, isUsingBackupCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
      setIsLoading(false);
    }
  };

  const toggleBackupCodeMode = () => {
    setVerificationCode('');
    setIsUsingBackupCode(!isUsingBackupCode);
    setError(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-black/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-gray-400">
          Enter the verification code to continue
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/50 flex items-center space-x-4">
            <div className="bg-blue-600 rounded-full p-2">
              <LockKeyhole className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-200">
                {username} has two-factor authentication enabled
              </p>
              <p className="text-xs text-blue-400">
                {isUsingBackupCode 
                  ? 'Enter one of your backup codes' 
                  : 'Enter the code from your authenticator app'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationCode">
              {isUsingBackupCode ? 'Backup Code' : 'Verification Code'}
            </Label>
            <Input
              id="verificationCode"
              placeholder={isUsingBackupCode ? "Enter backup code" : "Enter 6-digit code"}
              maxLength={isUsingBackupCode ? 10 : 6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(
                isUsingBackupCode 
                  ? e.target.value 
                  : e.target.value.replace(/[^0-9]/g, '')
              )}
              className="bg-gray-900 border-gray-700"
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-500 bg-red-950/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Button 
              type="button"
              variant="link" 
              className="px-0 text-sm text-blue-500" 
              onClick={toggleBackupCodeMode}
            >
              {isUsingBackupCode
                ? "Use verification code instead"
                : "Use a backup code instead"}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-1/2 border-gray-700"
            disabled={isLoading}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-1/2 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || (isUsingBackupCode ? verificationCode.length < 8 : verificationCode.length !== 6)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}