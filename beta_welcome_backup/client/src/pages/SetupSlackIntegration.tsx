import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Globe,
  MessageSquare,
  RefreshCw,
  Shield,
  Slack,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';

const SetupSlackIntegration = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [formData, setFormData] = useState({
    botToken: '',
    channelId: '',
    signingSecret: '',
  });
  const [copied, setCopied] = useState('');
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Get Slack integration status
  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/slack/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  // Test Slack integration
  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/slack/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to test Slack integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Test message sent successfully!',
        description: 'Your Slack integration is working properly.',
        variant: 'default',
      });
      queryClient.invalidateQueries({queryKey: ['/api/slack/status']});
    },
    onError: (error: Error) => {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Save Slack integration
  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/slack/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save Slack integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Slack integration saved',
        description: 'Your Slack integration has been configured successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({queryKey: ['/api/slack/status']});
      
      // Move to the test tab
      setActiveTab('test');
    },
    onError: (error: Error) => {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };
  
  const handleTestConnection = () => {
    testMutation.mutate();
  };
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    
    toast({
      title: 'Copied to clipboard',
      description: 'The value has been copied to your clipboard.',
      variant: 'default',
    });
    
    setTimeout(() => setCopied(''), 2000);
  };
  
  const getStatusIndicator = () => {
    if (isLoading) {
      return (
        <div className="flex items-center text-muted-foreground">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Checking status...
        </div>
      );
    }
    
    if (!status) {
      return (
        <div className="flex items-center text-amber-500">
          <AlertCircle className="mr-2 h-4 w-4" />
          Status unavailable
        </div>
      );
    }
    
    if (status.connected) {
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Connected
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-red-500">
        <AlertCircle className="mr-2 h-4 w-4" />
        Not connected
      </div>
    );
  };
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center">
        <div className="mr-4 p-2 rounded-full bg-[#4A154B] bg-opacity-10">
          <Slack className="h-8 w-8 text-[#4A154B]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slack Integration</h1>
          <p className="text-muted-foreground">
            Connect PADDOCK20 to your Slack workspace to share vehicle updates and events
          </p>
        </div>
        <div className="ml-auto">
          {getStatusIndicator()}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Slack Integration</CardTitle>
              <CardDescription>
                Learn how Slack integration enhances your PADDOCK20 experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-primary bg-opacity-10 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Share Vehicle Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically post new vehicle additions and updates to your team's Slack channel
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-primary bg-opacity-10 p-2 rounded-full">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Track Day Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Share track day events, race schedules, and meetups with your entire team
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-primary bg-opacity-10 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Your Slack credentials are securely stored and only used for authorized actions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 bg-primary bg-opacity-10 p-2 rounded-full">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Easy Setup</h3>
                    <p className="text-sm text-muted-foreground">
                      Quick 3-step process to connect your Slack workspace to PADDOCK20
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Getting started</AlertTitle>
                <AlertDescription>
                  To use Slack integration, you'll need to create a Slack app in your workspace and generate API credentials.
                  Click the "Setup" tab for step-by-step instructions.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="default" onClick={() => setActiveTab('setup')}>
                Continue to Setup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Setup Slack Integration</CardTitle>
              <CardDescription>
                Follow these steps to connect PADDOCK20 with your Slack workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Create a Slack App</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center">
                    Slack API Apps Page <ExternalLink className="ml-1 h-3 w-3" />
                  </a></li>
                  <li>Click "Create New App" and select "From scratch"</li>
                  <li>Enter "PADDOCK20" as App Name and select your workspace</li>
                  <li>Click "Create App"</li>
                </ol>

                <Separator className="my-4" />
                
                <h3 className="text-lg font-medium">Step 2: Add Permissions</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>In the left sidebar, click "OAuth & Permissions"</li>
                  <li>Scroll down to "Scopes" and add these Bot Token Scopes:
                    <ul className="list-disc pl-5 mt-2">
                      <li>chat:write</li>
                      <li>channels:read</li>
                      <li>chat:write.public</li>
                    </ul>
                  </li>
                  <li>Scroll up and click "Install to Workspace"</li>
                  <li>Review the permissions and click "Allow"</li>
                  <li>Copy the "Bot User OAuth Token" that starts with "xoxb-"</li>
                </ol>

                <Separator className="my-4" />
                
                <h3 className="text-lg font-medium">Step 3: Configure Channel and Secrets</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Create or select a Slack channel for PADDOCK20 notifications</li>
                  <li>Get the channel ID by right-clicking the channel and copying the ID from the URL</li>
                  <li>From your Slack App settings, go to "Basic Information" and copy the "Signing Secret"</li>
                </ol>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <div className="flex">
                    <Input
                      id="botToken"
                      name="botToken"
                      value={formData.botToken}
                      onChange={handleInputChange}
                      placeholder="xoxb-your-bot-token"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard('xoxb-5156981603956-8871982599123-07b4e9d29a2c2f7260ea22ac2f5c7071', 'botToken')}
                    >
                      {copied === 'botToken' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The Bot User OAuth Token from the OAuth & Permissions page
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="channelId">Channel ID</Label>
                  <div className="flex">
                    <Input
                      id="channelId"
                      name="channelId"
                      value={formData.channelId}
                      onChange={handleInputChange}
                      placeholder="C012AB3CD"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard('C012AB3CD', 'channelId')}
                    >
                      {copied === 'channelId' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The ID of the channel where notifications will be posted
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signingSecret">Signing Secret</Label>
                  <div className="flex">
                    <Input
                      id="signingSecret"
                      name="signingSecret"
                      value={formData.signingSecret}
                      onChange={handleInputChange}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard('ced2f5ef85b2434f1907be2205fe006e', 'signingSecret')}
                    >
                      {copied === 'signingSecret' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The Signing Secret from the Basic Information page
                  </p>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('about')}>
                Back
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Slack Integration</CardTitle>
              <CardDescription>
                Verify your Slack integration is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Integration Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Connection:</span>
                    <span className={`text-sm font-medium ${status?.connected ? 'text-green-500' : 'text-red-500'}`}>
                      {status?.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Channel:</span>
                    <span className="text-sm font-medium">
                      {status?.channel || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Last Message:</span>
                    <span className="text-sm font-medium">
                      {status?.lastMessageTimestamp 
                        ? new Date(status.lastMessageTimestamp).toLocaleString() 
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              
              {status?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {status.error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <p>Send a test message to verify your integration is working properly:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Ensures your Bot Token has the correct permissions</li>
                  <li>Verifies your channel ID is correct</li>
                  <li>Tests that your Signing Secret works for verification</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('setup')}>
                Back to Setup
              </Button>
              <Button 
                onClick={handleTestConnection}
                disabled={testMutation.isPending || !status?.connected}
              >
                {testMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Test Message'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SetupSlackIntegration;