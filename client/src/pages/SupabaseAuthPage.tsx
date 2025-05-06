import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../context/SupabaseAuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const SupabaseAuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const { toast } = useToast();
  const { login, signUp, resetPassword, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  // Form hooks
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await login(data.email, data.password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to Paddock20!",
      });
      
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup form submission
  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: '',
        preferred_username: data.email.split('@')[0],
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      
      // Clear form and switch to login tab
      signupForm.reset();
      setActiveTab("login");
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset form submission
  const onResetSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResetEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
      
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl">
        {/* Left Column - Auth Form */}
        <div className="md:w-1/2 md:pr-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your Paddock20 experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-carolina-blue hover:bg-blue-600"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <div className="flex justify-center w-full">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("reset")}
                      className="text-carolina-blue"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Create an Account</CardTitle>
                  <CardDescription>
                    Join Paddock20 to elevate your automotive lifestyle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-carolina-blue hover:bg-blue-600"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Password Reset Tab */}
            <TabsContent value="reset">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Reset Password</CardTitle>
                  <CardDescription>
                    Enter your email address to receive password reset instructions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resetEmailSent ? (
                    <div className="p-4 bg-green-50 text-green-800 rounded-md">
                      <p className="font-medium">Reset email sent!</p>
                      <p className="mt-1">Please check your inbox for instructions to reset your password.</p>
                    </div>
                  ) : (
                    <Form {...resetForm}>
                      <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                        <FormField
                          control={resetForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-carolina-blue hover:bg-blue-600"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("login")}
                    className="w-full text-carolina-blue"
                  >
                    Back to Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Hero Section */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center p-8">
          <div className="bg-[#111827] p-8 rounded-xl border border-gray-800">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
              <span className="text-carolina-blue">PADDOCK</span>20
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Elevate your automotive lifestyle with F1-grade telemetry and insights
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-carolina-blue mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-gray-400">Comprehensive vehicle management</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-carolina-blue mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-gray-400">Driver-focused weather intelligence</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-carolina-blue mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-gray-400">Premium detail tracking and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseAuthPage;