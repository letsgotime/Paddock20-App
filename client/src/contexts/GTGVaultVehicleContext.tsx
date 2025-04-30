// /client/src/contexts/GTGVaultVehicleContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/services/supabaseClient";

export interface Vehicle {
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
  created_at: string;
  updated_at?: string;
  user_id: string;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  refreshVehicles: () => void;
  getVehicleById: (id: string) => Vehicle | undefined;
}

const GTGVaultVehicleContext = createContext<VehicleContextType>({
  vehicles: [],
  loading: false,
  error: null,
  refreshVehicles: () => {},
  getVehicleById: () => undefined,
});

export const useVehicleVault = () => useContext(GTGVaultVehicleContext);

export const GTGVaultVehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (error) setError("Failed to load vehicles");
    else setVehicles(data || []);
    setLoading(false);
  };

  const getVehicleById = (id: string) => vehicles.find((v) => v.id === id);

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <GTGVaultVehicleContext.Provider
      value={{ vehicles, loading, error, refreshVehicles: fetchVehicles, getVehicleById }}
    >
      {children}
    </GTGVaultVehicleContext.Provider>
  );
};