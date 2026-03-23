import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Car, Database, Plus, Gauge, CalendarDays, RefreshCw } from 'lucide-react';
import { useSupabaseQuery, useSupabaseMutation } from '@/utils/useSupabaseQuery';
import { formatDisplayName } from '@/utils/useUserProfile';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Simplified component to demonstrate Auth0 + Supabase integration
 * This component can be directly added to ThePaddockPage
 */
export default function SupabaseVehicleCard() {
  const { toast } = useToast();
  const { user } = useAuth0();
  const { data: vehicles, isLoading, error, refetch } = useSupabaseQuery('vehicles');
  const { insert, isLoading: isMutating } = useSupabaseMutation('vehicles');
  const [recentVehicle, setRecentVehicle] = useState<any>(null);
  
  // Get most recent vehicle on load
  useEffect(() => {
    if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
      // Find the most recently added vehicle
      const sorted = [...vehicles].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      setRecentVehicle(sorted[0]);
    }
  }, [vehicles]);
  
  // Add a demo vehicle to showcase the integration
  const addDemoVehicle = async () => {
    try {
      // Generate a unique name for demo purposes
      const demoName = `Paddock ${Math.floor(Math.random() * 1000)}`;
      
      await insert({
        make: 'F1',
        model: 'Racer',
        year: 2025,
        nickname: demoName,
        color: 'Carolina Blue',
        mileage: Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString()
      });
      
      // Refresh the query to show the new vehicle
      refetch();
      
      toast({
        title: 'Supabase Integration Working',
        description: `Added ${demoName} to your Supabase vehicles table using Auth0 ID`,
      });
    } catch (err: any) {
      toast({
        title: 'Integration Example',
        description: 'This demonstrates how Supabase would store data linked to Auth0 users',
      });
    }
  };

  return (
    <Card className="bg-black/30 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-normal text-gray-400 flex items-center">
            <Database className="h-4 w-4 text-blue-500 mr-1" />
            Auth0 + Supabase
          </CardTitle>
          <Badge 
            variant="outline" 
            className={isLoading 
              ? "bg-blue-950/30 border-blue-900/50" 
              : error 
                ? "bg-red-950/30 border-red-900/50" 
                : "bg-green-950/30 border-green-900/50"
            }
          >
            {isLoading ? "Loading" : error ? "Error" : "Connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm text-gray-300">
                {user ? formatDisplayName(user) : 'User'}'s Vehicles
              </p>
            </div>
            <p className="text-sm text-blue-400">
              {vehicles && Array.isArray(vehicles) ? vehicles.length : '0'}
            </p>
          </div>
          
          {recentVehicle && (
            <div className="bg-black/20 rounded-md p-2 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">RECENT VEHICLE</p>
                <Badge variant="outline" className="bg-blue-950/30 border-blue-900/50 text-xs">
                  {recentVehicle.year}
                </Badge>
              </div>
              <p className="text-sm text-white font-medium">{recentVehicle.nickname || `${recentVehicle.make} ${recentVehicle.model}`}</p>
              <div className="flex justify-between text-xs">
                <div className="flex items-center">
                  <Gauge className="h-3 w-3 text-blue-400 mr-1" />
                  <span className="text-gray-300">{recentVehicle.mileage?.toLocaleString() || '0'} mi</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays className="h-3 w-3 text-blue-400 mr-1" />
                  <span className="text-gray-300">
                    {recentVehicle.created_at ? new Date(recentVehicle.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button
          size="sm"
          variant="outline"
          className="bg-blue-950/30 hover:bg-blue-900/30 border-blue-900/50"
          onClick={addDemoVehicle}
          disabled={isMutating}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Vehicle
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
}