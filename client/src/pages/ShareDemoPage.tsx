import { useState } from 'react';
import SocialShareButtons from '@/components/ui/SocialShareButtons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function ShareDemoPage() {
  const [shareData, setShareData] = useState({
    url: window.location.href,
    title: document.title,
    description: 'The exclusive portal for car enthusiasts. Share your passion with the world!',
    image: 'https://paddock20.replit.app/favicon.png',
    hashtags: ['Paddock20', 'GoTime', 'Motorsports', 'CarEnthusiasts']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'hashtags') {
      setShareData({
        ...shareData,
        hashtags: value.split(',').map(tag => tag.trim())
      });
    } else {
      setShareData({
        ...shareData,
        [name]: value
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-4xl font-bold text-primary mb-8 font-orbitron">Social Sharing</h1>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="share">Share Content</TabsTrigger>
          <TabsTrigger value="slack">Slack Integration</TabsTrigger>
          <TabsTrigger value="settings">Social Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="share">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-black bg-opacity-90 border-gray-800">
              <CardHeader>
                <CardTitle className="text-primary">Share Your Content</CardTitle>
                <CardDescription>Customize what you'd like to share</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={shareData.title}
                    onChange={handleInputChange}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={shareData.description}
                    onChange={handleInputChange}
                    className="bg-gray-900 border-gray-700"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    value={shareData.url}
                    onChange={handleInputChange}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={shareData.image}
                    onChange={handleInputChange}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                  <Input
                    id="hashtags"
                    name="hashtags"
                    value={shareData.hashtags.join(', ')}
                    onChange={handleInputChange}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="text-sm text-gray-400">Share this content on your favorite platforms:</div>
                <SocialShareButtons 
                  url={shareData.url}
                  title={shareData.title}
                  description={shareData.description}
                  image={shareData.image}
                  hashtags={shareData.hashtags}
                  size="lg"
                />
              </CardFooter>
            </Card>

            <Card className="bg-black bg-opacity-90 border-gray-800">
              <CardHeader>
                <CardTitle className="text-primary">Preview</CardTitle>
                <CardDescription>How your content will appear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md bg-gray-900 p-4 border border-gray-800">
                  <h3 className="text-lg font-bold mb-2">{shareData.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{shareData.description}</p>
                  <div className="text-xs text-gray-500 truncate mb-2">{shareData.url}</div>
                  
                  {shareData.image && (
                    <div className="mt-4 rounded overflow-hidden">
                      <img 
                        src={shareData.image} 
                        alt="Share preview" 
                        className="max-w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/favicon.png';
                          (e.target as HTMLImageElement).style.width = '64px';
                          (e.target as HTMLImageElement).style.height = '64px';
                        }}
                      />
                    </div>
                  )}

                  {shareData.hashtags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {shareData.hashtags.map((tag, i) => (
                        <span key={i} className="text-primary text-xs px-2 py-1 bg-gray-800 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="slack">
          <Card className="bg-black bg-opacity-90 border-gray-800">
            <CardHeader>
              <CardTitle className="text-primary">Slack Integration</CardTitle>
              <CardDescription>Share directly to your Slack workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-900 rounded-md border border-gray-800">
                <h3 className="text-amber-400 mb-2">⚠️ Configuration Required</h3>
                <p className="text-sm text-gray-300 mb-4">
                  To enable Slack integration, you need to provide your Slack Bot Token and Channel ID in the environment variables.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slack-token" className="text-gray-400">SLACK_BOT_TOKEN</Label>
                    <Input
                      id="slack-token"
                      type="password"
                      placeholder="xoxb-..."
                      className="bg-gray-800 border-gray-700"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slack-channel" className="text-gray-400">SLACK_CHANNEL_ID</Label>
                    <Input
                      id="slack-channel"
                      placeholder="C123456789"
                      className="bg-gray-800 border-gray-700"
                      disabled
                    />
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <Button variant="outline" disabled>
                    Check Connection
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-md border border-gray-800">
                <h3 className="text-lg font-medium mb-2">Share to Slack</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Once configured, you can share vehicle profiles and events directly to your Slack workspace.
                </p>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" disabled>
                    Share Vehicle
                  </Button>
                  <Button variant="outline" disabled>
                    Share Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-black bg-opacity-90 border-gray-800">
            <CardHeader>
              <CardTitle className="text-primary">Social Media Settings</CardTitle>
              <CardDescription>Configure your sharing preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Default Platforms</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Facebook', 'Twitter', 'LinkedIn', 'Pinterest', 'Reddit', 'WhatsApp', 'Email', 'Copy'].map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={platform.toLowerCase()}
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 bg-gray-900 text-primary"
                        />
                        <Label htmlFor={platform.toLowerCase()}>{platform}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Default Hashtags</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Paddock20', 'GoTime', 'Motorsports', 'CarEnthusiasts'].map((tag) => (
                      <div key={tag} className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                        <span className="text-primary text-sm mr-2">#{tag}</span>
                        <button className="text-gray-400 hover:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a hashtag"
                      className="bg-gray-900 border-gray-700"
                    />
                    <Button variant="outline">Add</Button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90 text-black">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}