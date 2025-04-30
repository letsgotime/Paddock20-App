// /client/src/components/GTGVaultFleetStats.tsx

import React from "react";
import { useVehicleVault } from "@/contexts/GTGVaultVehicleContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, DollarSign, Gauge, Calendar } from "lucide-react";

const GTGVaultFleetStats: React.FC = () => {
  const { vehicles } = useVehicleVault();

  const totalValue = vehicles.reduce((sum, v) => sum + (v.current_value || 0), 0);
  const totalMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
  const oldest = vehicles.reduce((acc, v) => (v.year < acc.year ? v : acc), vehicles[0] || { year: Infinity });

  return (
    <Card className="bg-zinc-900 border border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <BarChart className="h-5 w-5" /> Fleet Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white">
        <div className="bg-zinc-800 rounded p-3">
          <div className="text-gray-400 mb-1">Total Value</div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            ${totalValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-800 rounded p-3">
          <div className="text-gray-400 mb-1">Total Mileage</div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-yellow-400" />
            {totalMileage.toLocaleString()} mi
          </div>
        </div>

        <div className="bg-zinc-800 rounded p-3">
          <div className="text-gray-400 mb-1">Oldest Model</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            {oldest?.year} {oldest?.make} {oldest?.model}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GTGVaultFleetStats;