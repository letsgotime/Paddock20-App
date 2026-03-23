import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, FileText, Folder } from 'lucide-react';
import PageTitle from '../components/PageTitle';

interface FileIssue {
  path: string;
  expectedName: string;
  actualName: string;
  type: 'naming' | 'import';
}

/**
 * CaseValidatorPage
 * 
 * A utility page that checks for file naming convention issues in the application
 * to help identify and fix case sensitivity problems that can cause routing errors.
 */
const CaseValidatorPage: React.FC = () => {
  const [issues, setIssues] = useState<FileIssue[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // This would normally be an API call to the server to perform file system checks
    // For this demo, we'll simulate the results with common issues in the codebase
    
    const simulatedScan = async () => {
      setLoading(true);
      
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add any known issues (this would be dynamic in the real implementation)
      const detectedIssues: FileIssue[] = [
        {
          path: 'client/src/pages/Weather.tsx and client/src/pages/Weather.jsx',
          expectedName: 'WeatherPage.tsx (single file)',
          actualName: 'Weather.tsx and Weather.jsx (duplicate)',
          type: 'naming'
        },
        {
          path: 'client/src/App.tsx',
          expectedName: 'import WeatherPage from "./pages/weather-page";',
          actualName: 'import Weather from "./pages/weather-page";\nimport WeatherPage from "./pages/weather-page";',
          type: 'import'
        },
        {
          path: 'client/src/pages/Home.tsx and client/src/pages/Home.jsx',
          expectedName: 'HomePage.tsx (single file)',
          actualName: 'Home.tsx and Home.jsx (duplicate)',
          type: 'naming'
        },
        {
          path: 'client/src/App.tsx',
          expectedName: 'import HomePage from "@/pages/home-page";',
          actualName: 'import Home from "@/pages/home";\n...\nimport HomePage from "./pages/Home";',
          type: 'import'
        },
        {
          path: 'client/src/pages/api-explorer-page.tsx',
          expectedName: 'ApiExplorerPage.tsx',
          actualName: 'api-explorer-page.tsx',
          type: 'naming'
        }
      ];
      
      setIssues(detectedIssues);
      setLoading(false);
    };
    
    simulatedScan();
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <PageTitle title="File Naming Validator" />
      
      <div className="mb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-blue-900/40 p-6">
        <h1 className="text-2xl font-bold text-carolina-blue mb-2">File Naming Validator</h1>
        <p className="text-gray-300">
          This utility checks for file naming convention issues that can cause routing problems in the application.
          Page components should follow PascalCase and end with "Page.tsx" for consistency.
        </p>
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/40 rounded-md">
          <h3 className="font-semibold text-carolina-blue mb-2">Safe Fix Strategy</h3>
          <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-2">
            <li>Rename inconsistent files to follow the convention (<code className="bg-gray-700 px-1 rounded">*Page.tsx</code>)</li>
            <li>Update imports in App.tsx to match the new filenames</li>
            <li>Fix routes in App.tsx to point to the correct components</li>
            <li>Remove duplicate files when one consistent version works</li>
          </ol>
        </div>
      </div>
      
      <div className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-md border border-gray-700">
        <h2 className="text-lg font-semibold text-carolina-blue mb-2 flex items-center">
          <Folder className="h-5 w-5 mr-2" />
          Naming Convention Rules
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-6">
          <li>Page components should be named in PascalCase (e.g., <code className="bg-gray-700 px-1 rounded">WeatherPage.tsx</code>)</li>
          <li>Page imports should match the filename exactly (case-sensitive)</li>
          <li>The 404 page should be named <code className="bg-gray-700 px-1 rounded">NotFound.tsx</code></li>
          <li>Related component files should follow a consistent pattern</li>
        </ul>
      </div>
      
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-md border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-lg font-semibold text-white">Scan Results</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-300">Scanning for naming issues...</span>
          </div>
        ) : (
          <>
            {issues.length === 0 ? (
              <div className="p-6 flex items-center text-green-500">
                <CheckCircle className="h-6 w-6 mr-3" />
                <span className="text-lg">No naming convention issues found!</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {issues.map((issue, index) => (
                  <div key={index} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 mr-2" />
                      <div>
                        <h3 className="font-medium text-white">
                          {issue.type === 'naming' ? 'File Naming Issue' : 'Import Path Issue'}
                        </h3>
                        <p className="text-gray-400 text-sm">{issue.path}</p>
                      </div>
                    </div>
                    
                    <div className="ml-7 mt-2 space-y-2">
                      <div className="bg-gray-800 p-2 rounded text-sm">
                        <div className="text-gray-400 mb-1">Current:</div>
                        <div className="text-red-400 font-mono">{issue.actualName}</div>
                      </div>
                      
                      <div className="bg-gray-800 p-2 rounded text-sm">
                        <div className="text-gray-400 mb-1">Expected:</div>
                        <div className="text-green-400 font-mono">{issue.expectedName}</div>
                      </div>
                      
                      {issue.type === 'naming' && (
                        <div className="bg-gray-900 p-2 rounded text-xs text-gray-300 mt-2">
                          <span className="text-carolina-blue font-semibold">Fix: </span> 
                          Rename the file using <code className="bg-gray-700 px-1 rounded">mv {issue.actualName} {issue.expectedName}</code>
                        </div>
                      )}
                      
                      {issue.type === 'import' && (
                        <div className="bg-gray-900 p-2 rounded text-xs text-gray-300 mt-2">
                          <span className="text-carolina-blue font-semibold">Fix: </span> 
                          Update the import statement in the file
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="my-6 p-4 bg-gray-900 rounded-md border border-gray-700">
        <h3 className="font-semibold text-carolina-blue mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Implementation Plan
        </h3>
        <div className="text-gray-300 space-y-2">
          <p className="text-sm">To fix these issues without breaking functionality, follow this approach:</p>
          <ol className="list-decimal list-inside text-sm ml-4 space-y-1">
            <li>Create normalized files with consistent naming (PascalCase with Page suffix)</li>
            <li>Update App.tsx routes to point to new components</li>
            <li>Verify everything works</li>
            <li>Remove duplicate/old files in a separate cleanup step</li>
          </ol>
          <p className="text-xs mt-4 text-gray-400">
            This approach maintains existing functionality while gradually migrating to a consistent naming convention.
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-gray-400 text-sm">
        <p>
          <FileText className="inline h-4 w-4 mr-1 mb-1" />
          Note: This is a static visualization tool. In a full implementation, this would connect to a 
          server-side process to scan the actual files in the repository.
        </p>
      </div>
    </div>
  );
};

export default CaseValidatorPage;