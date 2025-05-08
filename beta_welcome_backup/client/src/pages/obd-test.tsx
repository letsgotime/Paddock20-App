import { useState } from 'react';
import OBDConnect from '@/components/vehicle/OBDConnect';
import OBDDataDisplay from '@/components/vehicle/OBDDataDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function OBDTestPage() {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/garage" className="flex items-center text-sm text-primary hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Garage
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">OBD-II Diagnostics</h1>
          <p className="text-muted-foreground mt-1">
            Connect your vehicle and view real-time data from your OBD-II adapter
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OBDConnect 
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect} 
          />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About OBD-II</CardTitle>
              <CardDescription>
                What is OBD-II and how to use it
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                OBD-II (On-Board Diagnostics II) is a standardized system that allows external devices to interface with your vehicle's computer system.
              </p>
              <p>
                To use this feature, you'll need an OBD-II adapter connected to your computer. Once connected, you can view real-time data from your vehicle's sensors and read diagnostic trouble codes.
              </p>
              <p>
                <strong>Requirements:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Vehicle with OBD-II support (most vehicles after 1996)</li>
                <li>OBD-II adapter connected to your computer</li>
                <li>Driver software for your adapter</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <OBDDataDisplay connected={connected} />
        </div>
      </div>
    </div>
  );
}