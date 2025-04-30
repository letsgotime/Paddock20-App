// /client/src/pages/GTGVaultVehicleTabRouter.tsx

import React from "react";
import { useParams, Route, Link } from "wouter";
import GTGVaultVehicleDetail from "./GTGVaultVehicleDetail";
import GTGVaultMaintenance from "./GTGVaultMaintenance";
import GTGVaultTireTracker from "./GTGVaultTireTracker";
import GTGVaultModLog from "./GTGVaultModLog";
import GTGVaultDetailing from "./GTGVaultDetailing";
import GTGVaultGallery from "./GTGVaultGallery";

const tabs = [
  { name: "Overview", path: "detail" },
  { name: "Maintenance", path: "maintenance" },
  { name: "Tires", path: "tires" },
  { name: "Mods", path: "mods" },
  { name: "Detailing", path: "detailing" },
  { name: "Gallery", path: "gallery" }
];

const GTGVaultVehicleTabRouter: React.FC = () => {
  const { id, tab = "detail" } = useParams<{ id: string; tab?: string }>();

  const basePath = `/garage/${id}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-orbitron text-blue-400 mb-6">Vehicle Vault</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.path}
            href={`${basePath}/${t.path}`}
            className={`px-4 py-2 rounded font-semibold border transition ${
              tab === t.path ? "bg-blue-500 text-black border-blue-600" : "border-zinc-700 text-white hover:bg-zinc-800"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {tab === "detail" && <GTGVaultVehicleDetail />}
      {tab === "maintenance" && <GTGVaultMaintenance />}
      {tab === "tires" && <GTGVaultTireTracker />}
      {tab === "mods" && <GTGVaultModLog />}
      {tab === "detailing" && <GTGVaultDetailing />}
      {tab === "gallery" && <GTGVaultGallery />}
    </div>
  );
};

export default GTGVaultVehicleTabRouter;