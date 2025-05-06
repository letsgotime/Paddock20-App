import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Redirect } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BetaTesterApprovalPanel from '@/components/admin/BetaTesterApprovalPanel';
import { Loader2, Shield } from 'lucide-react';

/**
 * Admin page for PADDOCK20 administrators
 * Contains tabs for different administrative functions
 */
const AdminPage = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  
  // Check if user has admin role
  const isAdmin = user && user['https://paddock20.app/roles']?.includes('admin');
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#1982FC]" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect if not an admin
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-[#1982FC]" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
      </div>
      
      <Tabs defaultValue="beta-testers" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="beta-testers">Beta Testers</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="beta-testers" className="space-y-6">
          <BetaTesterApprovalPanel />
        </TabsContent>
        
        <TabsContent value="users">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium mb-2">User Management</h3>
            <p className="text-muted-foreground">User management functionality coming soon.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="system">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium mb-2">System Status</h3>
            <p className="text-muted-foreground">System monitoring and status dashboard coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;