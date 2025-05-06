import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "@/hooks/use-toast";
import BetaTesterApprovalPanel from "../components/admin/BetaTesterApprovalPanel";
import { checkUserIsAdmin } from "../services/auth0Management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert, Users, Settings, Database } from "lucide-react";
import { Loader2 } from "lucide-react";

/**
 * Admin page for PADDOCK20 administrators
 * Contains tabs for different administrative functions
 */
const AdminPage: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if the user is an admin when component mounts
    const verifyAdminStatus = async () => {
      if (!isAuthenticated || isLoading) return;
      
      try {
        // Get access token for the Auth0 Management API
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          }
        });
        
        // Check if user has admin role
        const adminStatus = await checkUserIsAdmin(token);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        
        toast({
          title: "Authentication Error",
          description: "Failed to verify administrative privileges. Please try again.",
          variant: "destructive"
        });
      } finally {
        setAdminCheckLoading(false);
      }
    };
    
    verifyAdminStatus();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, toast]);
  
  // Show loading state while checking admin status
  if (isLoading || adminCheckLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#4B9CD3] mb-4" />
        <p className="text-[#4B9CD3] text-lg">Verifying administrative access...</p>
      </div>
    );
  }
  
  // Show error if user is not an admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="bg-red-950/30 border-red-700">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-red-500">Access Denied</AlertTitle>
          <AlertDescription className="text-gray-300">
            You do not have permission to access this administrative area.
            This incident has been logged.
          </AlertDescription>
        </Alert>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4B9CD3] mb-2 flex items-center">
          <ShieldAlert className="mr-2 h-8 w-8 text-[#08c519]" />
          PADDOCK20 Administration
        </h1>
        <p className="text-gray-400">
          Welcome, {user?.name || user?.email}. This is the administrative control panel.
        </p>
      </div>
      
      <Tabs defaultValue="beta-testers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-900/50">
          <TabsTrigger 
            value="beta-testers"
            className="data-[state=active]:bg-[#4B9CD3]/20 data-[state=active]:text-[#4B9CD3]"
          >
            <Users className="h-4 w-4 mr-2" />
            Beta Tester Management
          </TabsTrigger>
          <TabsTrigger 
            value="system"
            className="data-[state=active]:bg-[#4B9CD3]/20 data-[state=active]:text-[#4B9CD3]"
            disabled
          >
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </TabsTrigger>
          <TabsTrigger 
            value="database"
            className="data-[state=active]:bg-[#4B9CD3]/20 data-[state=active]:text-[#4B9CD3]"
            disabled
          >
            <Database className="h-4 w-4 mr-2" />
            Database Management
          </TabsTrigger>
        </TabsList>
        
        {/* Beta Tester Management Tab */}
        <TabsContent value="beta-testers">
          <BetaTesterApprovalPanel />
        </TabsContent>
        
        {/* System Settings Tab - Disabled for now */}
        <TabsContent value="system">
          <Card className="bg-black border-gray-800">
            <CardHeader className="bg-gray-900/30 border-b border-gray-800">
              <CardTitle className="text-[#4B9CD3]">System Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure system-wide settings for the PADDOCK20 platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert className="bg-blue-950/20 border-blue-900/70">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <AlertTitle className="text-blue-400">Coming Soon</AlertTitle>
                <AlertDescription className="text-gray-300">
                  System settings management will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Database Management Tab - Disabled for now */}
        <TabsContent value="database">
          <Card className="bg-black border-gray-800">
            <CardHeader className="bg-gray-900/30 border-b border-gray-800">
              <CardTitle className="text-[#4B9CD3]">Database Management</CardTitle>
              <CardDescription className="text-gray-400">
                Manage database operations and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert className="bg-blue-950/20 border-blue-900/70">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <AlertTitle className="text-blue-400">Coming Soon</AlertTitle>
                <AlertDescription className="text-gray-300">
                  Database management features will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;