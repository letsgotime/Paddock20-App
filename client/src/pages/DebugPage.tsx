import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { runFullDataIntegrityAudit } from '../utils/runDataIntegrityAudit';
import { DataIntegrityConsole } from '../utils/auditConsole';
import { AlertTriangle, Check, ClipboardCheck, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const DebugPage = () => {
  const [auditResults, setAuditResults] = useState<string[]>([]);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditCompleted, setAuditCompleted] = useState(false);
  
  const runAudit = () => {
    setIsRunningAudit(true);
    setAuditResults([]);
    
    // Store console logs during audit run
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const auditLogs: string[] = [];
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      auditLogs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      auditLogs.push('ERROR: ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    
    // Run the audit
    try {
      runFullDataIntegrityAudit();
    } catch (error) {
      console.error('Audit failed:', error);
    }
    
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Set results with a slight delay to show loading state
    setTimeout(() => {
      setAuditResults(auditLogs);
      setIsRunningAudit(false);
      setAuditCompleted(true);
    }, 1500);
  };
  
  // Function to parse audit logs and get counts
  const getAuditSummary = () => {
    if (!auditCompleted) return null;
    
    const issues = auditResults.filter(log => log.includes('WARNING') || log.includes('ERROR'));
    const violations = auditResults.filter(log => log.includes('INTEGRITY VIOLATION'));
    const checks = auditResults.filter(log => log.includes('CHECKING'));
    
    return {
      total: auditResults.length,
      checks: checks.length,
      issues: issues.length,
      violations: violations.length,
      passed: checks.length - issues.length - violations.length
    };
  };
  
  const summary = getAuditSummary();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Paddock20 Debug Console</h1>
      
      <Tabs defaultValue="data-integrity" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="data-integrity">Data Integrity Audit</TabsTrigger>
          <TabsTrigger value="documentation">Audit Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-integrity" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
                  Data Integrity Verification
                </CardTitle>
                <CardDescription>
                  Run a comprehensive audit to verify all data flows properly from authorized sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={runAudit} 
                  disabled={isRunningAudit}
                  className="mb-4"
                >
                  {isRunningAudit ? 'Running Audit...' : 'Run Full Data Integrity Audit'}
                </Button>
                
                {auditCompleted && summary && (
                  <Alert className={
                    summary.violations > 0 
                      ? 'bg-destructive/20 border-destructive' 
                      : 'bg-success/20 border-success'
                  }>
                    <div className="flex items-start">
                      {summary.violations > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      ) : (
                        <Check className="h-4 w-4 text-success mt-0.5" />
                      )}
                      <div className="ml-2">
                        <AlertTitle>
                          {summary.violations > 0 
                            ? `${summary.violations} Data Integrity Violations Found` 
                            : 'All Data Integrity Checks Passed'}
                        </AlertTitle>
                        <AlertDescription>
                          <div className="mt-1 text-sm">
                            <p>Total checks: {summary.checks}</p>
                            <p>Issues detected: {summary.issues}</p>
                            <p>Integrity violations: {summary.violations}</p>
                            <p>Passed checks: {summary.passed}</p>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
                
                {auditResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2">Audit Log:</h3>
                    <div className="bg-black/30 text-sm font-mono p-4 rounded-md h-[400px] overflow-y-auto">
                      {auditResults.map((log, index) => {
                        // Style log entries based on content
                        let className = "py-1";
                        if (log.includes('ERROR') || log.includes('INTEGRITY VIOLATION')) {
                          className += " text-destructive";
                        } else if (log.includes('WARNING')) {
                          className += " text-amber-400";
                        } else if (log.includes('SUCCESS') || log.includes('PASSED')) {
                          className += " text-green-400";
                        }
                        
                        return (
                          <div key={index} className={className}>
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Source Requirements</CardTitle>
                <CardDescription>
                  All data must come from authorized sources only
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="user-data">
                    <AccordionTrigger>User Data Sources</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>User Onboarding</li>
                        <li>Authentication Context</li>
                        <li>User Profile Storage</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="vehicle-data">
                    <AccordionTrigger>Vehicle Data Sources</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Garage Vault</li>
                        <li>Vehicle Context</li>
                        <li>Vehicle Data Context</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="media-data">
                    <AccordionTrigger>Media Data Sources</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>MyGallery (bi-directional)</li>
                        <li>Gallery Context</li>
                        <li>Media API Responses</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="product-data">
                    <AccordionTrigger>Product Data Sources</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Juice Box</li>
                        <li>Product Database</li>
                        <li>Loadout Configurations</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <Separator className="my-4" />
                
                <div className="text-sm p-3 bg-amber-500/20 rounded-md">
                  <h4 className="font-semibold flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" /> Never Hardcode
                  </h4>
                  <p className="mt-1">
                    Any user, vehicle, or product information must always come from an authorized data source. 
                    Zero hardcoded content permitted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Interactive Data Integrity Console</CardTitle>
              <CardDescription>
                Run individual checks on specific components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataIntegrityConsole />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Data Integrity Audit Documentation
              </CardTitle>
              <CardDescription>
                Complete documentation on data integrity requirements and verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <h2>Paddock20 Data Integrity Framework</h2>
                
                <p>
                  The Paddock20 application follows strict data integrity principles to ensure 
                  all user-facing data comes from authorized sources only, with zero hardcoded content.
                </p>
                
                <h3>Core Requirements</h3>
                
                <ul>
                  <li><strong>No hardcoded user data</strong> anywhere in the application</li>
                  <li><strong>All data must flow from authorized sources</strong> through proper channels</li>
                  <li><strong>Fallback mechanisms</strong> must use system constants, not user-specific values</li>
                  <li><strong>Clear data provenance</strong> for all information displayed in the UI</li>
                </ul>
                
                <h3>Authorized Data Sources</h3>
                
                <ol>
                  <li>
                    <strong>User Onboarding</strong> - Primary source for all user preferences and profile data
                  </li>
                  <li>
                    <strong>MyGallery</strong> - Bi-directional database for user media across the application
                  </li>
                  <li>
                    <strong>Garage Vault</strong> - Central repository for all vehicle information and settings
                  </li>
                  <li>
                    <strong>Juice Box</strong> - Source for all detailing products, checklists, and procedures
                  </li>
                </ol>
                
                <h3>Data Flow Architecture</h3>
                
                <p>
                  Data must flow from authorized sources through proper context providers to components:
                </p>
                
                <pre className="bg-black/30 p-3 rounded">
                  Source → Context Provider → Component Props → UI Elements
                </pre>
                
                <h3>Key Verification Tools</h3>
                
                <ul>
                  <li><code>runDataIntegrityAudit.ts</code> - Comprehensive scan for issues</li>
                  <li><code>DataIntegrityVerifier.ts</code> - Helper for accessing data properly</li>
                  <li><code>auditConsole.tsx</code> - Interactive verification interface</li>
                </ul>
                
                <h3>Documentation</h3>
                
                <p>Complete documentation is available in the following files:</p>
                
                <ul>
                  <li><code>DataIntegrityAuditReport.md</code> - Overall audit findings and process</li>
                  <li><code>Paddock20_Data_Integrity_Final_Audit.md</code> - Final audit certification</li>
                </ul>
                
                <h3>Best Practices</h3>
                
                <ol>
                  <li>Always use context providers to pass data to components</li>
                  <li>Implement proper error states that don't fall back to hardcoded content</li>
                  <li>Use the DataIntegrityVerifier utility to safely access user data</li>
                  <li>Run audits regularly during development to catch issues early</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="text-sm text-muted-foreground">
                <p>For detailed implementation guidelines, refer to the audit reports in the utils directory.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugPage;