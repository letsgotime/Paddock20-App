import { useEffect, useState } from "react";
import supabase from "../services/supabaseClient";
import { Car, Wrench, FileText, PlusCircle, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  image_url: string;
}

const SimpleGarageVault: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!supabase) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching vehicles:', error);
          return;
        }
        
        setVehicles(data || []);
      } catch (error) {
        console.error('Error in fetchVehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Garage Vault</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Vehicles</h2>
        <button 
          className="bg-[#7FC844] text-black px-4 py-2 rounded-md flex items-center gap-2"
          onClick={() => toast({ title: "Coming soon", description: "Add vehicle feature is coming soon" })}
        >
          <PlusCircle className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7FC844]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={vehicle.image_url || 'https://placehold.co/600x400/333/7FC844?text=No+Image'} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                <div className="mt-4 flex justify-between">
                  <button 
                    className="bg-zinc-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
                    onClick={() => toast({ title: "Coming soon", description: "Service records feature is coming soon" })}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Service Records
                  </button>
                  <button 
                    className="bg-zinc-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
                    onClick={() => toast({ title: "Coming soon", description: "Modification tracking is coming soon" })}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Modifications
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {vehicles.length === 0 && (
            <div className="col-span-full bg-zinc-800 rounded-lg p-8 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-bold mb-2">No vehicles yet</h3>
              <p className="text-zinc-400 mb-6">Add your first vehicle to get started with Garage Vault</p>
              <button 
                className="bg-[#7FC844] text-black px-4 py-2 rounded-md flex items-center gap-2 mx-auto"
                onClick={() => toast({ title: "Coming soon", description: "Add vehicle feature is coming soon" })}
              >
                <PlusCircle className="h-4 w-4" />
                Add Vehicle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleGarageVault;