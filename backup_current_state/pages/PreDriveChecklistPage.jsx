import React from 'react';
import ChecklistItem from '../components/ChecklistItem';

function PreDriveChecklistPage() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h2 className="apex-header-green mb-8 text-center">Pre-Drive Readiness Checklist</h2>

      <div className="grid grid-cols-1 gap-6">
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Tire Pressure - Front/Rear Match" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Torque Spec Glance" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Oil Level Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Brake Pad Depth Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Brake Fluid Level Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Battery Health Scan" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Lights & Signals Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Wiper Blades and Washer Fluid" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Fuel Range Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Garage Floor Leak Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Weather Condition Check" />
        <ChecklistItem checklistName="Pre-Drive Readiness" itemName="Final Pre-Drive Walkaround" />
      </div>
    </div>
  );
}

export default PreDriveChecklistPage;
