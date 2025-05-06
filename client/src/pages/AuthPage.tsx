import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, CheckCircle, XCircle, Car, GaugeCircle, MapPin, Calendar, AreaChart, ArrowRight, ChevronRight, ChevronLeft, Award, Shield, Bell } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthPage = () => {
  const { login, register, loading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already logged in (using useEffect to avoid React Router warnings)
  React.useEffect(() => {
    console.log('AuthPage useEffect - user:', user ? 'authenticated' : 'not authenticated');
    
    if (user) {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/dashboard';
      
      // Navigate to the specified path or dashboard as default
      console.log('Redirecting authenticated user to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } else {
      console.log('User not authenticated, showing auth forms');
    }
  }, [user, navigate]);

  // Login Form State
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Multi-step registration state
  const [registrationStep, setRegistrationStep] = useState(1); // Tracks the current step (1, 2, or 3)
  
  // Register Form State
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    betaProgram: 'user', // 'user' or 'tester', default to 'user'
    hasAgreedToNDA: false,
    feedbackCommitment: false, // Only relevant for beta testers
    approvalStatus: '', // 'pending', 'approved', 'denied'
    registrationComplete: false
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  // Password validation
  useEffect(() => {
    const errors: string[] = [];
    const password = registerData.password;
    
    // Start with a strength of 0
    let strength = 0;
    
    // Check for minimum length (8 characters)
    if (password.length < 8) {
      errors.push('At least 8 characters');
    } else {
      strength += 20;
    }
    
    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    } else {
      strength += 20;
    }
    
    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    } else {
      strength += 20;
    }
    
    // Check for numbers
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number');
    } else {
      strength += 20;
    }
    
    // Check for special characters
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character');
    } else {
      strength += 20;
    }
    
    setPasswordStrength(strength);
    setPasswordErrors(errors);
  }, [registerData.password]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(loginData.username, loginData.password);
      // No need to show toast or navigate - handled in AuthContext
    } catch (error) {
      // Error toast is handled in AuthContext
      console.error('Login failed:', error);
    }
  };

  // Handle Register - simplified for direct Auth0 redirect
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registrationStep === 1) {
      // First step validation - basic user info
      
      // Validate password requirements
      if (passwordErrors.length > 0) {
        toast({
          title: 'Password Requirements Not Met',
          description: 'Please ensure your password meets all the requirements.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate password match
      if (registerData.password !== registerData.confirmPassword) {
        toast({
          title: 'Password Error',
          description: 'Passwords do not match.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        toast({
          title: 'Email Error',
          description: 'Please enter a valid email address.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate username length
      if (registerData.username.length < 3) {
        toast({
          title: 'Username Error',
          description: 'Username must be at least 3 characters long.',
          variant: 'destructive',
        });
        return;
      }
      
      // Setting default values for simplified flow
      setRegisterData({
        ...registerData,
        hasAgreedToNDA: true,  // Will be asked in beta modal later
        betaProgram: 'user'    // Default to user type
      });
      
      // Proceed with Auth0 signup
      // Move to beta program selection
      setRegistrationStep(2);
      return;
    }
    
    if (registrationStep === 2) {
      // Beta program selection validation
      if (!registerData.betaProgram) {
        toast({
          title: 'Beta Program Selection Required',
          description: 'Please select either Beta User or Beta Tester to continue.',
          variant: 'destructive',
        });
        return;
      }
      
      // For Beta Testers, they need to agree to provide feedback
      if (registerData.betaProgram === 'tester' && !registerData.feedbackCommitment) {
        toast({
          title: 'Feedback Commitment Required',
          description: 'Beta Testers must commit to providing detailed feedback.',
          variant: 'destructive',
        });
        return;
      }
      
      // Move to confirmation step
      setRegistrationStep(3);
      return;
    }
    
    if (registrationStep === 3) {
      // Final registration submission
      try {
        // For beta users, immediately register and grant access
        if (registerData.betaProgram === 'user') {
          await register({
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
            confirmPassword: registerData.confirmPassword,
            firstName: registerData.firstName || undefined,
            lastName: registerData.lastName || undefined,
            betaProgram: registerData.betaProgram,
            hasAgreedToNDA: registerData.hasAgreedToNDA
          });
          // No need to show toast or navigate - handled in AuthContext
        } 
        // For beta testers, we'll send approval email
        else if (registerData.betaProgram === 'tester') {
          // Send approval request to support@gotimedigital.com
          // This would typically be an API call
          console.log('Sending Beta Tester approval request to support@gotimedigital.com');
          
          // For now, just show a confirmation message
          toast({
            title: 'Beta Tester Request Submitted',
            description: 'Your request has been sent for approval. You will receive an email with next steps.',
            variant: 'default',
          });
          
          // Reset the form for now
          setRegisterData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            betaProgram: '',
            hasAgreedToNDA: false,
            feedbackCommitment: false,
            approvalStatus: 'pending',
            registrationComplete: false
          });
          setRegistrationStep(1);
        }
      } catch (error) {
        // Error toast is handled in AuthContext
        console.error('Registration failed:', error);
      }
    }
  };

  // Ensure we're showing the correct content
  console.log('AuthPage rendering, registration step:', registrationStep);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Auth Forms */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
              PADDOCK<span style={{ color: '#08c519' }}>20</span>
            </h1>
            <p className="text-gray-300">Your automotive intelligence platform</p>
          </div>
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
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="bg-gray-800 border-gray-700 pr-10"
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
                  <CardFooter className="flex flex-col space-y-4">
                    {/* NDA agreement is now only visible during registration, not login */}
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Sign In'}
                      <LogIn className="ml-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader className="relative">
                  <div className="absolute -top-1 left-0 w-full flex justify-between items-center px-6 pt-4">
                    <div className="flex space-x-2">
                      <div className={`h-1 w-10 rounded-full ${registrationStep >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                      <div className={`h-1 w-10 rounded-full ${registrationStep >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                      <div className={`h-1 w-10 rounded-full ${registrationStep >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                    </div>
                    <div className="text-gray-400 text-xs">
                      Step {registrationStep} of 3
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-gray-100 mt-4">
                    Join the Grid!
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Thanks for visiting! Click next to setup your account, once completed you'll be invited to walkthrough our beta program to access the application.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4">
                    {registrationStep === 1 && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="First name"
                              value={registerData.firstName}
                              onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Last name"
                              value={registerData.lastName}
                              onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username-register">Username</Label>
                          <Input
                            id="username-register"
                            placeholder="Choose a username"
                            value={registerData.username}
                            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            className="bg-gray-800 border-gray-700"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="bg-gray-800 border-gray-700"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password-register">Password</Label>
                          <div className="relative">
                            <Input
                              id="password-register"
                              type={showRegisterPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              className="bg-gray-800 border-gray-700 pr-10"
                              required
                              aria-describedby="password-requirements"
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
                          
                          {/* Password strength indicator */}
                          {registerData.password.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>Password strength:</span>
                                <span className={
                                  passwordStrength < 40 ? 'text-red-500' : 
                                  passwordStrength < 80 ? 'text-yellow-500' : 
                                  'text-green-500'
                                }>
                                  {passwordStrength < 40 ? 'Weak' : 
                                   passwordStrength < 80 ? 'Medium' : 
                                   'Strong'}
                                </span>
                              </div>
                              
                              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    passwordStrength < 40 ? 'bg-red-500' : 
                                    passwordStrength < 80 ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${passwordStrength}%` }}
                                />
                              </div>
                              
                              {/* Password requirements list */}
                              <div className="text-xs space-y-1 mt-2" id="password-requirements">
                                <p className="text-gray-400">Your password must include:</p>
                                <ul className="space-y-1">
                                  <li className="flex items-center gap-1">
                                    {!/^.{8,}$/.test(registerData.password) ? 
                                      <XCircle className="h-3 w-3 text-red-500" /> : 
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    }
                                    <span className={!/^.{8,}$/.test(registerData.password) ? 'text-red-500' : 'text-green-500'}>
                                      At least 8 characters
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-1">
                                    {!/[A-Z]/.test(registerData.password) ? 
                                      <XCircle className="h-3 w-3 text-red-500" /> : 
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    }
                                    <span className={!/[A-Z]/.test(registerData.password) ? 'text-red-500' : 'text-green-500'}>
                                      At least one uppercase letter
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-1">
                                    {!/[a-z]/.test(registerData.password) ? 
                                      <XCircle className="h-3 w-3 text-red-500" /> : 
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    }
                                    <span className={!/[a-z]/.test(registerData.password) ? 'text-red-500' : 'text-green-500'}>
                                      At least one lowercase letter
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-1">
                                    {!/[0-9]/.test(registerData.password) ? 
                                      <XCircle className="h-3 w-3 text-red-500" /> : 
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    }
                                    <span className={!/[0-9]/.test(registerData.password) ? 'text-red-500' : 'text-green-500'}>
                                      At least one number
                                    </span>
                                  </li>
                                  <li className="flex items-center gap-1">
                                    {!/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password) ? 
                                      <XCircle className="h-3 w-3 text-red-500" /> : 
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    }
                                    <span className={!/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password) ? 'text-red-500' : 'text-green-500'}>
                                      At least one special character
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              value={registerData.confirmPassword}
                              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                              className="bg-gray-800 border-gray-700 pr-10"
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
                      </>
                    )}
                    
                    {registrationStep === 2 && (
                      <>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-100 mb-4">Select Your Beta Program Level</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Beta User Option */}
                              <div 
                                className={`p-4 border rounded-lg flex flex-col space-y-3 ${
                                  registerData.betaProgram === 'user' 
                                    ? 'border-emerald-600 bg-gray-800' 
                                    : 'border-gray-700 bg-gray-900'
                                } cursor-pointer transition-colors`}
                                onClick={() => setRegisterData({ ...registerData, betaProgram: 'user' })}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-full ${
                                    registerData.betaProgram === 'user' ? 'bg-emerald-600' : 'bg-gray-700'
                                  }`}>
                                    <Car className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-100">Beta User</h4>
                                    <p className="text-sm text-gray-400">Immediate access with discounted rates</p>
                                  </div>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                                    <span className="text-gray-300">Discounted subscription for life</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                                    <span className="text-gray-300">Auto-approved instant access</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                                    <span className="text-gray-300">Basic feedback requested</span>
                                  </li>
                                </ul>
                              </div>
                              
                              {/* Beta Tester Option */}
                              <div 
                                className={`p-4 border rounded-lg flex flex-col space-y-3 ${
                                  registerData.betaProgram === 'tester' 
                                    ? 'border-blue-600 bg-gray-800' 
                                    : 'border-gray-700 bg-gray-900'
                                } cursor-pointer transition-colors`}
                                onClick={() => setRegisterData({ ...registerData, betaProgram: 'tester' })}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-full ${
                                    registerData.betaProgram === 'tester' ? 'bg-blue-600' : 'bg-gray-700'
                                  }`}>
                                    <GaugeCircle className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-100">Beta Tester</h4>
                                    <p className="text-sm text-gray-400">Requires approval & detailed feedback</p>
                                  </div>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <span className="text-gray-300">Free subscription for life</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <span className="text-gray-300">Email approval required</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <span className="text-gray-300">Detailed feedback commitment</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          {/* Additional commitment for Beta Testers */}
                          {registerData.betaProgram === 'tester' && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
                              <h4 className="font-medium text-gray-100">Beta Tester Commitment</h4>
                              <p className="text-sm text-gray-400">
                                As a Beta Tester, you'll receive free access for life in exchange for your valuable feedback on features, usability, and bug reports.
                              </p>
                              <div className="flex items-start space-x-2">
                                <Checkbox 
                                  id="beta-tester-commitment" 
                                  className="mt-1 data-[state=checked]:bg-blue-600"
                                  checked={registerData.feedbackCommitment}
                                  onCheckedChange={(checked) => 
                                    setRegisterData({ ...registerData, feedbackCommitment: !!checked })
                                  }
                                  required={registerData.betaProgram === 'tester'}
                                />
                                <label htmlFor="beta-tester-commitment" className="text-sm text-gray-300">
                                  I commit to providing detailed feedback on features, reporting bugs, and participating in scheduled testing sessions when requested.
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    {registrationStep === 3 && (
                      <>
                        <div className="space-y-5">
                          <h3 className="text-lg font-medium text-gray-100">Confirm Your Registration Details</h3>
                          
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-blue-400 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                              PERSONAL INFORMATION
                            </h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <p className="text-gray-400">Name</p>
                                <p className="text-gray-200">{registerData.firstName || '-'} {registerData.lastName || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Username</p>
                                <p className="text-gray-200">{registerData.username}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Email</p>
                                <p className="text-gray-200">{registerData.email}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-emerald-400 flex items-center">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
                              BETA PROGRAM SELECTION
                            </h4>
                            <div className="text-sm">
                              <p className="text-gray-400">Beta Level</p>
                              <div className="flex items-center mt-1">
                                {registerData.betaProgram === 'user' ? (
                                  <>
                                    <div className="bg-emerald-600 p-1.5 rounded-full mr-2">
                                      <Car className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-emerald-400 font-medium">Beta User</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="bg-blue-600 p-1.5 rounded-full mr-2">
                                      <GaugeCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-blue-400 font-medium">Beta Tester</span>
                                  </>
                                )}
                              </div>
                              <p className="mt-2 text-gray-300">
                                {registerData.betaProgram === 'user' 
                                  ? 'You will have immediate access with discounted subscription rates for life.'
                                  : 'Your request will be sent for approval. If approved, you will receive free access for life.'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300 flex items-center">
                              <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
                              CONFIDENTIALITY STATUS
                            </h4>
                            <div className="flex items-center text-sm">
                              <Shield className="h-4 w-4 text-blue-400 mr-2" />
                              <span>
                                {registerData.hasAgreedToNDA 
                                  ? 'You have agreed to the confidentiality terms'
                                  : 'You must agree to the confidentiality terms to continue'}
                              </span>
                            </div>
                            {registerData.betaProgram === 'tester' && (
                              <div className="flex items-center text-sm mt-2">
                                <Bell className="h-4 w-4 text-blue-400 mr-2" />
                                <span>
                                  {registerData.feedbackCommitment 
                                    ? 'You have committed to providing detailed feedback'
                                    : 'You must commit to providing feedback to continue'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    {registrationStep === 1 && (
                      <>
                        <p className="text-xs text-gray-400 mb-4">
                          By continuing, you agree to our terms and will have a chance to review our beta program agreements after signup.
                        </p>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          disabled={loading}
                        >
                          Continue to Beta Program Selection
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </>
                    )}
                    
                    {registrationStep === 2 && (
                      <div className="flex justify-between w-full">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1 mr-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                          onClick={() => setRegistrationStep(1)}
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 ml-2 bg-emerald-600 hover:bg-emerald-700"
                          disabled={loading || !registerData.betaProgram || (registerData.betaProgram === 'tester' && !registerData.feedbackCommitment)}
                        >
                          Continue to Review
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    )}
                    
                    {registrationStep === 3 && (
                      <div className="flex justify-between w-full">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1 mr-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                          onClick={() => setRegistrationStep(2)}
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 ml-2 bg-emerald-600 hover:bg-emerald-700"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : (
                            registerData.betaProgram === 'user' 
                              ? 'Complete Registration' 
                              : 'Submit for Approval'
                          )}
                          <UserPlus className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Brand Hero */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="p-6 rounded-lg bg-gray-900 border border-gray-800">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2 text-[#1982FC]">PADDOCK20</h1>
              <p className="text-lg text-gray-200 italic mb-4">
                The bespoke automotive lifestyle platform with F1-precision intelligence that transforms everyday car care into a curated experience
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-[#1982FC] pl-4">
                <h3 className="text-xl font-semibold mb-1 text-white">Track maintenance, mods, and detailing with precision</h3>
                <p className="text-gray-400">A comprehensive system for all maintenance, modifications, and detailing records with F1-inspired interfaces</p>
              </div>
              
              <div className="border-l-4 border-[#08c519] pl-4">
                <h3 className="text-xl font-semibold mb-1 text-white">Discover perfect drives with Weather Paddock intelligence</h3>
                <p className="text-gray-400">Advanced weather telemetry and route planning designed specifically for the automotive enthusiast</p>
              </div>
              
              <div className="border-l-4 border-[#1982FC] pl-4">
                <h3 className="text-xl font-semibold mb-1 text-white">Level up with premium features for the complete enthusiast</h3>
                <p className="text-gray-400">Competitive goal tracking, performance analytics, and exclusive automotive experiences</p>
              </div>
              
              <div className="bg-[#1982FC]/10 border border-[#1982FC]/50 rounded-lg p-4 mt-6">
                <h4 className="text-xl font-bold text-[#1982FC] mb-2 text-center">BETA ACCESS</h4>
                <p className="text-gray-300 text-center mb-4">
                  Join the movement. Full access to our complete ecosystem during the exclusive beta phase
                </p>
                <div className="flex justify-center">
                  <button className="bg-[#08c519] hover:bg-[#08c519]/80 text-white font-bold py-3 px-6 rounded-md transition-all">
                    Join the Grid!
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                By signing up, you agree to our <a href="/terms-of-service" className="text-[#1982FC] hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-[#1982FC] hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;