import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

/**
 * Vehicle Mods Page Component
 * 
 * Displays a user's vehicle modifications or allows them to add new ones.
 * This component is a TypeScript replacement for the previous JSX version.
 */
export default function VehicleModsPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-carolina-blue">VEHICLE MODIFICATIONS</h1>
          <Button>Add New Modification</Button>
        </div>
        
        <p className="text-gray-300">
          Track and manage all your vehicle modifications in one place. Document performance upgrades, 
          cosmetic changes, and maintenance modifications to keep a complete history of your vehicle.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample mod cards - these would be populated from real data */}
          <ModCard 
            title="ECU Tune"
            description="Stage 1 ECU tune from COBB Tuning"
            installDate="2025-03-15"
            cost={899.99}
            category="Performance"
          />
          
          <ModCard 
            title="Lowering Springs"
            description="Eibach Pro-Kit lowering springs"
            installDate="2025-02-28"
            cost={329.95}
            category="Suspension"
          />
          
          <ModCard 
            title="LED Headlights"
            description="Upgraded LED headlight bulbs"
            installDate="2025-01-10"
            cost={159.99}
            category="Lighting"
          />
          
          {/* Add Mod Card */}
          <Card className="border-dashed border-2 border-gray-600 bg-black/50 hover:border-carolina-blue transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-black/80 flex items-center justify-center mx-auto mb-3 border border-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-carolina-blue">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-carolina-blue">Add New Modification</p>
                <p className="text-sm text-gray-400 mt-1">Document your latest vehicle upgrade</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ModCardProps {
  title: string;
  description: string;
  installDate: string;
  cost: number;
  category: string;
}

function ModCard({ title, description, installDate, cost, category }: ModCardProps) {
  return (
    <Card className="bg-black/80 border-gray-800 hover:border-carolina-blue transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
            <CardDescription className="text-gray-400">
              {category} • Installed on {new Date(installDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <span className="text-sm font-medium px-2 py-1 rounded bg-black/60 text-carolina-blue border border-carolina-blue/30">
            ${cost.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
}