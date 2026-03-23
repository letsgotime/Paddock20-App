import React, { useState } from 'react';
import { EnhancedLocationProvider } from '@/contexts/EnhancedLocationContext';
import GeocodeExplorer from '@/components/GeocodeExplorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MapboxExplorer from '@/components/MapboxExplorer';
import NominatimExplorer from '@/components/NominatimExplorer';
import PositionstackExplorer from '@/components/PositionstackExplorer';

const GeocodingTestPage: React.FC = () => {
  return (
    <EnhancedLocationProvider>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Location Services Explorer</h1>
            <p className="text-muted-foreground mt-2">
              Multi-provider geocoding system with aggressive caching and rate limiting
            </p>
          </div>
          
          <div className="border-b pb-2" />
          
          <Tabs defaultValue="opencage">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="opencage">OpenCage</TabsTrigger>
              <TabsTrigger value="mapbox">Mapbox</TabsTrigger>
              <TabsTrigger value="nominatim">OSM Nominatim</TabsTrigger>
              <TabsTrigger value="positionstack">Positionstack</TabsTrigger>
            </TabsList>
            
            <TabsContent value="opencage" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>OpenCage Geocoding</CardTitle>
                  <CardDescription>
                    Ultra-conservative implementation with 1 request/day limit and permanent caching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GeocodeExplorer />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mapbox" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mapbox Geocoding</CardTitle>
                  <CardDescription>
                    Premium geocoding with map visualization and 7-day caching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MapboxExplorer />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="nominatim" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>OpenStreetMap Nominatim</CardTitle>
                  <CardDescription>
                    OSM-based geocoding with strict adherence to usage policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NominatimExplorer />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="positionstack" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Positionstack</CardTitle>
                  <CardDescription>
                    APILayer geocoding service with 100,000 requests/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PositionstackExplorer />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
        </div>
      </div>
    </EnhancedLocationProvider>
  );
};

export default GeocodingTestPage;