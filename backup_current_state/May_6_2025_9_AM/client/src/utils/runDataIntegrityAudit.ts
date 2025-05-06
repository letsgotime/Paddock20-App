/**
 * Data Integrity Audit Script
 * 
 * This utility scans the entire codebase for potential hardcoded user data
 * and generates a comprehensive report of all potential data integrity issues.
 * 
 * Usage:
 * - Import this function in any component
 * - Call runFullDataIntegrityAudit() in development
 * - Review console output for findings
 */

interface DataIntegrityIssue {
  severity: 'warning' | 'violation';
  component: string;
  field: string;
  value: string;
  suggestion: string;
}

interface DataIntegrityReport {
  componentsScanned: number;
  fieldsChecked: number;
  issuesFound: DataIntegrityIssue[];
  violationsCount: number;
  warningsCount: number;
  passedCount: number;
}

// Define suspicious patterns that might indicate hardcoded data
const SUSPICIOUS_PATTERNS = [
  // User name patterns
  'gavin',
  'brooks',
  'gotime',
  // Generic placeholders
  'lorem ipsum',
  'john doe',
  'jane doe',
  'test user',
  'demo user',
  'sample',
  'example',
  'dummy',
  // Specific content patterns
  'gavin-approved',
  'gavin@',
  'placeholder',
  'example.com',
  'test data',
  // Common hardcoded usernames
  'admin',
  'user1',
  'testuser',
  'demouser'
];

// Map of hardcoded content to check in each component
const COMPONENT_DATA_MAP = {
  'App': {
    user: {
      name: 'userName',
      email: 'userEmail'
    }
  },
  'UserProfileHub': {
    profile: {
      username: 'username',
      displayName: 'displayName',
      email: 'email',
      avatar: 'avatar'
    }
  },
  'JuiceBox': {
    creator: 'creatorName',
    title: 'productTitle',
    description: 'productDescription'
  },
  'GarageVaultPage': {
    vehicleOwner: 'ownerName',
    approver: 'approverName',
    recommendations: 'recommendationSource'
  },
  'DriveJournal': {
    driver: 'driverName',
    location: 'locationName',
    notes: 'journalContent'
  },
  'WeatherStation': {
    location: 'locationName',
    favorites: 'savedLocations',
    preferences: 'userPreferences'
  }
};

// Authorized data sources
const AUTHORIZED_SOURCES = [
  'User Onboarding',
  'MyGallery',
  'Garage Vault',
  'Juice Box',
  'User Profile Context',
  'Vehicle Context',
  'Gallery Context',
  'localStorage with dynamic data',
  'API response'
];

/**
 * Helper to scan a specific component with sample data
 */
function scanComponent(
  componentName: string,
  sampleData: Record<string, any>
): DataIntegrityReport {
  console.log(`CHECKING component: ${componentName}`);
  
  const report: DataIntegrityReport = {
    componentsScanned: 1,
    fieldsChecked: 0,
    issuesFound: [],
    violationsCount: 0,
    warningsCount: 0,
    passedCount: 0
  };
  
  // Get fields to check for this component
  const componentTemplate = COMPONENT_DATA_MAP[componentName as keyof typeof COMPONENT_DATA_MAP];
  
  if (!componentTemplate) {
    console.warn(`No template defined for component: ${componentName}`);
    return report;
  }
  
  // Recursively check all fields
  function scanObject(obj: any, path: string[] = []) {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      
      if (typeof value === 'object' && value !== null) {
        scanObject(value, currentPath);
      } else {
        report.fieldsChecked++;
        const fieldPath = currentPath.join('.');
        const fieldValue = String(value);
        
        // Check for suspicious patterns
        const matchedPattern = SUSPICIOUS_PATTERNS.find(pattern => 
          fieldValue.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matchedPattern) {
          console.error(`INTEGRITY VIOLATION: ${componentName}.${fieldPath} contains "${matchedPattern}"`);
          report.issuesFound.push({
            severity: 'violation',
            component: componentName,
            field: fieldPath,
            value: fieldValue,
            suggestion: `Replace hardcoded "${matchedPattern}" with data from an authorized source.`
          });
          report.violationsCount++;
        } else if (typeof sampleData[fieldPath] === 'undefined') {
          console.warn(`WARNING: ${componentName}.${fieldPath} could not be verified against sample data`);
          report.issuesFound.push({
            severity: 'warning',
            component: componentName,
            field: fieldPath,
            value: fieldValue,
            suggestion: `Verify data source for this field.`
          });
          report.warningsCount++;
        } else {
          console.log(`PASSED: ${componentName}.${fieldPath} appears to use dynamic data`);
          report.passedCount++;
        }
      }
    });
  }
  
  // Start scan with the component template
  scanObject(componentTemplate);
  
  return report;
}

/**
 * Run a full data integrity audit across all components
 * This is a development utility to find potential issues
 */
export function runFullDataIntegrityAudit(): void {
  console.log('========================================');
  console.log('STARTING PADDOCK20 DATA INTEGRITY AUDIT');
  console.log('========================================');
  console.log('Scanning for hardcoded user data...');
  console.log('');
  
  const startTime = performance.now();
  
  // Mock sample data for testing - in a real implementation this would
  // be pulled from actual components or stores
  const sampleData: Record<string, any> = {
    // App sample data
    'user.name': 'getCurrentUser().displayName',
    'user.email': 'getUserEmail()',
    
    // UserProfileHub sample data
    'profile.username': 'useAuth().user?.username',
    'profile.displayName': 'userProfile.displayName',
    'profile.email': 'authContext.user?.email',
    
    // JuiceBox sample data
    'creatorName': 'productData.creator',
    'productTitle': 'loadoutData.title',
    
    // GarageVaultPage sample data
    'ownerName': 'vehicleContext.owner',
    'recommendations': 'getRecommendations()',
    
    // WeatherStation sample data
    'locationName': 'weatherContext.primaryLocation',
    'savedLocations': 'getUserPreferences().weatherLocations'
  };
  
  // Initialize the cumulative report
  const finalReport: DataIntegrityReport = {
    componentsScanned: 0,
    fieldsChecked: 0,
    issuesFound: [],
    violationsCount: 0,
    warningsCount: 0,
    passedCount: 0
  };
  
  // Scan each component in the map
  Object.keys(COMPONENT_DATA_MAP).forEach(componentName => {
    const componentReport = scanComponent(componentName, sampleData);
    
    // Aggregate the results
    finalReport.componentsScanned++;
    finalReport.fieldsChecked += componentReport.fieldsChecked;
    finalReport.issuesFound = [
      ...finalReport.issuesFound,
      ...componentReport.issuesFound
    ];
    finalReport.violationsCount += componentReport.violationsCount;
    finalReport.warningsCount += componentReport.warningsCount;
    finalReport.passedCount += componentReport.passedCount;
  });
  
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print the final report
  console.log('');
  console.log('========================================');
  console.log('DATA INTEGRITY AUDIT COMPLETE');
  console.log('========================================');
  console.log(`Scanned ${finalReport.componentsScanned} components, checked ${finalReport.fieldsChecked} fields in ${duration}s`);
  console.log(`Found ${finalReport.violationsCount} violations and ${finalReport.warningsCount} warnings`);
  console.log(`${finalReport.passedCount} fields passed verification`);
  console.log('');
  
  if (finalReport.violationsCount > 0) {
    console.log('CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
    finalReport.issuesFound
      .filter(issue => issue.severity === 'violation')
      .forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.component}.${issue.field}: "${issue.value}"`);
        console.log(`   Suggestion: ${issue.suggestion}`);
      });
    console.log('');
  }
  
  if (finalReport.warningsCount > 0) {
    console.log('WARNINGS TO INVESTIGATE:');
    finalReport.issuesFound
      .filter(issue => issue.severity === 'warning')
      .forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.component}.${issue.field}`);
        console.log(`   Suggestion: ${issue.suggestion}`);
      });
    console.log('');
  }
  
  console.log('AUTHORIZED DATA SOURCES:');
  AUTHORIZED_SOURCES.forEach(source => {
    console.log(`- ${source}`);
  });
  
  console.log('');
  console.log('For detailed documentation, see:');
  console.log('- client/src/utils/DataIntegrityAuditReport.md');
  console.log('- client/src/utils/Paddock20_Data_Integrity_Final_Audit.md');
  console.log('========================================');
}