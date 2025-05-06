import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleSearchExplorer from '@/components/explorers/GoogleSearchExplorer';
import TheRundownExplorer from '@/components/explorers/TheRundownExplorer';

const ApiExplorerPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paddock20 API Explorers</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore and test the integrated API services. These explorers provide low-level access to the 
          data providers that power Paddock20's enhanced automotive experiences.
        </p>
      </div>
      
      <Tabs defaultValue="sports" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="sports">Motorsports API</TabsTrigger>
          <TabsTrigger value="search">Search API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sports" className="mt-6">
          <TheRundownExplorer />
        </TabsContent>
        
        <TabsContent value="search" className="mt-6">
          <GoogleSearchExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiExplorerPage;