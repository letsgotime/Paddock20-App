import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, CheckIcon, Copy, MessageSquareQuote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export default function SetupSlackIntegration() {
  const { toast } = useToast();
  const [slackStatus, setSlackStatus] = useState<{
    configured: boolean;
    message: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check Slack integration status on component mount
  useEffect(() => {
    checkSlackStatus();
  }, []);

  // Function to check Slack integration status
  const checkSlackStatus = async () => {
    setIsChecking(true);
    try {
      const response = await apiRequest("GET", "/api/social/slack/status");
      const data = await response.json();
      setSlackStatus(data);
    } catch (error) {
      console.error("Error checking Slack status:", error);
      toast({
        title: "Error",
        description: "Failed to check Slack integration status.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
      setIsLoading(false);
    }
  };

  // Copy redirect URI to clipboard
  const copyRedirectUri = () => {
    const url = window.location.origin;
    copyToClipboard(url);
    toast({
      title: "Copied!",
      description: "Redirect URI copied to clipboard.",
    });
  };

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Slack Integration Setup</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {slackStatus?.configured ? (
            <Alert className="mb-6 border-green-500 bg-green-500/10">
              <CheckIcon className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Slack Integration Active</AlertTitle>
              <AlertDescription>
                Your Slack integration is configured and working properly.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Slack Integration Not Configured</AlertTitle>
              <AlertDescription>
                Follow the steps below to set up Slack integration.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Create a Slack App</CardTitle>
                <CardDescription>Set up a new Slack app in your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary underline">Slack API: Applications</a></li>
                  <li>Click the "Create New App" button</li>
                  <li>Select "From scratch"</li>
                  <li>Enter "Paddock20" for the app name</li>
                  <li>Select your Slack workspace</li>
                  <li>Click "Create App"</li>
                </ol>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => window.open("https://api.slack.com/apps", "_blank")}>
                    Visit Slack API
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Set Permissions</CardTitle>
                <CardDescription>Add the required scopes for your app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li>In the sidebar, click on "OAuth & Permissions"</li>
                  <li>Scroll down to "Scopes" section</li>
                  <li>Under "Bot Token Scopes", click "Add an OAuth Scope"</li>
                  <li>Add the following scopes:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>chat:write</li>
                      <li>chat:write.public</li>
                      <li>files:write</li>
                    </ul>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Install the App to Your Workspace</CardTitle>
                <CardDescription>Authorize the app for your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li>Still in "OAuth & Permissions", scroll to the top</li>
                  <li>Click "Install to Workspace" button</li>
                  <li>Review the permissions and click "Allow"</li>
                  <li>After installation, you'll see a "Bot User OAuth Token" - copy this token</li>
                </ol>
                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium mb-2">Your Bot User OAuth Token will look something like:</p>
                  <div className="font-mono text-xs bg-background/50 p-2 rounded flex justify-between items-center">
                    <span>xoxb-1234567890123-1234567890123-abcdefghijklmnopqrstuvwx</span>
                    <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">This will be used as your SLACK_BOT_TOKEN</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Create a Channel and Get Channel ID</CardTitle>
                <CardDescription>Create or select a channel for notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li>In Slack, create a new channel (or use an existing one)</li>
                  <li>Invite your bot to the channel with <code>/invite @Paddock20</code></li>
                  <li>To get the Channel ID:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Right-click on the channel name</li>
                      <li>Select "Copy Link"</li>
                      <li>The last part of the URL after the last "/" is the Channel ID</li>
                    </ul>
                  </li>
                </ol>
                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium mb-2">Example Channel ID:</p>
                  <div className="font-mono text-xs bg-background/50 p-2 rounded flex justify-between items-center">
                    <span>C01AB2CDE3F</span>
                    <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">This will be used as your SLACK_CHANNEL_ID</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 5: Add Environment Variables</CardTitle>
                <CardDescription>Configure your app with the Slack credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The last step is to add the Bot Token and Channel ID to your environment variables:
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">SLACK_BOT_TOKEN</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 font-mono text-xs bg-background p-2 rounded">
                        xoxb-your-bot-token-here
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard("SLACK_BOT_TOKEN")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">SLACK_CHANNEL_ID</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 font-mono text-xs bg-background p-2 rounded">
                        C01AB2CDE3F
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard("SLACK_CHANNEL_ID")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={checkSlackStatus}
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Checking...
                      </>
                    ) : (
                      "Check Connection"
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      window.open("https://slack.com/help", "_blank");
                    }}
                  >
                    Slack Help Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}