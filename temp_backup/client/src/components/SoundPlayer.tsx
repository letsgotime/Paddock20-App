import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Play, Pause, SkipForward, SkipBack, RefreshCw } from 'lucide-react';
import { getAPIWarehouse } from '@/services/api';
import { SoundMetadata, SoundSearchResults } from '@/services/api/providers/sound';

interface SoundPlayerProps {
  className?: string;
}

/**
 * Sound Player component to play vehicle and racing sounds
 */
export function SoundPlayer({ className }: SoundPlayerProps) {
  const [soundCategory, setSoundCategory] = useState<'racing' | 'engine'>('racing');
  const [sounds, setSounds] = useState<SoundMetadata[]>([]);
  const [currentSoundIndex, setCurrentSoundIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState<number[]>([80]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element if it doesn't exist
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', handleSoundEnded);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleSoundEnded);
        audioRef.current = null;
      }
    };
  }, []);
  
  // Load sounds when category changes
  useEffect(() => {
    loadSounds();
  }, [soundCategory]);
  
  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current && volume.length > 0) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);
  
  // Update audio source when current sound changes
  useEffect(() => {
    if (currentSoundIndex >= 0 && currentSoundIndex < sounds.length) {
      const sound = sounds[currentSoundIndex];
      if (audioRef.current) {
        audioRef.current.src = sound.previews['preview-hq-mp3'];
        if (isPlaying) {
          audioRef.current.play().catch(error => {
            console.error('Error playing sound:', error);
            setIsPlaying(false);
          });
        }
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentSoundIndex, sounds]);
  
  // Update play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing sound:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Load sounds from API
  const loadSounds = async () => {
    setIsLoading(true);
    
    try {
      const apiWarehouse = getAPIWarehouse();
      let response;
      
      if (soundCategory === 'racing') {
        response = await apiWarehouse.requestData<SoundSearchResults>('sound', 'getRacingSounds', [{ pageSize: 10 }]);
      } else {
        response = await apiWarehouse.requestData<SoundSearchResults>('sound', 'getEngineSounds', [{ pageSize: 10 }]);
      }
      
      if (response.success && response.data) {
        setSounds(response.data.results);
        // Reset current sound index
        setCurrentSoundIndex(-1);
        setIsPlaying(false);
      } else {
        console.error('Failed to load sounds:', response.error);
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle audio playback end
  const handleSoundEnded = () => {
    // Auto-play next sound
    if (currentSoundIndex < sounds.length - 1) {
      setCurrentSoundIndex(currentSoundIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };
  
  // Play/pause toggle
  const togglePlay = () => {
    if (currentSoundIndex === -1 && sounds.length > 0) {
      setCurrentSoundIndex(0);
    }
    setIsPlaying(!isPlaying);
  };
  
  // Play next sound
  const playNext = () => {
    if (sounds.length === 0) return;
    
    if (currentSoundIndex < sounds.length - 1) {
      setCurrentSoundIndex(currentSoundIndex + 1);
    } else {
      setCurrentSoundIndex(0);
    }
    setIsPlaying(true);
  };
  
  // Play previous sound
  const playPrevious = () => {
    if (sounds.length === 0) return;
    
    if (currentSoundIndex > 0) {
      setCurrentSoundIndex(currentSoundIndex - 1);
    } else {
      setCurrentSoundIndex(sounds.length - 1);
    }
    setIsPlaying(true);
  };
  
  // Play selected sound
  const playSoundByIndex = (index: number) => {
    setCurrentSoundIndex(index);
    setIsPlaying(true);
  };
  
  // Render functions
  const renderSoundList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
        </div>
      );
    }
    
    if (sounds.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No sounds found. Try refreshing or changing category.
        </div>
      );
    }
    
    return (
      <div className="space-y-2 max-h-[300px] overflow-y-auto p-2">
        {sounds.map((sound, index) => (
          <div 
            key={sound.id}
            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
              index === currentSoundIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onClick={() => playSoundByIndex(index)}
          >
            <div className="mr-2">
              {index === currentSoundIndex && isPlaying ? (
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-medium truncate">{sound.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {sound.duration.toFixed(1)}s • {sound.username}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderPlayerControls = () => {
    const currentSound = currentSoundIndex >= 0 && currentSoundIndex < sounds.length 
      ? sounds[currentSoundIndex] 
      : null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 overflow-hidden">
            <div className="font-medium truncate">
              {currentSound ? currentSound.name : 'No sound selected'}
            </div>
            {currentSound && (
              <div className="text-xs text-gray-500">
                {currentSound.duration.toFixed(1)}s • {currentSound.username}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            disabled={sounds.length === 0}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
            disabled={sounds.length === 0}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            disabled={sounds.length === 0}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Paddock Sound System</CardTitle>
        <CardDescription>Listen to automotive and racing sounds</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <Select 
            value={soundCategory} 
            onValueChange={(value) => setSoundCategory(value as 'racing' | 'engine')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sound category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="racing">Racing Sounds</SelectItem>
              <SelectItem value="engine">Engine Sounds</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="player">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="sounds">Sound List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="player" className="p-4">
            {renderPlayerControls()}
          </TabsContent>
          
          <TabsContent value="sounds">
            {renderSoundList()}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={loadSounds}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh Sounds'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}