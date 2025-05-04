import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowRightCircle } from "lucide-react";

interface AuditResult {
  component: string;
  field: string;
  value: string;
  status: 'pass' | 'warning' | 'violation';
  message: string;
}

// List of components available for audit
const AUDITABLE_COMPONENTS = [
  'App',
  'UserProfileHub',
  'GarageVaultPage',
  'JuiceBox',
  'WeatherStation',
  'ManifestationStation',
  'DriveJournal',
  'RouteBuilder',
  'MembershipPage'
];

// Fields that should be checked for each component
const COMPONENT_FIELDS: Record<string, string[]> = {
  'App': ['userName', 'userEmail', 'profileImage'],
  'UserProfileHub': ['displayName', 'username', 'bio', 'achievements'],
  'GarageVaultPage': ['vehicleOwner', 'collectionName', 'maintenanceApprover'],
  'JuiceBox': ['productRecommender', 'washTechnique', 'detailingTips'],
  'WeatherStation': ['locationName', 'favoriteLocations', 'temperatureUnit'],
  'ManifestationStation': ['createdBy', 'goalOwner', 'inspirationalQuote'],
  'DriveJournal': ['driverName', 'routeName', 'journalTitle'],
  'RouteBuilder': ['createdBy', 'routeName', 'destinationName'],
  'MembershipPage': ['memberName', 'membershipLevel', 'joinDate']
};

// Common patterns that might indicate hardcoded data
const SUSPICIOUS_PATTERNS = [
  'gavin',
  'brooks',
  'gotime',
  'specific user',
  'placeholder',
  'your name',
  'test data',
  'sample',
  'dummy',
  'john doe'
];

/**
 * Console component that allows running data integrity audits
 * This can be shown in any developer page for quick verification
 */
export function DataIntegrityConsole() {
  const [selectedComponent, setSelectedComponent] = useState('App');
  const [customField, setCustomField] = useState('');
  const [results, setResults] = useState<AuditResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  
  // Function to audit a single field
  const auditField = (component: string, field: string): AuditResult => {
    // This is a mock implementation for the console UI
    // In a real implementation, this would access actual component data
    
    try {
      // Get data from localStorage or any other source
      const storageKeys = {
        userProfile: 'paddock20_user_profile',
        vehicleData: 'paddock20_vehicle_data',
        galleryData: 'paddock20_gallery',
        settingsData: 'paddock20_settings'
      };
      
      // Example implementation - trying to get value from storage
      let value = 'Not found';
      let sourceFound = false;
      
      // Check various storage locations based on component and field
      if (component === 'App' && field === 'userName') {
        const profileData = localStorage.getItem(storageKeys.userProfile);
        if (profileData) {
          const data = JSON.parse(profileData);
          if (data?.profile?.displayName) {
            value = data.profile.displayName;
            sourceFound = true;
          }
        }
      } else if (component === 'GarageVaultPage' && field === 'vehicleOwner') {
        const vehicleData = localStorage.getItem(storageKeys.vehicleData);
        if (vehicleData) {
          const data = JSON.parse(vehicleData);
          if (data?.primaryVehicle?.owner) {
            value = data.primaryVehicle.owner;
            sourceFound = true;
          }
        }
      }
      // Add more component-field combinations as needed
      
      // Check for suspicious patterns
      const lowerValue = value.toLowerCase();
      const suspiciousPattern = SUSPICIOUS_PATTERNS.find(pattern => 
        lowerValue.includes(pattern.toLowerCase())
      );
      
      if (suspiciousPattern) {
        return {
          component,
          field,
          value,
          status: 'violation',
          message: `Possible hardcoded data detected: Contains "${suspiciousPattern}"`
        };
      }
      
      if (!sourceFound) {
        return {
          component,
          field,
          value,
          status: 'warning',
          message: 'Data source not identified - verify implementation'
        };
      }
      
      return {
        component,
        field,
        value,
        status: 'pass',
        message: 'Data comes from an authorized source'
      };
    } catch (error) {
      // Handle errors properly with type checking
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        component,
        field,
        value: 'Error',
        status: 'warning',
        message: `Error checking field: ${errorMessage}`
      };
    }
  };
  
  // Function to run the audit for selected component
  const runAudit = () => {
    setIsChecking(true);
    setResults([]);
    
    setTimeout(() => {
      const newResults: AuditResult[] = [];
      
      // Check standard fields for the component
      const fields = COMPONENT_FIELDS[selectedComponent] || [];
      for (const field of fields) {
        newResults.push(auditField(selectedComponent, field));
      }
      
      // Check custom field if provided
      if (customField) {
        newResults.push(auditField(selectedComponent, customField));
      }
      
      setResults(newResults);
      setIsChecking(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Component</label>
          <Select
            value={selectedComponent}
            onValueChange={setSelectedComponent}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a component" />
            </SelectTrigger>
            <SelectContent>
              {AUDITABLE_COMPONENTS.map(component => (
                <SelectItem key={component} value={component}>
                  {component}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Custom Field (optional)</label>
          <Input
            value={customField}
            onChange={e => setCustomField(e.target.value)}
            placeholder="Enter custom field name"
          />
        </div>
        
        <div className="flex items-end">
          <Button onClick={runAudit} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Run Audit'}
          </Button>
        </div>
      </div>
      
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Audit Results</h3>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Field</th>
                  <th className="text-left p-2 font-medium">Value</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((result, index) => (
                  <tr key={index} className={
                    result.status === 'violation' 
                      ? 'bg-destructive/10' 
                      : result.status === 'warning'
                        ? 'bg-amber-500/10'
                        : ''
                  }>
                    <td className="p-2">{result.field}</td>
                    <td className="p-2 font-mono text-sm">{result.value}</td>
                    <td className="p-2">
                      <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                        result.status === 'pass' 
                          ? 'bg-green-500/20 text-green-500'
                          : result.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-destructive/20 text-destructive'
                      }`}>
                        {result.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-2">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <Separator className="my-6" />
      
      <div className="bg-muted/20 p-4 rounded-lg">
        <h3 className="flex items-center text-sm font-semibold mb-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          How to fix data integrity issues:
        </h3>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <ArrowRightCircle className="h-4 w-4 mr-1 mt-0.5 text-primary" />
            <span>Replace hardcoded values with data from authorized sources (User Onboarding, MyGallery, Garage Vault, Juice Box)</span>
          </li>
          <li className="flex items-start">
            <ArrowRightCircle className="h-4 w-4 mr-1 mt-0.5 text-primary" />
            <span>Use context providers to pass data instead of direct access</span>
          </li>
          <li className="flex items-start">
            <ArrowRightCircle className="h-4 w-4 mr-1 mt-0.5 text-primary" />
            <span>For fallbacks, use system constants (e.g., "Driver") not specific names</span>
          </li>
          <li className="flex items-start">
            <ArrowRightCircle className="h-4 w-4 mr-1 mt-0.5 text-primary" />
            <span>Check the DataIntegrityVerifier utility for safe data access methods</span>
          </li>
        </ul>
      </div>
    </div>
  );
}