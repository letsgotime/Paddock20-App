/**
 * ⚠️ PREMIUM CONTENT PROTECTION ⚠️
 * 
 * WARNING: This file is part of the PDF Explorer core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the PDF functionality.
 * 
 * Last verified: May 07, 2025
 * 
 * PDF API Explorer Component
 * 
 * This component provides a user interface to explore the Web page to PDF API functionality:
 * - Convert any URL to a downloadable PDF
 * - Choose print or screenshot mode
 * - Select page size options
 * - Apply grayscale rendering
 * - Display API usage statistics
 */

import { useState, useEffect } from 'react';
import { pdfService, type PdfConversionOptions } from '@/services/utility/pdfService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileArchive, Download, File, RefreshCw, AlertTriangle } from 'lucide-react';

const PdfExplorer = () => {
  // Form state
  const [url, setUrl] = useState<string>('');
  const [isPrintMode, setIsPrintMode] = useState<boolean>(true);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'A3' | 'Legal'>('A4');
  
  // Results state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<'api' | 'cache' | null>(null);
  
  // API usage stats
  const [usageStats, setUsageStats] = useState<{
    requestsToday: number;
    dailyQuota: number;
    remainingRequests: number;
    percentageUsed: number;
    lastResetDate: Date;
    recentCalls: {
      timestamp: Date;
      url: string;
      cacheHit: boolean;
    }[];
  } | null>(null);
  
  // Cache stats
  const [cacheStats, setCacheStats] = useState<{
    entries: number;
    totalSizeMB: number;
  } | null>(null);
  
  // Check if we're near the quota limit
  const isNearQuota = usageStats ? usageStats.percentageUsed >= 75 : false;
  const hasReachedQuota = usageStats ? usageStats.percentageUsed >= 100 : false;
  
  // Get API usage on mount and after operations
  useEffect(() => {
    updateStats();
  }, []);
  
  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);
  
  // Update both usage and cache stats
  const updateStats = () => {
    try {
      setUsageStats(pdfService.getUsageStats());
      setCacheStats(pdfService.getCacheStats());
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };
  
  // Handle PDF conversion
  const handleConvertToPdf = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    if (hasReachedQuota) {
      setError('API quota exceeded. Try again tomorrow or use cached results.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPdfBlob(null);
    setPdfUrl(null);
    
    try {
      // Clean up URL if needed
      let processedUrl = url;
      if (!processedUrl.startsWith('http')) {
        processedUrl = 'https://' + processedUrl;
      }
      
      // Prepare options
      const options: PdfConversionOptions = {
        url: processedUrl,
        print: isPrintMode,
        grayscale: isGrayscale,
        pagesize: pageSize
      };
      
      // Convert to PDF
      const result = await pdfService.convertWebPageToPdf(options);
      
      // Update states
      setPdfBlob(result.pdfBlob);
      setApiSource(result.source);
      
      // Generate download URL
      const urlParts = new URL(processedUrl);
      const domain = urlParts.hostname.replace('www.', '');
      const filename = `${domain}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create download URL
      const url = URL.createObjectURL(result.pdfBlob);
      setPdfUrl(url);
      
      // Update stats after successful operation
      updateStats();
    } catch (error) {
      console.error('Error converting to PDF:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (!pdfBlob || !pdfUrl || !url) return;
    
    try {
      const urlParts = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlParts.hostname.replace('www.', '');
      const filename = `${domain}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };
  
  // Clear cache
  const handleClearCache = () => {
    pdfService.clearCache();
    updateStats();
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-6 w-6 text-primary" />
          Web Page to PDF API Explorer
        </CardTitle>
        <CardDescription>
          Convert any web page to a downloadable PDF
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="converter" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="converter">PDF Converter</TabsTrigger>
            <TabsTrigger value="stats">API Usage</TabsTrigger>
            <TabsTrigger value="cache">Cache Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="converter" className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="website-url"
                  placeholder="Enter a website URL (e.g., google.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Mode Selection */}
              <div className="space-y-2">
                <Label>Conversion Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="print-mode"
                    checked={isPrintMode}
                    onCheckedChange={setIsPrintMode}
                  />
                  <Label htmlFor="print-mode">
                    {isPrintMode ? 'Print Mode (vector with text)' : 'Screenshot Mode (pixel-perfect)'}
                  </Label>
                </div>
              </div>
              
              {/* Grayscale Option */}
              <div className="space-y-2">
                <Label>Rendering Options</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="grayscale"
                    checked={isGrayscale}
                    onCheckedChange={setIsGrayscale}
                  />
                  <Label htmlFor="grayscale">Grayscale Rendering</Label>
                </div>
              </div>
            </div>
            
            {/* Page Size Selection */}
            <div className="space-y-2">
              <Label htmlFor="page-size">Page Size</Label>
              <Select 
                value={pageSize} 
                onValueChange={(value) => setPageSize(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                  <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Convert Button */}
            <Button 
              className="w-full" 
              onClick={handleConvertToPdf} 
              disabled={isLoading || !url || hasReachedQuota}
            >
              {isLoading ? 'Converting...' : 'Convert to PDF'}
            </Button>
            
            {/* Quota Warning */}
            {isNearQuota && (
              <Alert className="mt-4 border-amber-500 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Usage Warning</AlertTitle>
                <AlertDescription>
                  You're nearing your daily API quota limit ({usageStats?.percentageUsed.toFixed(0)}% used). Results may come from cache.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Result Section */}
            {pdfBlob && pdfUrl && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">PDF Generated!</h3>
                    <p className="text-sm text-muted-foreground">
                      Source: {apiSource === 'api' ? 'Fresh from API' : 'Retrieved from cache'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Size: {(pdfBlob.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
                
                {/* PDF Embed (preview) */}
                <div className="border rounded-md overflow-hidden h-[400px]">
                  <iframe 
                    src={pdfUrl} 
                    className="w-full h-full" 
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">API Usage Statistics</h3>
              <Button variant="outline" size="sm" onClick={updateStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {usageStats && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Today's Usage:</span>
                    <span className="font-medium">
                      {usageStats.requestsToday} / {usageStats.dailyQuota} requests
                    </span>
                  </div>
                  <Progress value={usageStats.percentageUsed} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Remaining: {usageStats.remainingRequests} requests</span>
                    <span>Resets at midnight</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Recent API Calls</h4>
                  {usageStats.recentCalls.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">URL</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {usageStats.recentCalls.map((call, index) => (
                            <tr key={index} className="bg-card">
                              <td className="px-4 py-2 text-sm">
                                {formatDate(call.timestamp)}
                              </td>
                              <td className="px-4 py-2 text-sm truncate max-w-[200px]">
                                {call.url}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {call.cacheHit ? (
                                  <span className="text-green-600">Cache</span>
                                ) : (
                                  <span className="text-amber-600">API</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No API calls recorded yet</p>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="cache" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cache Information</h3>
              <Button variant="outline" size="sm" onClick={updateStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {cacheStats && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cache Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cacheStats.entries}</div>
                      <p className="text-xs text-muted-foreground">PDFs in cache</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cache Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cacheStats.totalSizeMB} MB</div>
                      <p className="text-xs text-muted-foreground">Total PDF data stored</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Cache Management</h4>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleClearCache}
                      disabled={cacheStats.entries === 0}
                    >
                      Clear Cache
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    PDFs are cached for 7 days to minimize API usage. Clearing the cache will remove all stored PDFs.
                  </p>
                </div>
                
                <Alert>
                  <File className="h-4 w-4" />
                  <AlertTitle>Cache Benefits</AlertTitle>
                  <AlertDescription>
                    Using the cache helps stay within API quotas. PDF documents are large binary files that don't change frequently, making them ideal for caching.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full text-xs text-muted-foreground">
          <p>
            This explorer uses APILayer's URL to PDF API, which allows converting any web URL into a downloadable PDF.
            PDFs are cached for 7 days to minimize API usage.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PdfExplorer;