// /client/src/pages/GTGVaultVehicleDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { 
  Car, 
  Calendar, 
  Wrench, 
  Gauge, 
  Clock, 
  DollarSign, 
  FileText, 
  Tag, 
  Droplets, 
  AlertTriangle, 
  Share2, 
  Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import supabase from '@/services/supabaseClient';

// Basic interface for vehicle data
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  color: string;
  mileage: number;
  image_url: string;
  drivetrain: string;
  engine_type: string;
  fuel_type: string;
  transmission: string;
  current_value: number;
  purchase_date: string;
  status: string;
}

const GTGVaultVehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format mileage for display
  const formatMileage = (miles: number): string => {
    return miles.toLocaleString() + ' mi';
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // For placeholder purposes, we'll create a mock vehicle
  useEffect(() => {
    const mockVehicle: Vehicle = {
      id: id || '123',
      make: 'Porsche',
      model: '911 GT3',
      year: 2022,
      trim: 'Touring',
      color: 'Guards Red',
      mileage: 3402,
      image_url: 'https://images.unsplash.com/photo-1611859266516-31c2982c4f3a?q=80&w=2069&auto=format&fit=crop',
      drivetrain: 'RWD',
      engine_type: '4.0L Flat-6',
      fuel_type: 'Premium',
      transmission: '6-Speed Manual',
      current_value: 199500,
      purchase_date: '2022-05-15',
      status: 'active'
    };
    
    setVehicle(mockVehicle);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-400 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Vehicle</h2>
        <p className="text-gray-400">{error}</p>
        <Button className="mt-4" variant="default">
          Return to Vault
        </Button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
        <p className="text-gray-400">We couldn't find the requested vehicle in your vault.</p>
        <Button className="mt-4" variant="default">
          Return to Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Vehicle hero section */}
        <div className="rounded-lg overflow-hidden mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
          <img 
            src={vehicle.image_url} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="absolute bottom-0 left-0 p-6">
            <Badge className="mb-2 bg-blue-600 hover:bg-blue-500">
              {vehicle.status.toUpperCase()}
            </Badge>
            <h1 className="text-3xl font-bold mb-1">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h1>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <span>{formatMileage(vehicle.mileage)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Purchased: {formatDate(vehicle.purchase_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>Value: {formatCurrency(vehicle.current_value)}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="sm" variant="outline" className="bg-zinc-800/70 border-zinc-700">
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button size="sm" variant="outline" className="bg-zinc-800/70 border-zinc-700">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Vehicle specs overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Car className="h-5 w-5" /> Vehicle Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Make</Label>
                  <p className="font-semibold">{vehicle.make}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Model</Label>
                  <p className="font-semibold">{vehicle.model}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Year</Label>
                  <p className="font-semibold">{vehicle.year}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Trim</Label>
                  <p className="font-semibold">{vehicle.trim || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Color</Label>
                  <p className="font-semibold">{vehicle.color}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Mileage</Label>
                  <p className="font-semibold">{formatMileage(vehicle.mileage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Gauge className="h-5 w-5" /> Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Engine</Label>
                  <p className="font-semibold">{vehicle.engine_type}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Transmission</Label>
                  <p className="font-semibold">{vehicle.transmission}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Drivetrain</Label>
                  <p className="font-semibold">{vehicle.drivetrain}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Fuel Type</Label>
                  <p className="font-semibold">{vehicle.fuel_type}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Current Value</Label>
                  <p className="font-semibold">{formatCurrency(vehicle.current_value)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Purchase Date</Label>
                  <p className="font-semibold">{formatDate(vehicle.purchase_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle health overview */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Droplets className="h-5 w-5" /> Vehicle Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-gray-400">Maintenance Status</Label>
                  <span className="text-green-400">Good</span>
                </div>
                <Progress className="h-2 bg-zinc-800" value={82} />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-gray-400">Tire Health</Label>
                  <span className="text-yellow-400">Fair</span>
                </div>
                <Progress className="h-2 bg-zinc-800" value={65} />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-gray-400">Detailing Status</Label>
                  <span className="text-green-400">Excellent</span>
                </div>
                <Progress className="h-2 bg-zinc-800" value={95} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Upcoming Service Items:</h3>
              <div className="rounded-md bg-zinc-800 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span>Oil Change Due in 1,500 miles or 45 days</span>
                </div>
                <Button size="sm" variant="outline" className="border-zinc-700">
                  Schedule
                </Button>
              </div>
              <div className="rounded-md bg-zinc-800 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span>Tire Rotation Recommended</span>
                </div>
                <Button size="sm" variant="outline" className="border-zinc-700">
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button className="bg-blue-600 hover:bg-blue-500">
            <Wrench className="h-4 w-4 mr-2" /> Log Service
          </Button>
          <Button className="bg-green-600 hover:bg-green-500">
            <Droplets className="h-4 w-4 mr-2" /> Record Detailing
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-500">
            <Tag className="h-4 w-4 mr-2" /> Add Modification
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-500">
            <FileText className="h-4 w-4 mr-2" /> Upload Document
          </Button>
          <Button variant="outline" className="border-zinc-700">
            <Clock className="h-4 w-4 mr-2" /> Update Mileage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GTGVaultVehicleDetail;