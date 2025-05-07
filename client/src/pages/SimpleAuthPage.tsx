import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
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
import { 
  saveUserProfileToLocalStorage, 
  getNextAuthFlowPath, 
  markBetaAgreementComplete 
} from '@/utils/authFlowUtils';
import userProfileWarehouse from '@/services/UserProfileWarehouse';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Signup form schema
const signupSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Form types
type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SimpleAuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
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
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.message || "Failed to log in with the provided credentials",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome to Paddock20!",
        });
        
        if (data.user) {
          // Store user profile in localStorage for auth flow
          saveUserProfileToLocalStorage(data.user);
          
          // Create default user profile for the Warehouse if the user is logging in for the first time
          // Create default profile in the warehouse if needed
          // Set timestamp for all operations
          const currentTime = new Date().toISOString();
          
          // Check if there's already a profile
          if (!userProfileWarehouse.getProfile()) {
            // If there's no profile, we need to initialize it with identity data which will create it
            userProfileWarehouse.updateIdentity({
              id: String(data.user.id),
              username: data.user.username || "driver",
              displayName: data.user.username || "New Driver",
              email: data.user.email,
              phone: data.user.phone,
              memberSince: currentTime,
              lastActive: currentTime,
              membershipLevel: 'free',
              onboardingCompleted: false
            });
            
            // Now update preferences
            userProfileWarehouse.updatePreferences({
              theme: 'dark',
              notifications: true,
              timeFormat: '12h',
              dateFormat: 'mdy',
              units: 'imperial',
              soundEnabled: true,
              weatherPreferences: {
                defaultLocation: {
                  lat: 33.7490,
                  lon: -84.3880,
                  name: 'Atlanta, GA'
                },
                units: 'imperial'
              }
            });
            
            console.log('Created initial user profile in warehouse');
          } else {
            // Just update the last active time
            userProfileWarehouse.updateIdentity({
              lastActive: currentTime
            });
            console.log('Updated existing user profile in warehouse');
          }
          
          // Determine next path based on user's progress in the auth flow
          const nextPath = getNextAuthFlowPath(String(data.user.id));
          
          // Redirect to the appropriate page with a slight delay
          setTimeout(() => {
            navigate(nextPath);
          }, 1000);
        } else {
          // If no user data, go to home page
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to create an account with the provided details",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful", 
          description: "Your account has been created successfully!",
        });
        
        // If registration succeeded and we have user data
        if (data.user) {
          // Store user data in localStorage for auth flow
          saveUserProfileToLocalStorage(data.user);
          
          // Mark beta agreement as pending (will redirect to beta agreement)
          // Note: We don't modify the beta modal functionality
          
          // Short delay to allow the toast to be visible
          setTimeout(() => {
            // Switch to login tab - we need the user to login after registering 
            // to establish the authenticated session properly
            setActiveTab('login');
            
            // You could alternatively automatically log them in and redirect to beta agreement
            // but that depends on how backend sessions are established
          }, 1500);
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
              <h1 className="text-4xl md:text-5xl font-bold text-[#1982FC] tracking-widest uppercase font-['Orbitron']">
                PADDOCK<span className="text-[#08c519]">20</span>
              </h1>
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1982FC]">Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(555) 123-4567" 
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
          
          <CardFooter className="flex flex-col text-center text-sm text-gray-400">
            <p>
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
                <span>Track your vehicles, maintenance history, and driving habits</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#08c519] rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Connect with like-minded automotive enthusiasts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}