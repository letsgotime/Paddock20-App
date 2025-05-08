import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Car, CloudSun, Map, Calendar, Award, Wrench, Clock } from 'lucide-react';

export interface BetaWelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function BetaWelcomeModal({ open, onOpenChange, onComplete }: BetaWelcomeModalProps) {
  const [activeTab, setActiveTab] = useState("welcome");
  const [, navigate] = useLocation();
  
  const handleComplete = () => {
    // Close the modal
    onOpenChange(false);
    
    // Navigate to the demo page
    navigate('/demo');
    
    // Trigger the onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black border border-[#333] text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-orbitron text-2xl bg-gradient-to-br from-[#1982FC] to-[#08c519] bg-clip-text text-transparent">
              Welcome to PADDOCK20
            </DialogTitle>
            <Badge variant="outline" className="text-[#08c519] border-[#08c519]">
              BETA
            </Badge>
          </div>
          <DialogDescription className="text-gray-400">
            Your Automotive Lifestyle Hub
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-gray-900 border border-gray-800 p-1">
            <TabsTrigger value="welcome" className="data-[state=active]:bg-[#1982FC]/30">
              Welcome
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-[#1982FC]/30">
              Features
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-[#1982FC]/30">
              Explore
            </TabsTrigger>
            <TabsTrigger value="start" className="data-[state=active]:bg-[#1982FC]/30">
              Get Started
            </TabsTrigger>
          </TabsList>
          
          {/* Welcome Tab */}
          <TabsContent value="welcome" className="py-4">
            <div className="space-y-4">
              <p className="text-lg">
                Experience the ultimate automotive lifestyle platform designed for enthusiasts like you!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-900 flex gap-3">
                  <Car className="h-8 w-8 text-[#1982FC]" />
                  <div>
                    <h3 className="font-semibold">Car Management</h3>
                    <p className="text-sm text-gray-400">Track your vehicles, maintenance, and mods</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-900 flex gap-3">
                  <CloudSun className="h-8 w-8 text-[#1982FC]" />
                  <div>
                    <h3 className="font-semibold">Weather Paddock</h3>
                    <p className="text-sm text-gray-400">Optimized drive planning based on conditions</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between border border-[#1982FC]/50 hover:bg-[#1982FC]/20 text-white"
                onClick={() => setActiveTab("features")}
              >
                Explore Platform Features <ArrowRight size={16} />
              </Button>
            </div>
          </TabsContent>
          
          {/* Features Tab */}
          <TabsContent value="features" className="py-4">
            <div className="space-y-4">
              <p className="text-lg mb-4">PADDOCK20 is packed with powerful features:</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-900 flex flex-col items-center text-center">
                  <Map className="h-6 w-6 text-[#08c519] mb-2" />
                  <h3 className="font-medium">Drive Journal</h3>
                  <p className="text-xs text-gray-400">Log and share your drives</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 flex flex-col items-center text-center">
                  <Calendar className="h-6 w-6 text-[#08c519] mb-2" />
                  <h3 className="font-medium">Events</h3>
                  <p className="text-xs text-gray-400">Track automotive events</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 flex flex-col items-center text-center">
                  <Award className="h-6 w-6 text-[#08c519] mb-2" />
                  <h3 className="font-medium">Goals</h3>
                  <p className="text-xs text-gray-400">Set and achieve automotive goals</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 flex flex-col items-center text-center">
                  <Wrench className="h-6 w-6 text-[#08c519] mb-2" />
                  <h3 className="font-medium">Maintenance</h3>
                  <p className="text-xs text-gray-400">Track vehicle service history</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between border border-[#1982FC]/50 hover:bg-[#1982FC]/20 text-white"
                onClick={() => setActiveTab("explore")}
              >
                See What's New <ArrowRight size={16} />
              </Button>
            </div>
          </TabsContent>
          
          {/* Explore Tab */}
          <TabsContent value="explore" className="py-4">
            <div className="space-y-4">
              <p className="font-semibold text-lg">Latest Updates:</p>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-900 border-l-4 border-[#1982FC]">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Enhanced Paddock Page</h3>
                    <Badge variant="outline" className="text-[#08c519] border-[#08c519] text-xs">NEW</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Fully expandable sections with rich detail views</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border-l-4 border-[#1982FC]">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Animated Transitions</h3>
                    <Badge variant="outline" className="text-[#08c519] border-[#08c519] text-xs">NEW</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Smooth expand/collapse animations for all cards</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border-l-4 border-[#1982FC]">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Goal Tracking</h3>
                    <Badge variant="outline" className="text-[#08c519] border-[#08c519] text-xs">NEW</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Track your automotive goals with detailed progress</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between border border-[#1982FC]/50 hover:bg-[#1982FC]/20 text-white"
                onClick={() => setActiveTab("start")}
              >
                Continue <ArrowRight size={16} />
              </Button>
            </div>
          </TabsContent>
          
          {/* Get Started Tab */}
          <TabsContent value="start" className="py-4">
            <div className="space-y-4 text-center">
              <Clock className="h-12 w-12 text-[#1982FC] mx-auto" />
              <h3 className="text-xl font-semibold">Ready to start your journey?</h3>
              <p className="text-gray-400">
                Experience the all-new Paddock Page with expandable sections, animated cards, and detailed information about your vehicles, goals, and upcoming events.
              </p>
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">No login required to try the demo!</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:brightness-110 text-white"
          >
            Enter The Paddock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BetaWelcomeModal;