import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserData, useSupabaseWithAuth } from '@/utils/supabaseAuth';
import { Loader2, Plus, Car, RefreshCw, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Example component demonstrating how to use Supabase with Auth0 authentication
 * This component fetches and displays vehicles belonging to the current user
 */
export default function SupabaseVehiclesList() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const vehiclesData = useUserData('vehicles'); // Create a data helper for the 'vehicles' table
  const { userId, client } = useSupabaseWithAuth(); // For direct Supabase access
  const { toast } = useToast();

  // Function to load vehicles from Supabase
  const loadVehicles = async () => {
    setLoading(true);
    try {
      // Use the helper method which automatically applies user_id filter
      const { data, error } = await vehiclesData.select('*');
      
      if (error) {
        throw error;
      }
      
      setVehicles(data || []);
    } catch (err: any) {
      console.error('Error loading vehicles:', err);
      toast({
        title: 'Error loading vehicles',
        description: err.message || 'Failed to load your vehicles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a demo vehicle
  const addDemoVehicle = async () => {
    try {
      // Generate a unique name for demo purposes
      const demoName = `Demo ${Math.floor(Math.random() * 1000)}`;
      
      // Use the helper method which automatically adds user_id
      const { data, error } = await vehiclesData.insert({
        make: 'Demo Brand',
        model: 'Paddock 20',
        year: 2025,
        nickname: demoName,
        color: 'Carolina Blue',
        created_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      toast({
        title: 'Vehicle added',
        description: `Added ${demoName} to your garage`,
      });
      
      // Reload vehicles to show the new one
      loadVehicles();
    } catch (err: any) {
      toast({
        title: 'Error adding vehicle',
        description: err.message || 'Failed to add demo vehicle',
        variant: 'destructive'
      });
    }
  };

  // Load vehicles on component mount
  useEffect(() => {
    loadVehicles();
    
    // Set up a real-time subscription for vehicles table (if needed)
    const vehiclesSubscription = client
      .channel('vehicles_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles',
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          console.log('Vehicles change detected:', payload);
          loadVehicles(); // Reload on any change
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      vehiclesSubscription.unsubscribe();
    };
  }, [userId]);

  return (
    <Card className="w-full bg-black/30 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-orbitron text-xl">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-500 mr-2" />
            SUPABASE VEHICLES
          </div>
        </CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadVehicles}
            className="bg-black/30 border-blue-900/40 hover:bg-blue-900/20">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={addDemoVehicle}
            className="bg-black/30 border-blue-900/40 hover:bg-blue-900/20">
            <Plus className="h-4 w-4 mr-1" />
            Add Demo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-black/40 border-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Car className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-white">{vehicle.nickname || 'Unnamed Vehicle'}</h3>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    <p>Color: {vehicle.color || 'Not specified'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      ID: {vehicle.id} • Added: {new Date(vehicle.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-black/40 rounded-lg border border-blue-900/30">
            <Car className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <h3 className="text-gray-400 mb-1">No vehicles yet</h3>
            <p className="text-gray-600 text-sm mb-4">
              Add a demo vehicle to see how the Supabase integration works
            </p>
            <Button 
              onClick={addDemoVehicle}
              className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" />
              Add Demo Vehicle
            </Button>
          </div>
        )}
        
        <div className="mt-4 p-3 rounded bg-blue-950/40 border border-blue-900/30">
          <h4 className="font-semibold text-blue-400 mb-1">About this Component</h4>
          <p className="text-sm text-gray-400">
            This component demonstrates Auth0 + Supabase integration. All vehicle data is stored in Supabase 
            and automatically filtered by Auth0 user ID. The real-time subscription will update the list 
            if changes are made from other sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}