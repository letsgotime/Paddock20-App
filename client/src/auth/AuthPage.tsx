/**
 * PADDOCK20 Authentication Page
 * F1-inspired login and registration gateway to the paddock
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './useAuth';
import { LoginCredentials, RegisterData } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { login, register: registerUser, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Create forms with validation
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // If already authenticated, redirect to the paddock
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/the-paddock');
    }
  }, [isAuthenticated, navigate]);

  // Login form submission handler
  const onLoginSubmit = async (data: LoginFormValues) => {
    setGeneralError(null);
    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      };
      
      const response = await login(credentials);
      
      if (!response.success) {
        setGeneralError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      setGeneralError(error.message || 'An unexpected error occurred during login');
    }
  };

  // Registration form submission handler
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setGeneralError(null);
    try {
      const userData: RegisterData = {
        username: data.username,
        email: data.email,
        password: data.password,
      };
      
      const response = await registerUser(userData);
      
      if (!response.success) {
        setGeneralError(response.message || 'Registration failed. Please try again.');
      } else {
        // On successful registration, redirect to beta agreement
        navigate('/beta-agreement');
      }
    } catch (error: any) {
      setGeneralError(error.message || 'An unexpected error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-xl overflow-hidden">
        {/* Authentication Forms */}
        <div className="bg-zinc-900 p-6 md:p-10 rounded-xl border border-carolina-blue shadow-lg">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-orbitron text-carolina-blue">
                PADDOCK<span className="text-gotime-green">20</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">BETA EXPERIENCE</p>
              <p className="text-zinc-400 mt-2">
                {activeTab === 'login' 
                  ? 'Sign in to access your driver dashboard' 
                  : 'Join the grid and start your automotive journey'}
              </p>
            </div>

            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger 
                  value="login"
                  className="font-orbitron text-base data-[state=active]:bg-carolina-blue data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="font-orbitron text-base data-[state=active]:bg-carolina-blue data-[state=active]:text-white"
                >
                  Join The Grid
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-4">
                {generalError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{generalError}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...loginForm}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    loginForm.handleSubmit(onLoginSubmit)(e);
                  }} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="email@example.com"
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-carolina-blue"
                            />
                          </FormControl>
                          <FormLabel className="text-zinc-400 font-normal cursor-pointer">
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-carolina-blue hover:bg-carolina-blue/90 text-white font-orbitron"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <LogIn className="h-5 w-5" />
                          <span>Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Registration Form */}
              <TabsContent value="register" className="space-y-4">
                {generalError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{generalError}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...registerForm}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    registerForm.handleSubmit(onRegisterSubmit)(e);
                  }} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your track name"
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="email@example.com"
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                className="bg-zinc-800 border-zinc-700 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                className="bg-zinc-800 border-zinc-700 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-carolina-blue mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-zinc-400 font-normal cursor-pointer">
                              I accept the{' '}
                              <a
                                href="/terms-of-service"
                                target="_blank"
                                className="text-carolina-blue hover:underline"
                              >
                                Terms of Service
                              </a>{' '}
                              and{' '}
                              <a
                                href="/privacy-policy"
                                target="_blank"
                                className="text-carolina-blue hover:underline"
                              >
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-carolina-blue hover:bg-carolina-blue/90 text-white font-orbitron"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <UserPlus className="h-5 w-5" />
                          <span>Join The Grid</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col p-10 bg-gradient-to-br from-black to-zinc-900 rounded-xl border border-zinc-800 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/src/assets/carbon-fiber-bg.jpg')] bg-cover bg-center"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold font-orbitron text-carolina-blue mb-2">
                {activeTab === 'login'
                  ? 'Welcome Back To The Paddock'
                  : 'Begin Your Automotive Journey'}
              </h2>
              <p className="text-zinc-300 text-lg mb-8">
                {activeTab === 'login'
                  ? 'It\'s race day. Your automotive dashboard awaits.'
                  : 'Experience a racing-inspired platform built for automotive enthusiasts.'}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-carolina-blue rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">Premium Features</h3>
                    <p className="text-zinc-400">
                      Weather analytics, vehicle management, and personalized dashboards
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-carolina-blue rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">F1-Inspired Design</h3>
                    <p className="text-zinc-400">
                      Racing telemetry styling with carbon-fiber aesthetics and dynamic interfaces
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-carolina-blue rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">Driver Community</h3>
                    <p className="text-zinc-400">
                      Connect with automotive enthusiasts and showcase your vehicles
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-8">
              <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <p className="text-zinc-300 italic">
                  "PADDOCK20 transformed how I interact with my vehicles and fellow enthusiasts. 
                  The F1-inspired interface makes everything feel like I'm in a professional racing team."
                </p>
                <p className="text-zinc-500 mt-2">
                  — Michael R., Beta Tester
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