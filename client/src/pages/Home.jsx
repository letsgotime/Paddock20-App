import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TodaysDriveConditions from "@/components/TodaysDriveConditions";

function Home() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-black to-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h1 className="text-blue-500 font-orbitron text-3xl mb-2">Paddock20™ Portal</h1>
        <p className="text-zinc-400 mb-4">Drive Life. Document Legacy. Built for the serious. Designed for the seamless.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-black/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-green-500">Garage Vault</CardTitle>
              <CardDescription>Your automotive collection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Access your vehicle profiles, maintenance records, and documentation.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-green-500">Drive Journal</CardTitle>
              <CardDescription>Your automotive experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Record and review your driving sessions, track days, and road trips.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-green-500">Juice Box™</CardTitle>
              <CardDescription>Detailing products & techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Access curated detailing protocols, product recommendations, and tutorials.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Today's Drive Conditions Component - F1-Style Automotive Weather */}
      <TodaysDriveConditions />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/90 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-blue-500 font-orbitron">Upcoming Events</CardTitle>
            <CardDescription>Local automotive gatherings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">No upcoming events in your area.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/90 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-blue-500 font-orbitron">Market Insights</CardTitle>
            <CardDescription>Vehicle value trends</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">Connect to view market analytics and value predictions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;