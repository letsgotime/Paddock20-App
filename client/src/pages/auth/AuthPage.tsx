import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
  // Authentication context
  const { user, login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract redirect location and error messages from URL query params
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const errorMessage = searchParams.get('error');
  const infoMessage = searchParams.get('message');

  // Form state
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot password form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  // Set any URL query errors/messages to form state
  useEffect(() => {
    if (errorMessage) {
      setFormError(errorMessage);
    }
    if (infoMessage) {
      setFormSuccess(infoMessage);
    }
  }, [errorMessage, infoMessage]);
  
  // Handle redirect if already authenticated (using useEffect to avoid React errors)
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!loginForm.username.trim() || !loginForm.password) {
        throw new Error('Please enter both username and password');
      }

      // Attempt login
      await login(loginForm.username, loginForm.password);
      setFormSuccess('Login successful! Redirecting...');

      // Redirect on success to the original requested page or dashboard
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      // Display error message
      setFormError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Call forgot password API
      const response = await fetch('/api/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      // Show success message
      setFormSuccess(data.message || 'Password reset link sent. Please check your email.');
      
      // Clear email field
      setForgotPasswordEmail('');
      
      // After 3 seconds, go back to login
      setTimeout(() => {
        setAuthMode('login');
      }, 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!registerForm.username.trim()) {
        throw new Error('Please enter a username');
      }
      if (!registerForm.email.trim() || !registerForm.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (!registerForm.password) {
        throw new Error('Please enter a password');
      }
      if (registerForm.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Attempt registration
      await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        firstName: registerForm.firstName || undefined,
        lastName: registerForm.lastName || undefined
      });

      setFormSuccess('Registration successful! Redirecting...');

      // Redirect on success to the original requested page or dashboard
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      // Display error message
      setFormError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left column - Auth forms */}
        <div className="w-full md:w-1/2 max-w-md">
          <Card className="w-full shadow-lg backdrop-blur-sm bg-black/50 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Paddock20</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to access your automotive experience
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="login" value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register' | 'forgot-password')}>
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button 
                          type="button"
                          onClick={() => setAuthMode('forgot-password')} 
                          className="text-xs text-blue-500 hover:text-blue-400"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="First Name"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last Name"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regUsername">Username</Label>
                      <Input
                        id="regUsername"
                        placeholder="Choose a username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Password</Label>
                      <Input
                        id="regPassword"
                        type="password"
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="forgot-password">
                <form onSubmit={handleForgotPassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgotPasswordEmail">Email Address</Label>
                      <Input
                        id="forgotPasswordEmail"
                        type="email"
                        placeholder="Enter your email address"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      Enter the email address associated with your account, and we'll send you a link to reset your password.
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Reset Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="link" 
                      className="w-full"
                      onClick={() => setAuthMode('login')}
                    >
                      Back to Login
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>

            {/* Error message */}
            {formError && (
              <div className="px-6 pb-4">
                <Alert variant="destructive" className="border-red-500 bg-red-950/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Success message */}
            {formSuccess && (
              <div className="px-6 pb-4">
                <Alert variant="default" className="border-green-500 bg-green-950/50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{formSuccess}</AlertDescription>
                </Alert>
              </div>
            )}
          </Card>
        </div>

        {/* Right column - Hero content */}
        <div className="w-full md:w-1/2 text-center md:text-left text-white space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Welcome to Paddock20</h1>
            <p className="text-xl text-gray-400">The ultimate automotive enthusiast platform</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Join the Paddock20 community to access:
            </p>
            
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>Advanced automotive telemetry analytics</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>Weather insights for optimal driving</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>Vehicle maintenance tracking</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>Route planning for scenic drives</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>Access to enthusiast community</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8">
            <div className="inline-block p-4 rounded-lg bg-black/40 border border-gray-800">
              <p className="text-gray-400 italic">
                "Paddock20 transformed how I track and maintain my vehicles. The interface is intuitive and the data insights are incredible."
              </p>
              <p className="mt-2 text-blue-400 font-medium">— James H., Automotive Enthusiast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}