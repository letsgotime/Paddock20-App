import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleSearchExplorer from '@/components/explorers/GoogleSearchExplorer';
import TheRundownExplorer from '@/components/explorers/TheRundownExplorer';
import PdfExplorer from '@/components/explorers/PdfExplorer';
import { FileArchive, Search, Trophy } from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
          <TabsTrigger value="sports" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Motorsports</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-1">
            <FileArchive className="h-4 w-4" />
            <span>PDF Converter</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sports" className="mt-6">
          <TheRundownExplorer />
        </TabsContent>
        
        <TabsContent value="search" className="mt-6">
          <GoogleSearchExplorer />
        </TabsContent>
        
        <TabsContent value="pdf" className="mt-6">
          <PdfExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiExplorerPage;