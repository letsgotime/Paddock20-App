import React, { useState, useEffect, useRef } from "react";
import { MapPin, Locate, Search, CornerDownLeft, Navigation, MapIcon } from "lucide-react";

interface Route {
  id: number;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: string;
  notes: string;
}

const RoutePlannerPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [newRoute, setNewRoute] = useState<Route>({
    id: Date.now(),
    name: "",
    startPoint: "",
    endPoint: "",
    distance: 0,
    estimatedTime: "",
    notes: "",
  });

  const handleAddRoute = () => {
    if (!newRoute.name || !newRoute.startPoint || !newRoute.endPoint) {
      alert("Please complete all required fields.");
      return;
    }
    setRoutes([...routes, { ...newRoute, id: Date.now() }]);
    setNewRoute({
      id: Date.now(),
      name: "",
      startPoint: "",
      endPoint: "",
      distance: 0,
      estimatedTime: "",
      notes: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🧭 Route Planner</h1>

      {/* Add New Route Form */}
      <section className="bg-gray-900 bg-opacity-95 rounded-lg shadow-lg p-6 mb-8" style={{ background: 'linear-gradient(45deg, #111111, #1a1a1a)' }}>
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Plan a New Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Route Name"
            value={newRoute.name}
            onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="text"
            placeholder="Starting Point"
            value={newRoute.startPoint}
            onChange={(e) => setNewRoute({ ...newRoute, startPoint: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="text"
            placeholder="Destination"
            value={newRoute.endPoint}
            onChange={(e) => setNewRoute({ ...newRoute, endPoint: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="number"
            placeholder="Distance (miles)"
            value={newRoute.distance}
            onChange={(e) => setNewRoute({ ...newRoute, distance: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="text"
            placeholder="Estimated Time (e.g., 2h 30m)"
            value={newRoute.estimatedTime}
            onChange={(e) => setNewRoute({ ...newRoute, estimatedTime: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <textarea
            placeholder="Route Notes (scenic spots, rest areas, etc.)"
            value={newRoute.notes}
            onChange={(e) => setNewRoute({ ...newRoute, notes: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700 col-span-1 md:col-span-2"
          />
        </div>
        <button onClick={handleAddRoute} className="mt-6 bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ➕ Save Route
        </button>
      </section>

      {/* List of Routes */}
      <section className="bg-gray-900 bg-opacity-95 rounded-lg shadow-lg p-6" style={{ background: 'linear-gradient(45deg, #111111, #1a1a1a)' }}>
        <h2 className="text-blue-400 font-orbitron text-2xl mb-6">Your Saved Routes</h2>
        {routes.length === 0 ? (
          <p className="text-gray-300">No routes planned yet. Start by adding your favorite drives.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="bg-gray-800 rounded-lg p-5 shadow-lg border border-gray-700">
                <h3 className="text-blue-400 font-orbitron text-xl mb-2">{route.name}</h3>
                <p className="text-white text-sm mb-2">🚗 From: {route.startPoint}</p>
                <p className="text-white text-sm mb-2">📍 To: {route.endPoint}</p>
                <p className="text-white text-sm mb-2">📏 Distance: {route.distance} miles</p>
                <p className="text-white text-sm mb-2">⏱️ Est. Time: {route.estimatedTime}</p>
                <p className="text-gray-300 text-xs mt-2">{route.notes}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RoutePlannerPage;