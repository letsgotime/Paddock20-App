import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Settings, 
  Trophy, 
  Star, 
  Heart, 
  MapPin, 
  Car,
  Calendar,
  Music,
  BarChart3,
  LogOut,
  Lock
} from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuth } from '@/context/AuthContext';
import { useSpotify } from '@/contexts/SpotifyContext';

/**
 * UserProfileSection Component
 * 
 * Displays user profile information including:
 * - Personal details
 * - Driving stats
 * - Achievements
 * - Spotify integration status
 * - Login/Logout controls
 */
export default function UserProfileSection() {
  const userProfile = useUserProfile();
  const auth = useAuth();
  const spotify = useSpotify();
  const [activeTab, setActiveTab] = useState('profile');
  
  const isSpotifyConnected = spotify?.connected || false;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-blue-400 font-orbitron text-sm">DRIVER PROFILE</h3>
        <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white p-1">
          <Settings size={16} />
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-900/30 flex items-center justify-center">
          {userProfile?.avatar ? (
            <img 
              src={userProfile.avatar} 
              alt="Profile" 
              className="h-full w-full object-cover rounded-full border-2 border-blue-500/30" 
            />
          ) : (
            <User size={40} className="text-blue-500" />
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-medium text-white">
            {userProfile?.fullName || auth?.user?.firstName || auth?.user?.username || 'Driver'}
          </h2>
          <p className="text-gray-400">
            {userProfile?.drivingExperience || 'Automotive Enthusiast'}
          </p>
          
          <div className="flex space-x-2 mt-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
              Premium
            </Badge>
            {isSpotifyConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
                Spotify
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="profile" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 bg-black/50 mb-4">
          <TabsTrigger value="profile" className="text-xs">PROFILE</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">STATS</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs">ACHIEVEMENTS</TabsTrigger>
          <TabsTrigger value="connected" className="text-xs">CONNECTED</TabsTrigger>
        </TabsList>
        
        {/* PROFILE TAB */}
        <TabsContent value="profile" className="m-0 space-y-3">
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">BIO</p>
                  <p className="text-white text-sm">
                    {userProfile?.bio || "No bio available"}
                  </p>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div>
                  <p className="text-gray-400 text-xs mb-1">LOCATION</p>
                  <div className="flex items-center">
                    <MapPin size={14} className="text-blue-400 mr-1" />
                    <p className="text-white text-sm">
                      {userProfile?.location || "Location not specified"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs mb-1">INTERESTS</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.interests && userProfile.interests.length > 0 ? (
                      userProfile.interests.map((interest, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-blue-500/10 text-gray-300 border-blue-500/30"
                        >
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No interests specified</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="border-gray-700 text-white hover:bg-blue-500/10 hover:text-blue-400 justify-start"
            >
              <User size={16} className="mr-2" /> Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-700 text-white hover:bg-blue-500/10 hover:text-blue-400 justify-start"
            >
              <Lock size={16} className="mr-2" /> Privacy
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-700 text-white hover:bg-blue-500/10 hover:text-blue-400 justify-start"
              onClick={() => {
                if (auth?.logout) auth.logout();
              }}
            >
              <LogOut size={16} className="mr-2" /> Log Out
            </Button>
          </div>
        </TabsContent>
        
        {/* STATS TAB */}
        <TabsContent value="stats" className="m-0 space-y-3">
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-300 text-sm">Driver Score</p>
                    <p className="text-white font-mono">
                      {userProfile?.driverScore || '89'}/100
                    </p>
                  </div>
                  <Progress value={89} className="h-2 bg-gray-800" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">DRIVES LOGGED</p>
                    <p className="text-xl font-mono text-white">
                      {userProfile?.drivesLogged || '0'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">TOTAL MILES</p>
                    <p className="text-xl font-mono text-white">
                      {userProfile?.totalDistance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">FAVORITE ROADS</p>
                    <p className="text-xl font-mono text-white">
                      {userProfile?.favoriteRoads?.length || '0'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">DRIVING STREAK</p>
                    <p className="text-xl font-mono text-white">
                      {userProfile?.currentStreak || '0'} days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            className="w-full justify-center text-blue-400 border-blue-500/20 hover:bg-blue-800/10"
          >
            <BarChart3 size={16} className="mr-2" /> View Detailed Statistics
          </Button>
        </TabsContent>
        
        {/* ACHIEVEMENTS TAB */}
        <TabsContent value="achievements" className="m-0">
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-400 text-sm font-orbitron">ACHIEVEMENTS</CardTitle>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
                  {userProfile?.achievements?.length || '0'} Unlocked
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {userProfile?.achievements && userProfile.achievements.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {userProfile.achievements.map((achievement, index) => (
                    <div 
                      key={achievement.id || index} 
                      className="bg-black/30 p-3 rounded-md border border-blue-500/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Trophy size={20} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{achievement.name}</p>
                          <p className="text-gray-400 text-xs">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy size={32} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-white">No achievements yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Complete drives and activities to earn achievements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* CONNECTED SERVICES TAB */}
        <TabsContent value="connected" className="m-0 space-y-3">
          <Card className="bg-gradient-to-r from-green-900/30 to-black border-green-800/30">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-green-400 text-sm font-orbitron flex items-center">
                  <Music size={16} className="mr-2" />
                  SPOTIFY
                </CardTitle>
                <Badge variant="outline" className={`${isSpotifyConnected ? 'bg-green-500/10 text-green-300 border-green-500/30' : 'bg-gray-500/10 text-gray-300 border-gray-500/30'}`}>
                  {isSpotifyConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isSpotifyConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {spotify?.user?.image ? (
                      <img 
                        src={spotify.user.image} 
                        alt="Spotify" 
                        className="h-12 w-12 rounded object-cover" 
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-green-500/20 flex items-center justify-center">
                        <Music size={24} className="text-green-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{spotify?.user?.name || 'Spotify User'}</p>
                      <p className="text-gray-400 text-xs">{spotify?.user?.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">PLAYLISTS</p>
                    <p className="text-white">{spotify?.playlists?.length || '0'} playlists available</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-green-400 border-green-500/20 hover:bg-green-800/10"
                  >
                    Manage Spotify Connection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Music size={32} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-white">Spotify Not Connected</p>
                  <p className="text-gray-500 text-sm mt-1 mb-3">
                    Connect your Spotify account to access playlists for your drives
                  </p>
                  
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Connect Spotify
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-900/30 to-black border-blue-800/30">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-400 text-sm font-orbitron flex items-center">
                  <Car size={16} className="mr-2" />
                  SMARTCAR
                </CardTitle>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                  {userProfile?.connectedServices?.smartcar ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {userProfile?.connectedServices?.smartcar ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-blue-500/20 flex items-center justify-center">
                      <Car size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Vehicle Connected</p>
                      <p className="text-gray-400 text-xs">Real-time vehicle data available</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">LAST SYNC</p>
                    <p className="text-white">{new Date().toLocaleString()}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-blue-400 border-blue-500/20 hover:bg-blue-800/10"
                  >
                    Manage Vehicle Connection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Car size={32} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-white">Smartcar Not Connected</p>
                  <p className="text-gray-500 text-sm mt-1 mb-3">
                    Connect your vehicle for real-time data and diagnostics
                  </p>
                  
                  <Button 
                    variant="default" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Connect Vehicle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}