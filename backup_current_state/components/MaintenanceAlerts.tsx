import React from 'react';
import { vehicleProfile } from '../data/vehicles';

function MaintenanceAlerts() {
  const today = new Date();

  const parseDate = (dateString: string) => {
    return new Date(dateString);
  };

  const daysSince = (dateString: string) => {
    const pastDate = parseDate(dateString);
    const diffTime = Math.abs(today.getTime() - pastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert ms to days
  };

  const maintenanceChecks = [
    { label: "Oil Change", field: vehicleProfile.maintenance.lastOilChange, threshold: 180 }, // 6 months
    { label: "Air Filter Change", field: vehicleProfile.maintenance.lastAirFilterChange, threshold: 365 },
    { label: "Cabin Filter Change", field: vehicleProfile.maintenance.lastCabinFilterChange, threshold: 365 },
    { label: "Coolant Flush", field: vehicleProfile.maintenance.lastCoolantFlush, threshold: 730 }, // 2 years
    { label: "Brake Fluid Change", field: vehicleProfile.maintenance.lastBrakeFluidChange, threshold: 730 },
    { label: "Transmission Service", field: vehicleProfile.maintenance.lastTransmissionService, threshold: 730 },
  ];

  const overdueItems = maintenanceChecks.filter(item => daysSince(item.field) > item.threshold);

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">Maintenance Monitor</h2>

      {overdueItems.length > 0 ? (
        <ul className="space-y-2">
          {overdueItems.map((item, index) => (
            <li key={index} className="text-red-500 font-openSans">
              {item.label} overdue by {daysSince(item.field) - item.threshold} days
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-green-400 text-center">No overdue maintenance items! Drive ready.</p>
      )}
    </div>
  );
}

export default MaintenanceAlerts;