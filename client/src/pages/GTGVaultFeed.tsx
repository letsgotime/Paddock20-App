// /client/src/pages/GTGVaultFeed.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Wrench, Droplets, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const GTGVaultFeed: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          Activity Feed
        </h1>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">Oil Change Completed</span>
                    <Badge variant="outline" className="text-xs font-normal border-zinc-700">Maintenance</Badge>
                  </div>
                  <p className="text-sm text-gray-400">2022 Porsche 911 GT3 • 2 days ago</p>
                  <p className="text-sm mt-2">Mobil 1 0W-40 European Car Formula, K&N Oil Filter</p>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">Added New Wheels</span>
                    <Badge variant="outline" className="text-xs font-normal border-zinc-700">Modification</Badge>
                  </div>
                  <p className="text-sm text-gray-400">2019 BMW M4 • 1 week ago</p>
                  <p className="text-sm mt-2">HRE P101 20" Satin Bronze, Michelin PS4S tires</p>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">Ceramic Coating Applied</span>
                    <Badge variant="outline" className="text-xs font-normal border-zinc-700">Detailing</Badge>
                  </div>
                  <p className="text-sm text-gray-400">2022 Porsche 911 GT3 • 2 weeks ago</p>
                  <p className="text-sm mt-2">Gtechniq Crystal Serum Ultra, 5 year protection</p>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">Brake Fluid Flush</span>
                    <Badge variant="outline" className="text-xs font-normal border-zinc-700">Maintenance</Badge>
                  </div>
                  <p className="text-sm text-gray-400">2019 BMW M4 • 3 weeks ago</p>
                  <p className="text-sm mt-2">Motul RBF 660 Racing Brake Fluid</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GTGVaultFeed;