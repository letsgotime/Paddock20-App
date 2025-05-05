import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, CheckCircle, XCircle, Car, GaugeCircle, MapPin, Calendar, AreaChart } from 'lucide-react';

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

const AuthPage: React.FC = () => {
  const { login, register, loading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already logged in (using useEffect to avoid React Router warnings)
  React.useEffect(() => {
    if (user) {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || '/dashboard';
      
      // Navigate to the specified path or dashboard as default
      navigate(redirectPath, { replace: true });
      console.log('Redirecting authenticated user to:', redirectPath);
    }
  }, [user, navigate]);

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
    lastName: '',
    betaProgram: '', // 'user' or 'tester'
    hasAgreedToNDA: false
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

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    try {
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        firstName: registerData.firstName || undefined,
        lastName: registerData.lastName || undefined
      });
      // No need to show toast or navigate - handled in AuthContext
    } catch (error) {
      // Error toast is handled in AuthContext
      console.error('Registration failed:', error);
    }
  };

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
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="register-confidentiality" 
                        className="mt-1 data-[state=checked]:bg-emerald-600"
                        checked={registerData.hasAgreedToNDA}
                        onCheckedChange={(checked) => 
                          setRegisterData({ ...registerData, hasAgreedToNDA: !!checked })
                        }
                        required 
                      />
                      <label htmlFor="register-confidentiality" className="text-xs text-gray-400">
                        I confirm that I have read and agree to the <span className="text-blue-400">Confidentiality Agreement</span> and will not disclose any information from this platform without authorization.
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={loading || !registerData.hasAgreedToNDA}
                    >
                      {loading ? 'Processing...' : 'Continue to Beta Program Selection'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
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
              <h1 className="text-4xl font-bold mb-2">Paddock20</h1>
              <p className="text-xl text-blue-400">Your Ultimate Automotive Companion</p>
            </div>
            
            <div className="space-y-6">
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
              
              <div className="mt-8">
                <div className="p-3 bg-gray-800 border border-blue-800 rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-blue-400 flex items-center mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                    PADDOCK20 CONFIDENTIALITY AGREEMENT
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    All information, data, and intellectual property accessed through this platform is strictly confidential and proprietary to GoTime Motorsports. By proceeding, you agree not to disclose, reproduce, or share any information without explicit written permission.
                  </p>
                  <p className="text-xs text-gray-400">
                    Violation of this confidentiality agreement may result in immediate termination of access privileges and potential legal action under applicable intellectual property and trade secret laws.
                  </p>
                </div>
                <p className="text-xs text-center text-gray-500">
                  By signing up, you agree to our <a href="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</a>, <a href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a>, and the Paddock20 Confidentiality Agreement above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;