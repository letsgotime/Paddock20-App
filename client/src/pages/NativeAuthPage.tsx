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
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Form for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form for signup
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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
        
        // Redirect will happen automatically via the useEffect
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
            setLocation('/beta-agreement');
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
                      className="w-full bg-[#1982FC] hover:bg-blue-700"
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
                              placeholder="username" 
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
                      className="w-full bg-[#1982FC] hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining the Grid...
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
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-400">
              <p>
                By continuing, you agree to our{" "}
                <a href="/terms-of-service" className="underline text-[#1982FC] hover:text-blue-700">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="underline text-[#1982FC] hover:text-blue-700">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-[url('/carbon-fiber-bg-dark.jpg')] bg-cover">
        <div className="flex flex-col justify-center items-center w-full p-8 bg-black/70">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-[#1982FC] mb-4 font-['Orbitron']">Experience F1-Grade Analytics</h1>
            <p className="text-xl mb-6 font-['Orbitron']">
              <span className="text-[#1982FC]">Paddock</span><span className="text-[#08c519]">20</span> <span className="text-gray-200">transforms your driving insights with Formula 1 level technology for everyday drivers</span>
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/50 p-4 rounded border border-[#1982FC]">
                <h3 className="text-[#1982FC] font-bold mb-2 font-['Orbitron']">Weather Paddock</h3>
                <p className="text-gray-300">Get F1-grade weather insights for your drive</p>
              </div>
              <div className="bg-black/50 p-4 rounded border border-[#1982FC]">
                <h3 className="text-[#1982FC] font-bold mb-2 font-['Orbitron']">Garage Vault</h3>
                <p className="text-gray-300">Manage your vehicles with comprehensive details</p>
              </div>
              <div className="bg-black/50 p-4 rounded border border-[#1982FC]">
                <h3 className="text-[#1982FC] font-bold mb-2 font-['Orbitron']">Drive Journal</h3>
                <p className="text-gray-300">Record and analyze your driving experiences</p>
              </div>
              <div className="bg-black/50 p-4 rounded border border-[#1982FC]">
                <h3 className="text-[#1982FC] font-bold mb-2 font-['Orbitron']">Podium Pursuit</h3>
                <p className="text-gray-300">Your performance journey through achievements, rewards, and milestones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}