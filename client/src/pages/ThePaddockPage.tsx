import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import {
  Car, Calendar, Gauge, Users, LayoutDashboard, Heart, BarChart3
} from 'lucide-react';

/**
 * The Paddock Page - Main hub for the application
 * A consolidated command center for all user and vehicle information
 */
const ThePaddockPage: React.FC = () => {
  // Get user data
  const { user } = useAuth();
  
  // Format date in F1-style
  const formattedDate = format(new Date(), 'MMMM d, yyyy');
  
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header with title and user greeting */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="font-orbitron text-4xl mb-1 bg-gradient-to-br from-[#1982FC] to-[#08c519] bg-clip-text text-transparent">
                THE PADDOCK
              </h1>
              <p className="text-gray-400">
                {formattedDate} • Your personal motorsport command center
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {user && (
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/assets/avatar.png" />
                    <AvatarFallback className="bg-blue-900 text-white">
                      {user.username?.substring(0, 2).toUpperCase() || 'P2'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username || 'Driver'}</p>
                    <p className="text-sm text-gray-400">PADDOCK20 Member</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content in tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tab list */}
          <TabsList className="grid grid-cols-5 bg-gray-900 border border-gray-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-900/30">
              <LayoutDashboard size={16} className="mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-blue-900/30">
              <Car size={16} className="mr-2" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="data-[state=active]:bg-blue-900/30">
              <Heart size={16} className="mr-2" /> Lifestyle
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-900/30">
              <Users size={16} className="mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-900/30">
              <BarChart3 size={16} className="mr-2" /> Stats
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to The Paddock</CardTitle>
                <CardDescription>
                  Your comprehensive automotive hub for vehicle management, weather insights, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>The Paddock is your digital garage and motorsport command center. Here you can:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Monitor your vehicles and maintenance status</li>
                  <li>Check weather and road conditions for optimal driving</li>
                  <li>Track your drives and automotive adventures</li>
                  <li>Stay updated on motorsports events and news</li>
                  <li>Access your personal automotive dashboard</li>
                </ul>
                <div className="mt-4">
                  <Button 
                    className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                    onClick={() => window.location.href = '/add-vehicle'}
                  >
                    <Car className="mr-2 h-4 w-4" /> Add Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Vehicles</CardTitle>
                  <CardDescription>Manage your automotive collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-12">
                    <Car className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Vehicles Added Yet</h3>
                    <p className="text-gray-400 mb-4">Get started by adding your first vehicle</p>
                    <Button 
                      className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                      onClick={() => window.location.href = '/add-vehicle'}
                    >
                      <Car className="mr-2 h-4 w-4" /> Add Vehicle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle">
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle</CardTitle>
                <CardDescription>Sports, entertainment, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Coming soon: Integration with sports, movies, music, and jobs!</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your PADDOCK20 identity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="/assets/avatar.png" />
                    <AvatarFallback className="bg-blue-900 text-white text-2xl">
                      {user?.username?.substring(0, 2).toUpperCase() || 'P2'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-lg font-medium">{user?.username || 'Driver'}</h3>
                      <p className="text-gray-400">PADDOCK20 Member since {format(new Date(), 'MMMM yyyy')}</p>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Username</label>
                        <p>{user?.username || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <p>{user?.email || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.href = '/settings'}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Your automotive metrics and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Gauge className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Stats Available</h3>
                  <p className="text-gray-400">Add vehicles and record drives to start building your analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThePaddockPage;