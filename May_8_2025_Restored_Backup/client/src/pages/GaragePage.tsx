import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { PlusCircle, Car, Wrench, Calendar, Edit, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { useVehicle, Vehicle } from '../hooks/useVehicle';
import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function GaragePage() {
  const { vehicles, loading, deleteVehicle } = useVehicle();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteVehicle = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteVehicle(id);
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle has been removed from your garage.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting your vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const placeholderVehicles: Vehicle[] = [
    {
      id: "placeholder-1",
      make: "Porsche",
      model: "911 Turbo S",
      year: "2023",
      color: "Agate Grey Metallic",
      description: "Twin-turbo flat-six engine with 640 horsepower and 590 lb-ft of torque. 0-60 mph in 2.6 seconds.",
      primaryImage: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "placeholder-2",
      make: "BMW",
      model: "M5 Competition",
      year: "2022",
      color: "Marina Bay Blue",
      description: "4.4L twin-turbocharged V8 with 617 horsepower. Incredible blend of luxury and performance.",
      primaryImage: "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?q=80&w=2070&auto=format&fit=crop",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  // Combine stored vehicles with placeholders if no vehicles exist
  const displayVehicles = vehicles.length > 0 ? vehicles : placeholderVehicles;

  return (
    <div className="garage-page pb-16">
      <PageTitle 
        title="Garage Vault" 
        subtitle="Manage your vehicles and maintenance records"
        icon={<Car className="text-blue-400 h-7 w-7" />}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-orbitron text-white">My Vehicles</h2>
        <Link href="/garage/add-vehicle">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Loading your garage...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVehicles.map((vehicle) => (
            <Card 
              key={vehicle.id} 
              className={`border border-blue-900/30 bg-gray-900/60 shadow-xl overflow-hidden ${vehicle.id.startsWith('placeholder') ? 'opacity-60' : ''}`}
            >
              {vehicle.primaryImage && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={vehicle.primaryImage} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover object-center" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-xl font-bold text-white">
                      {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </h3>
                    <p className="text-sm text-gray-300">{vehicle.color}</p>
                  </div>
                </div>
              )}
              <CardContent className={`p-4 ${!vehicle.primaryImage ? 'pt-6' : ''}`}>
                {!vehicle.primaryImage && (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">{vehicle.color}</p>
                  </>
                )}
                
                {vehicle.description && (
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {vehicle.description}
                  </p>
                )}
                
                <div className="flex flex-col space-y-2">
                  {vehicle.vin && (
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="font-semibold mr-2">VIN:</span>
                      <span>{vehicle.vin}</span>
                    </div>
                  )}
                  {vehicle.licensePlate && (
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="font-semibold mr-2">License:</span>
                      <span>{vehicle.licensePlate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  {!vehicle.id.startsWith('placeholder') && (
                    <>
                      <Link href={`/garage/edit-vehicle/${vehicle.id}`}>
                        <Button size="sm" variant="outline" className="h-8">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 text-red-500 hover:text-red-400 hover:border-red-500">
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this vehicle and all its associated records.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-gray-300">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              disabled={isDeleting === vehicle.id}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {isDeleting === vehicle.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>Delete</>
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
                
                <Link href={vehicle.id.startsWith('placeholder') ? '/garage/add-vehicle' : `/garage/vehicle/${vehicle.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300">
                    <span>Details</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          
          {/* Add Vehicle Card */}
          <Link href="/garage/add-vehicle">
            <Card className="border border-green-900/40 bg-green-900/10 hover:bg-green-900/20 shadow-xl h-full flex flex-col justify-center items-center p-8 transition-colors duration-200 cursor-pointer">
              <PlusCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Add New Vehicle</h3>
              <p className="text-center text-gray-400">
                Add your vehicles to track maintenance, mods, and keep detailed records
              </p>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}