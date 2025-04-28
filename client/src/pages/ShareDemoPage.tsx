import React, { useState } from 'react';
import SocialShareButtons from '@/components/ui/SocialShareButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample images for demo
const sampleImages = [
  'https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
];

const ShareDemoPage: React.FC = () => {
  // Demo state
  const [url, setUrl] = useState(window.location.href);
  const [title, setTitle] = useState('Check out this amazing car at Paddock20!');
  const [description, setDescription] = useState('Explore the exclusive automotive world on Paddock20, the premier destination for true car enthusiasts.');
  const [image, setImage] = useState(sampleImages[0]);
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showLabels, setShowLabels] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'facebook', 'twitter', 'linkedin', 'pinterest', 'reddit', 'whatsapp', 'email', 'copy'
  ]);

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-orbitron text-blue-400 mb-4">
            Social Sharing Demo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test our no-authentication social sharing functionality with various configuration options.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Configuration Panel */}
          <div>
            <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-700 p-6">
              <h2 className="text-xl font-orbitron text-blue-400 mb-6">Configure Share Options</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="share-url">URL to Share</Label>
                  <Input
                    id="share-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://paddock20.replit.app"
                    className="mt-1 bg-gray-800 border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="share-title">Title</Label>
                  <Input
                    id="share-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Check out this amazing car!"
                    className="mt-1 bg-gray-800 border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="share-description">Description</Label>
                  <Textarea
                    id="share-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A detailed description of what you're sharing..."
                    className="mt-1 bg-gray-800 border-gray-600 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="share-image">Image URL</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2 mb-2">
                    {sampleImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`cursor-pointer border-2 rounded overflow-hidden ${img === image ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => setImage(img)}
                      >
                        <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-24 object-cover" />
                      </div>
                    ))}
                  </div>
                  <Input
                    id="share-image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 bg-gray-800 border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="button-size" className="block mb-2">Button Size</Label>
                  <Select value={size} onValueChange={(val) => setSize(val as any)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-labels"
                    checked={showLabels}
                    onCheckedChange={setShowLabels}
                  />
                  <Label htmlFor="show-labels">Show Button Labels</Label>
                </div>
                
                <div>
                  <Label className="block mb-2">Platforms to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['facebook', 'twitter', 'pinterest', 'linkedin', 'reddit', 'whatsapp', 'email', 'copy'].map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Switch
                          id={`platform-${platform}`}
                          checked={selectedPlatforms.includes(platform)}
                          onCheckedChange={() => togglePlatform(platform)}
                        />
                        <Label htmlFor={`platform-${platform}`} className="capitalize">{platform}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Preview Panel */}
          <div>
            <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-700 p-6">
              <h2 className="text-xl font-orbitron text-blue-400 mb-6">Preview</h2>
              
              <div className="space-y-8">
                <div className="bg-black/50 rounded-xl p-6 border border-gray-800">
                  <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt="Share preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 mb-4">{description}</p>
                  
                  <div className="text-sm text-gray-500 mb-6 truncate">
                    {url}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="text-lg text-blue-400 mb-4">Share Options</h4>
                    <SocialShareButtons
                      url={url}
                      title={title}
                      description={description}
                      image={image}
                      size={size}
                      showLabels={showLabels}
                      platforms={selectedPlatforms as any}
                    />
                  </div>
                </div>
                
                <div className="bg-black/50 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg text-blue-400 mb-4">Sample Usage in Other Components</h3>
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-2">Minimal</h4>
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <SocialShareButtons
                        url={url}
                        title={title}
                        platforms={['facebook', 'twitter', 'whatsapp', 'copy']}
                        size="sm"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <code>{'<SocialShareButtons url={url} title={title} platforms={["facebook", "twitter", "whatsapp", "copy"]} size="sm" />'}</code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">With Labels</h4>
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <SocialShareButtons
                        url={url}
                        title={title}
                        platforms={['facebook', 'twitter', 'email']}
                        showLabels={true}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <code>{'<SocialShareButtons url={url} title={title} platforms={["facebook", "twitter", "email"]} showLabels={true} />'}</code>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDemoPage;