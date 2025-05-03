import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, Mail, KeyRound } from 'lucide-react';

// Import UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Login Form State
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // New Password with Token State
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          setAuthenticated(true);
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const userData = await response.json();
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.username}!`,
        variant: 'default',
      });
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Password Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
          firstName: registerData.firstName || undefined,
          lastName: registerData.lastName || undefined
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const userData = await response.json();
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully!',
        variant: 'default',
      });
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration error:', errorMessage);
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Forgot Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast({
        title: 'Input Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail
        })
      });
      
      // Always show success even if email not found for security reasons
      // The server will handle the check and only send email if user exists
      setResetEmailSent(true);
      
      toast({
        title: 'Email Sent',
        description: 'If your email is registered, you will receive password reset instructions.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      
      // Still show success message for security reasons
      setResetEmailSent(true);
      
      toast({
        title: 'Email Sent',
        description: 'If your email is registered, you will receive password reset instructions.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Password Reset (with token)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Password Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/reset-password/${resetToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password reset failed');
      }
      
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now log in with your new password.',
        variant: 'default',
      });
      
      // Hide reset form and show login tab
      setShowResetPassword(false);
      setShowForgotPassword(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      console.error('Password reset error:', errorMessage);
      
      toast({
        title: 'Password Reset Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while authentication check is in progress
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect if authenticated
  if (authenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Auth Forms */}
        <div className="flex flex-col justify-center">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="text-lg">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-lg">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-100">Welcome back</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                          {showLoginPassword ? 
                            <EyeOff className="h-5 w-5 text-gray-400" /> : 
                            <Eye className="h-5 w-5 text-gray-400" />
                          }
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Sign In'}
                      <LogIn className="ml-2 h-5 w-5" />
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
              
              {/* Forgot Password Modal */}
              {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                  <Card className="border-gray-800 bg-gray-900 w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-100">Reset Your Password</CardTitle>
                      <CardDescription className="text-gray-400">
                        {resetEmailSent ? 
                          'Check your email for reset instructions' : 
                          'Enter your email address to receive a password reset link'
                        }
                      </CardDescription>
                    </CardHeader>
                    
                    {!resetEmailSent ? (
                      <form onSubmit={handleForgotPassword}>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email" className="text-white">Email Address</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                              required
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                          >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                            <Mail className="ml-2 h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                            onClick={() => setShowForgotPassword(false)}
                          >
                            Cancel
                          </Button>
                        </CardFooter>
                      </form>
                    ) : (
                      <CardFooter className="flex flex-col gap-4">
                        <p className="text-green-400 text-center">
                          If your email exists in our system, you'll receive instructions to reset your password.
                        </p>
                        <Button
                          type="button"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetEmailSent(false);
                            setForgotPasswordEmail('');
                          }}
                        >
                          Back to Login
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              )}
              
              {/* Reset Password Modal (with token) */}
              {showResetPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                  <Card className="border-gray-800 bg-gray-900 w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-100">Create New Password</CardTitle>
                      <CardDescription className="text-gray-400">
                        Choose a new secure password for your account
                      </CardDescription>
                    </CardHeader>
                    
                    <form onSubmit={handleResetPassword}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password" className="text-white">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                              {showNewPassword ? 
                                <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                <Eye className="h-5 w-5 text-gray-400" />
                              }
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password" className="text-white">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-new-password"
                              type={showConfirmNewPassword ? 'text' : 'password'}
                              placeholder="Confirm new password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                              {showConfirmNewPassword ? 
                                <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                <Eye className="h-5 w-5 text-gray-400" />
                              }
                            </button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={loading}
                        >
                          {loading ? 'Resetting...' : 'Reset Password'}
                          <KeyRound className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-gray-700 hover:bg-gray-800 text-white"
                          onClick={() => setShowResetPassword(false)}
                        >
                          Cancel
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-100">Create an account</CardTitle>
                  <CardDescription className="text-gray-400">
                    Join the Paddock20 community
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username-register" className="text-white">Username</Label>
                      <Input
                        id="username-register"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password-register" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="password-register"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                          {showRegisterPassword ? 
                            <EyeOff className="h-5 w-5 text-gray-400" /> : 
                            <Eye className="h-5 w-5 text-gray-400" />
                          }
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                          {showConfirmPassword ? 
                            <EyeOff className="h-5 w-5 text-gray-400" /> : 
                            <Eye className="h-5 w-5 text-gray-400" />
                          }
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Create Account'}
                      <UserPlus className="ml-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Hero Content */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">Paddock20</h1>
            <h2 className="text-2xl text-gray-300">Your Ultimate Automotive Companion</h2>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold mb-1">Drive Intelligence</h3>
              <p className="text-gray-400">Track weather conditions, plan routes, and log your drives with F1-inspired telemetry displays.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold mb-1">Detailing Excellence</h3>
              <p className="text-gray-400">Manage your detailing schedule, track products, and maintain a complete history of your vehicle's appearance.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-semibold mb-1">Automotive Community</h3>
              <p className="text-gray-400">Connect with fellow enthusiasts, share your garage, and participate in exclusive automotive events.</p>
            </div>
            
            <p className="text-sm text-gray-500 mt-8">By signing up, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
      
      <footer className="absolute bottom-0 left-0 w-full py-4 text-center text-sm text-gray-500 bg-black bg-opacity-80">
        © 2025 GoTime Motorsports™ - Bespoke Technology Syndicate™ (BTS™). Capital Made Tangible.
      </footer>
    </div>
  );
};

export default AuthPage;