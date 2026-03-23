import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { getNextAuthFlowPath, getUserProfileFromLocalStorage, hasBetaAgreement } from '@/utils/authFlowUtils';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Signup form schema
const signupSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Form types
type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function NativeAuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login, register, isAuthenticated } = useNativeAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the user profile from localStorage
      const userProfile = getUserProfileFromLocalStorage();
      
      if (userProfile && userProfile.id) {
        // Check if the user has completed beta agreement
        const hasBetaAccepted = hasBetaAgreement(userProfile.id.toString());
        
        if (!hasBetaAccepted) {
          // If beta agreement not accepted, redirect to it
          navigate('/beta-agreement');
        } else {
          // Otherwise redirect to the dashboard
          navigate('/');
        }
      } else {
        // Fallback if no user profile in localStorage
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  // Setup form for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Setup form for signup
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      
      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.error || "Failed to log in with the provided credentials",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome to Paddock20!",
        });
        
        // Get user profile to determine next path
        const userProfile = getUserProfileFromLocalStorage();
        if (userProfile && userProfile.id) {
          // Get the appropriate next path based on user's progress
          const nextPath = getNextAuthFlowPath(userProfile.id.toString());
          
          // Redirect to the appropriate next step with a slight delay to show the toast
          setTimeout(() => {
            navigate(nextPath);
          }, 1000);
        } else {
          // Fallback redirect to homepage if something is wrong with localStorage
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred while trying to log in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle signup form submission
  const onSignupSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      const result = await register(values.email, values.password, values.username);
      
      if (!result.success) {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create an account with the provided details",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        });
        
        // After successful registration, always redirect to beta agreement page
        // This ensures proper flow: Registration > Beta Agreement > Onboarding > Main App
        if (result.success) {
          // Short delay to allow the toast to be visible
          setTimeout(() => {
            navigate('/beta-agreement');
          }, 1500);
        } else if (!isAuthenticated) {
          // Fallback to login tab if something went wrong with auth
          setActiveTab('login');
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred while trying to create an account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black font-['Open_Sans']">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto border border-[#1982FC] bg-black/90">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-full mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1982FC] tracking-widest uppercase font-['Orbitron']">Welcome to PADDOCK<span className="text-[#08c519]">20</span></h1>
              <h2 className="text-4xl font-bold text-[#08c519] tracking-wider uppercase font-['Orbitron']">BETA</h2>
            </div>
            <CardDescription className="text-gray-300 text-lg">
              Your gateway to the ultimate car enthusiast experience
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#797979]">
                <TabsTrigger 
                  value="login" 
                  className="text-white data-[state=active]:bg-[#08c519] data-[state=active]:text-white"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-white data-[state=active]:bg-[#08c519] data-[state=active]:text-white"
                >
                  Join the Grid
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1982FC]">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="you@example.com" 
                              className={cn("bg-gray-700 text-white border-gray-600 focus:border-[#1982FC]")} 
                              {...field} 
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
                          <FormLabel className="text-[#1982FC]">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className={cn("bg-gray-700 text-white border-gray-600 focus:border-[#1982FC]")} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#1982FC] hover:bg-blue-600 text-white font-medium mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1982FC]">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="cooldriver99" 
                              className={cn("bg-gray-700 text-white border-gray-600 focus:border-[#1982FC]")} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1982FC]">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="you@example.com" 
                              className={cn("bg-gray-700 text-white border-gray-600 focus:border-[#1982FC]")} 
                              {...field} 
                            />
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
                          <FormLabel className="text-[#1982FC]">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className={cn("bg-gray-700 text-white border-gray-600 focus:border-[#1982FC]")} 
                              {...field} 
                            />
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
                          <FormLabel className="text-[#1982FC]">Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className={cn("bg-gray-700 text-white border-gray-600 focus:border-[#1982FC]")} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#08c519] hover:bg-green-600 text-white font-medium mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Join the Grid"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col text-center text-sm space-y-4">
            <div className="w-full">
              <p className="text-orange-400 mb-2">Having login issues?</p>
              <Button 
                type="button" 
                className="w-full bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:brightness-110 text-white"
                onClick={() => {
                  window.location.href = "/demo";
                }}
              >
                Quick Demo Access (No Login Required)
              </Button>
            </div>
            <p className="text-gray-400">
              By using PADDOCK20, you agree to our <a href="/terms-of-service" className="text-[#1982FC] hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-[#1982FC] hover:underline">Privacy Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Hero image with overlay */}
      <div className="hidden md:block flex-1 bg-[url('/assets/auth-bg.jpg')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-black/30 flex items-center p-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-4 font-['Orbitron']">Your Ultimate Automotive Companion</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start">
                <span className="bg-[#08c519] rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Intelligent weather insights for optimal driving conditions</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#08c519] rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Track and manage your vehicle maintenance and performance</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#08c519] rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Document your driving experiences and journeys</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#08c519] rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Connect with fellow automotive enthusiasts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}