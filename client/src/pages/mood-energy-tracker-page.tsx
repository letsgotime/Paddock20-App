import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type MoodEntry = {
  id: string;
  date: Date;
  mood: number;
  energy: number;
  notes: string;
  tags: string[];
  drivingConditions?: string;
  weatherImpact?: number;
};

/**
 * Mood & Energy Tracker Page
 * 
 * Allows the user to track their mood and energy levels over time, 
 * particularly in relation to driving experiences and automotive events.
 */
export default function MoodEnergyTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<number>(7);
  const [energy, setEnergy] = useState<number>(6);
  const [notes, setNotes] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const availableTags = [
    'Track Day', 'Commute', 'Road Trip', 'Modification', 'Maintenance',
    'Car Show', 'Group Drive', 'Canyon Run', 'Detailing'
  ];
  
  // Sample data - would come from API in real implementation
  const moodHistory: MoodEntry[] = [
    {
      id: '1',
      date: new Date(2025, 4, 8), // May 8, 2025
      mood: 9,
      energy: 8,
      notes: 'Amazing track day at Nashville Superspeedway. The new tires made a huge difference!',
      tags: ['Track Day', 'Modification'],
      drivingConditions: 'Dry track, 72°F',
      weatherImpact: 2
    },
    {
      id: '2',
      date: new Date(2025, 4, 6), // May 6, 2025
      mood: 5,
      energy: 4,
      notes: 'Heavy traffic on commute. Noticed some vibration in the steering wheel.',
      tags: ['Commute', 'Maintenance'],
      drivingConditions: 'Rainy, 68°F',
      weatherImpact: -1
    },
    {
      id: '3',
      date: new Date(2025, 4, 1), // May 1, 2025
      mood: 8,
      energy: 7,
      notes: 'Did a full detail on the car. The new ceramic coating looks incredible!',
      tags: ['Detailing'],
      drivingConditions: 'Clear, 75°F',
      weatherImpact: 1
    }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would save to an API
    toast({
      title: "Entry Saved",
      description: `Mood and energy recorded for ${selectedDate.toLocaleDateString()}`,
    });
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-carolina-blue mb-6">MOOD & ENERGY TRACKER</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calendar and History */}
        <div className="lg:col-span-1">
          <Card className="bg-black/80 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Calendar</CardTitle>
              <CardDescription>Select a date to view or add entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="border border-gray-800 rounded-md p-3 bg-black/40"
              />
            </CardContent>
          </Card>
          
          <Card className="bg-black/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Recent History</CardTitle>
              <CardDescription>Your recent mood and energy entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {moodHistory.map(entry => (
                <div key={entry.id} className="p-3 border border-gray-800 rounded-md bg-black/40 hover:border-carolina-blue/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-400">{entry.date.toLocaleDateString()}</span>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-950/70 text-carolina-blue">
                        M: {entry.mood}/10
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-950/70 text-gotime-green">
                        E: {entry.energy}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2 text-gray-300">{entry.notes}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Entry Form */}
        <div className="lg:col-span-2">
          <Card className="bg-black/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">New Entry for {selectedDate.toLocaleDateString()}</CardTitle>
              <CardDescription>Track your mood and energy for automotive activities</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Mood (1-10)
                    <span className="ml-2 text-carolina-blue font-bold">{mood}</span>
                  </label>
                  <Slider
                    value={[mood]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setMood(value[0])}
                    className="mb-6"
                  />
                  
                  <div className="grid grid-cols-10 gap-1 text-xs text-gray-400 mb-6">
                    <div className="text-center">1</div>
                    <div className="text-center">2</div>
                    <div className="text-center">3</div>
                    <div className="text-center">4</div>
                    <div className="text-center">5</div>
                    <div className="text-center">6</div>
                    <div className="text-center">7</div>
                    <div className="text-center">8</div>
                    <div className="text-center">9</div>
                    <div className="text-center">10</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Energy (1-10)
                    <span className="ml-2 text-gotime-green font-bold">{energy}</span>
                  </label>
                  <Slider
                    value={[energy]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setEnergy(value[0])}
                    className="mb-6"
                  />
                  
                  <div className="grid grid-cols-10 gap-1 text-xs text-gray-400 mb-6">
                    <div className="text-center">1</div>
                    <div className="text-center">2</div>
                    <div className="text-center">3</div>
                    <div className="text-center">4</div>
                    <div className="text-center">5</div>
                    <div className="text-center">6</div>
                    <div className="text-center">7</div>
                    <div className="text-center">8</div>
                    <div className="text-center">9</div>
                    <div className="text-center">10</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Activity Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedTags.includes(tag)
                            ? 'bg-carolina-blue/20 text-carolina-blue border border-carolina-blue/40'
                            : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-800 bg-black/40 text-white focus:ring-carolina-blue focus:border-carolina-blue"
                    rows={4}
                    placeholder="How was your driving experience today? Anything notable about your car's performance?"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="bg-carolina-blue hover:bg-carolina-blue/80">
                    Save Entry
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
            <Tabs defaultValue="weekly">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="correlation">Correlations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="p-4 border border-gray-800 rounded-md bg-black/40">
                <h3 className="font-medium text-carolina-blue mb-3">Weekly Summary</h3>
                <p className="text-gray-300">Your average mood this week is 7.3/10, which is higher than last week's 6.8/10.</p>
                <p className="text-gray-300 mt-2">Your driving energy has been consistent, averaging 6.3/10.</p>
              </TabsContent>
              
              <TabsContent value="monthly" className="p-4 border border-gray-800 rounded-md bg-black/40">
                <h3 className="font-medium text-carolina-blue mb-3">Monthly Progress</h3>
                <p className="text-gray-300">May shows an upward trend in both mood and energy compared to April.</p>
                <p className="text-gray-300 mt-2">Track days have consistently resulted in your highest mood scores.</p>
              </TabsContent>
              
              <TabsContent value="correlation" className="p-4 border border-gray-800 rounded-md bg-black/40">
                <h3 className="font-medium text-carolina-blue mb-3">Interesting Correlations</h3>
                <p className="text-gray-300">
                  Weather appears to influence your driving mood significantly. 
                  Clear, sunny days correlate with a 23% increase in your reported mood scores.
                </p>
                <p className="text-gray-300 mt-2">
                  Recent vehicle modifications have resulted in consistently higher energy levels during drives.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}