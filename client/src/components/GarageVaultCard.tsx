import React from 'react';

function GarageVaultCard() {
  const carProfile = {
    make: "Ferrari",
    model: "458 Italia",
    year: "2015",
    tirePressureCold: "29 psi Front / 34 psi Rear",
    tirePressureHot: "32 psi Front / 36 psi Rear",
    torqueSpec: "96 lb-ft (lug nuts)",
    location: {
      address: "Mulholland Hwy, Los Angeles, CA",
      gps: {
        lat: 34.107,
        lng: -118.664
      }
    },
    nearbyResources: {
      gasStations: [
        { name: "Shell Mulholland", distanceKm: 2.3 },
        { name: "Chevron Topanga", distanceKm: 3.1 }
      ],
      airStations: [
        { name: "Discount Tire Topanga", distanceKm: 2.9 }
      ],
      refreshments: [
        { name: "Canyon Cafe", distanceKm: 3.5 }
      ],
      oilStations: [
        { name: "AutoZone Woodland Hills", distanceKm: 4.8 }
      ]
    },
    checklist: [
      "Tires Checked",
      "Torque Lug Nuts",
      "Fluids Checked",
      "Helmet Packed",
      "Surface Temp Safe"
    ]
  };

  return (
    <div className="bg-black text-white font-openSans p-6 rounded-xl shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl font-orbitron text-blue-400 uppercase tracking-wide mb-4 text-center">
        {carProfile.make} {carProfile.model}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tire & Torque Specs */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Tire Pressure Targets</h3>
          <p className="text-lg">Cold: {carProfile.tirePressureCold}</p>
          <p className="text-lg">Hot: {carProfile.tirePressureHot}</p>

          <h3 className="text-green-400 font-orbitron text-sm uppercase mt-4 mb-2">Torque Spec</h3>
          <p className="text-lg">{carProfile.torqueSpec}</p>
        </div>

        {/* Drive Location */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Drive Location</h3>
          <p className="text-lg">{carProfile.location.address}</p>
          <p className="text-sm text-gray-400">Lat: {carProfile.location.gps.lat}, Lng: {carProfile.location.gps.lng}</p>
        </div>
      </div>

      {/* Checklist Section */}
      <div className="mt-8">
        <h3 className="text-blue-400 font-orbitron text-md uppercase mb-3">Drive Readiness Checklist</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {carProfile.checklist.map((item, index) => (
            <li key={index} className="flex items-center bg-gray-800 p-3 rounded-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Nearby Resources */}
      <div className="mt-8">
        <h3 className="text-blue-400 font-orbitron text-md uppercase mb-3">Nearby Resources</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gas Stations */}
          <div>
            <h4 className="text-green-400 font-orbitron text-xs uppercase mb-1">Gas Stations</h4>
            {carProfile.nearbyResources.gasStations.map((station, idx) => (
              <p key={idx} className="text-sm">{station.name} - {station.distanceKm} km</p>
            ))}
          </div>

          {/* Air Stations */}
          <div>
            <h4 className="text-green-400 font-orbitron text-xs uppercase mb-1">Air Stations</h4>
            {carProfile.nearbyResources.airStations.map((station, idx) => (
              <p key={idx} className="text-sm">{station.name} - {station.distanceKm} km</p>
            ))}
          </div>

          {/* Refreshments */}
          <div>
            <h4 className="text-green-400 font-orbitron text-xs uppercase mb-1">Refreshments</h4>
            {carProfile.nearbyResources.refreshments.map((spot, idx) => (
              <p key={idx} className="text-sm">{spot.name} - {spot.distanceKm} km</p>
            ))}
          </div>

          {/* Oil Stations */}
          <div>
            <h4 className="text-green-400 font-orbitron text-xs uppercase mb-1">Oil Stations</h4>
            {carProfile.nearbyResources.oilStations.map((shop, idx) => (
              <p key={idx} className="text-sm">{shop.name} - {shop.distanceKm} km</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarageVaultCard;