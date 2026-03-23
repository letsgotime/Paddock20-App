import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, User, Database, CheckCircle } from 'lucide-react';
import { useUserData } from '@/utils/supabaseAuth';

/**
 * Auth0UserBadge - Shows Auth0 user status and Supabase connection status
 * This can be added to any page where you want to confirm the user's authentication
 * and their linked Supabase data access.
 */
export default function Auth0UserBadge() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  
  // Check if we have access to the user's vehicles in Supabase
  const { select } = useUserData('vehicles');
  const [supabaseStatus, setSupabaseStatus] = React.useState<'checking' | 'connected' | 'error'>('checking');
  
  // Check Supabase connection on component mount
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const checkSupabaseAccess = async () => {
        try {
          const { data, error } = await select();
          if (error) throw error;
          setSupabaseStatus('connected');
        } catch (err) {
          console.error('Supabase connection error:', err);
          setSupabaseStatus('error');
        }
      };
      
      checkSupabaseAccess();
    }
  }, [isAuthenticated, user, select]);
  
  if (isLoading) {
    return (
      <Card className="bg-black/30 border-gray-800">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-500 mr-2" />
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Auth0 Status</p>
              <div className="h-2 w-24 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-950/30 border-blue-900/50">
            Loading...
          </Badge>
        </CardContent>
      </Card>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Card className="bg-black/30 border-gray-800">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-orange-500 mr-2" />
            <div>
              <p className="text-sm text-gray-300">Auth Status</p>
              <p className="text-xs text-orange-400">Not Authenticated</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-orange-950/30 border-orange-900/50">
            Demo Mode
          </Badge>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-black/30 border-gray-800">
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>User ID: {user?.sub}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div>
            <p className="text-sm text-gray-300">{user?.name || user?.email}</p>
            <div className="flex items-center">
              <Shield className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-400">Auth0 Authenticated</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    supabaseStatus === 'connected' 
                      ? 'bg-green-950/30 border-green-900/50' 
                      : supabaseStatus === 'error'
                        ? 'bg-red-950/30 border-red-900/50'
                        : 'bg-blue-950/30 border-blue-900/50'
                  }`}
                >
                  <Database className="h-3 w-3" />
                  {supabaseStatus === 'connected' ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Linked</span>
                    </>
                  ) : supabaseStatus === 'error' ? (
                    <span>Error</span>
                  ) : (
                    <span>Checking</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supabase user_id: {user?.sub}</p>
                <p>Status: {supabaseStatus}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}